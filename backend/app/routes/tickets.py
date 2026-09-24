from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Ticket, Station, SerialNumber, Defect
from app.schemas.schemas import TicketUpdate

router = APIRouter(prefix="/api/tickets", tags=["Engineering Tickets"])

def format_ticket(t: Ticket) -> dict:
    return {
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
        "station_code": t.station.station_code if t.station else "ST-04",
        "station_name": t.station.station_name if t.station else "Electrical Test",
        "serial_number": t.serial.serial_number if t.serial else "SN-10042",
        "defect_code": t.defect.defect_code.code if (t.defect and t.defect.defect_code) else "D201",
        "defect_name": t.defect.defect_code.name if (t.defect and t.defect.defect_code) else "Unknown Fluctuation"
    }

@router.get("")
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    station_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if station_code:
        query = query.join(Station).filter(Station.station_code == station_code)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [format_ticket(t) for t in tickets]

@router.get("/{id}")
def get_ticket(id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return format_ticket(ticket)

@router.put("/{id}")
def update_ticket(id: int, update_data: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    if update_data.status:
        ticket.status = update_data.status
    if update_data.priority:
        ticket.priority = update_data.priority
    if update_data.assigned_to:
        ticket.assigned_to = update_data.assigned_to

    db.commit()
    db.refresh(ticket)
    return format_ticket(ticket)
