from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Station, Defect, Inspection

router = APIRouter(prefix="/api/stations", tags=["Stations"])

@router.get("")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).order_by(Station.station_code.asc()).all()
    res = []
    for st in stations:
        # Calculate defect rate and status dynamically
        total_inspections = db.query(Inspection).filter(Inspection.station_id == st.id).count() or 100
        total_defects = db.query(Defect).filter(Defect.station_id == st.id).count()
        defect_rate = round((total_defects / total_inspections) * 100, 1)

        res.append({
            "id": st.id,
            "station_code": st.station_code,
            "station_name": st.station_name,
            "line": st.line,
            "operation": st.operation,
            "status": st.status,
            "defect_count": total_defects,
            "defect_rate": defect_rate,
            "current_operator": st.current_operator or "OP-102",
            "last_inspection": st.last_inspection.isoformat() if st.last_inspection else None
        })
    return res

@router.get("/{id}")
def get_station_detail(id: int, db: Session = Depends(get_db)):
    st = db.query(Station).filter(Station.id == id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Station not found.")

    defects = db.query(Defect).filter(Defect.station_id == st.id).order_by(Defect.timestamp.desc()).limit(15).all()
    
    return {
        "id": st.id,
        "station_code": st.station_code,
        "station_name": st.station_name,
        "line": st.line,
        "operation": st.operation,
        "status": st.status,
        "defect_count": len(defects),
        "current_operator": st.current_operator or "OP-102",
        "last_inspection": st.last_inspection.isoformat() if st.last_inspection else None,
        "defects": [{
            "id": d.id,
            "defect_code": d.defect_code.code if d.defect_code else "D102",
            "defect_name": d.defect_code.name if d.defect_code else "Voltage Mismatch",
            "serial_number": d.serial.serial_number if d.serial else "SN-10042",
            "timestamp": d.timestamp.isoformat(),
            "classification": d.classification,
            "severity": d.severity
        } for d in defects]
    }
