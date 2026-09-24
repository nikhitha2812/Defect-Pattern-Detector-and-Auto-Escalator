from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Alert, Station

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

def format_alert(a: Alert) -> dict:
    return {
        "id": a.id,
        "alert_type": a.alert_type,
        "title": a.title,
        "message": a.message,
        "severity": a.severity,
        "station_id": a.station_id,
        "defect_code_id": a.defect_code_id,
        "created_at": a.created_at.isoformat(),
        "acknowledged": a.acknowledged,
        "recipient_role": a.recipient_role,
        "station_code": a.station.station_code if a.station else "ST-04"
    }

@router.get("")
def get_alerts(
    severity: Optional[str] = None,
    recipient_role: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if recipient_role:
        query = query.filter(Alert.recipient_role.in_([recipient_role, "ALL"]))
    if acknowledged is not None:
        query = query.filter(Alert.acknowledged == acknowledged)

    alerts = query.order_by(Alert.created_at.desc()).all()
    return [format_alert(a) for a in alerts]

@router.put("/{id}/ack")
def acknowledge_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.acknowledged = True
    db.commit()
    return format_alert(alert)
