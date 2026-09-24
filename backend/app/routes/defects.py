import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Defect, DefectCode, Station, SerialNumber, NCR, Ticket
from app.schemas.schemas import DefectCreate, DefectSchema
from app.services.rule_engine import process_defect_submission
from app.websocket import manager

router = APIRouter(prefix="/api/defects", tags=["Defects"])

def format_defect_detail(d: Defect) -> dict:
    return {
        "id": d.id,
        "defect_code_id": d.defect_code_id,
        "serial_id": d.serial_id,
        "station_id": d.station_id,
        "operator_id": d.operator_id,
        "description": d.description,
        "timestamp": d.timestamp.isoformat(),
        "severity": d.severity,
        "status": d.status,
        "photo_url": d.photo_url,
        "classification": d.classification,
        "station_code": d.station.station_code if d.station else "ST-04",
        "station_name": d.station.station_name if d.station else "Electrical Test",
        "defect_code": d.defect_code.code if d.defect_code else "D102",
        "defect_name": d.defect_code.name if d.defect_code else "Voltage Mismatch",
        "serial_number": d.serial.serial_number if d.serial else "SN-10042",
        "product_name": d.serial.product.product_name if (d.serial and d.serial.product) else "EV Battery Module",
        "operator_name": d.operator.name if d.operator else "Operator OP-102",
        "documented_solution": d.defect_code.documented_solution if d.defect_code else None
    }

@router.get("")
def get_defects(
    station_code: Optional[str] = None,
    defect_code: Optional[str] = None,
    classification: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Defect)

    if station_code:
        query = query.join(Station).filter(Station.station_code == station_code)
    if defect_code:
        query = query.join(DefectCode).filter(DefectCode.code == defect_code)
    if classification:
        query = query.filter(Defect.classification == classification)
    if severity:
        query = query.filter(Defect.severity == severity)
    if status:
        query = query.filter(Defect.status == status)

    defects = query.order_by(Defect.timestamp.desc()).all()
    
    res = [format_defect_detail(d) for d in defects]
    if search:
        s_lower = search.lower()
        res = [
            d for d in res if (
                s_lower in d["station_code"].lower() or
                s_lower in d["defect_code"].lower() or
                s_lower in d["defect_name"].lower() or
                s_lower in d["serial_number"].lower() or
                s_lower in (d["description"] or "").lower()
            )
        ]
    return res

@router.post("")
@router.post("/simulate")
async def create_or_simulate_defect(defect_in: DefectCreate, db: Session = Depends(get_db)):
    result = process_defect_submission(db, defect_in)
    defect = result["defect"]

    # Format output schema
    defect_formatted = format_defect_detail(defect)

    alert_formatted = None
    if result["alert_created"]:
        a = result["alert_created"]
        alert_formatted = {
            "id": a.id,
            "alert_type": a.alert_type,
            "title": a.title,
            "message": a.message,
            "severity": a.severity,
            "station_id": a.station_id,
            "created_at": a.created_at.isoformat(),
            "acknowledged": a.acknowledged,
            "recipient_role": a.recipient_role,
            "station_code": defect_in.station_code
        }

    ncr_formatted = None
    if result["ncr_created"]:
        n = result["ncr_created"]
        ncr_formatted = {
            "id": n.id,
            "ncr_number": n.ncr_number,
            "defect_id": n.defect_id,
            "station_id": n.station_id,
            "severity": n.severity,
            "description": n.description,
            "created_at": n.created_at.isoformat(),
            "status": n.status,
            "assigned_to": n.assigned_to,
            "station_code": defect_in.station_code,
            "defect_name": defect_formatted["defect_name"]
        }

    ticket_formatted = None
    if result["ticket_created"]:
        t = result["ticket_created"]
        ticket_formatted = {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "defect_id": t.defect_id,
            "serial_id": t.serial_id,
            "station_id": t.station_id,
            "description": t.description,
            "created_at": t.created_at.isoformat(),
            "priority": t.priority,
            "status": t.status,
            "assigned_to": t.assigned_to,
            "station_code": defect_in.station_code,
            "serial_number": defect_in.serial_number,
            "defect_name": defect_formatted["defect_name"],
            "defect_code": defect_in.defect_code
        }

    ws_payload = {
        "event_type": "NEW_DEFECT",
        "defect": defect_formatted,
        "classification": result["classification"],
        "is_systemic": result["is_systemic"],
        "actions_taken": result["actions_taken"],
        "alert": alert_formatted,
        "ncr": ncr_formatted,
        "ticket": ticket_formatted,
        "occurrence_count": result["occurrence_count"],
        "threshold": result["threshold"],
        "time_window": result["time_window"]
    }

    # Broadcast via WebSocket
    await manager.broadcast(ws_payload)

    return {
        "defect": defect_formatted,
        "classification": result["classification"],
        "is_systemic": result["is_systemic"],
        "is_unknown": result["is_unknown"],
        "is_known": result["is_known"],
        "actions_taken": result["actions_taken"],
        "alert_created": alert_formatted,
        "ncr_created": ncr_formatted,
        "ticket_created": ticket_formatted,
        "occurrence_count": result["occurrence_count"],
        "threshold": result["threshold"],
        "time_window": result["time_window"]
    }

@router.get("/{id}")
def get_defect_by_id(id: int, db: Session = Depends(get_db)):
    defect = db.query(Defect).filter(Defect.id == id).first()
    if not defect:
        raise HTTPException(status_code=404, detail="Defect not found.")
    
    formatted = format_defect_detail(defect)
    
    # Check for linked ticket or NCR
    ticket = db.query(Ticket).filter(Ticket.defect_id == defect.id).first()
    ncr = db.query(NCR).filter(NCR.defect_id == defect.id).first()

    formatted["linked_ticket"] = {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "status": ticket.status,
        "priority": ticket.priority
    } if ticket else None

    formatted["linked_ncr"] = {
        "id": ncr.id,
        "ncr_number": ncr.ncr_number,
        "status": ncr.status,
        "severity": ncr.severity
    } if ncr else None

    return formatted
