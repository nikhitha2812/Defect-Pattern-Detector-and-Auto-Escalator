from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import NCR, Station, Product, Defect
from app.schemas.schemas import NCRUpdate

router = APIRouter(prefix="/api/ncrs", tags=["NCR Management"])

def format_ncr(n: NCR) -> dict:
    return {
        "id": n.id,
        "ncr_number": n.ncr_number,
        "defect_id": n.defect_id,
        "station_id": n.station_id,
        "product_id": n.product_id,
        "severity": n.severity,
        "description": n.description,
        "created_at": n.created_at.isoformat(),
        "status": n.status,
        "assigned_to": n.assigned_to,
        "root_cause": n.root_cause,
        "corrective_action": n.corrective_action,
        "preventive_action": n.preventive_action,
        "due_date": n.due_date.isoformat() if n.due_date else None,
        "station_code": n.station.station_code if n.station else "ST-04",
        "station_name": n.station.station_name if n.station else "Electrical Test",
        "product_name": n.product.product_name if n.product else "EV Battery Module",
        "defect_name": n.defect.defect_code.name if (n.defect and n.defect.defect_code) else "Voltage Mismatch"
    }

@router.get("")
def get_ncrs(
    status: Optional[str] = None,
    station_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(NCR)
    if status:
        query = query.filter(NCR.status == status)
    if station_code:
        query = query.join(Station).filter(Station.station_code == station_code)

    ncrs = query.order_by(NCR.created_at.desc()).all()
    return [format_ncr(n) for n in ncrs]

@router.get("/{id}")
def get_ncr(id: int, db: Session = Depends(get_db)):
    ncr = db.query(NCR).filter(NCR.id == id).first()
    if not ncr:
        raise HTTPException(status_code=404, detail="NCR not found.")
    return format_ncr(ncr)

@router.put("/{id}")
def update_ncr(id: int, update_data: NCRUpdate, db: Session = Depends(get_db)):
    ncr = db.query(NCR).filter(NCR.id == id).first()
    if not ncr:
        raise HTTPException(status_code=404, detail="NCR not found.")

    if update_data.status:
        ncr.status = update_data.status
    if update_data.assigned_to:
        ncr.assigned_to = update_data.assigned_to
    if update_data.root_cause:
        ncr.root_cause = update_data.root_cause
    if update_data.corrective_action:
        ncr.corrective_action = update_data.corrective_action
    if update_data.preventive_action:
        ncr.preventive_action = update_data.preventive_action

    db.commit()
    db.refresh(ncr)
    return format_ncr(ncr)
