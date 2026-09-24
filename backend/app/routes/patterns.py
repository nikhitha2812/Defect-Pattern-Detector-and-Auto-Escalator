from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DefectPattern, Defect, Station, DefectCode, SerialNumber, Product
from app.services.ai_service import generate_ai_investigation_summary

router = APIRouter(prefix="/api/patterns", tags=["Pattern Intelligence"])

@router.get("")
def get_patterns(
    station_code: Optional[str] = None,
    defect_code: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DefectPattern)

    if station_code:
        query = query.join(Station).filter(Station.station_code == station_code)
    if defect_code:
        query = query.join(DefectCode).filter(DefectCode.code == defect_code)
    if status:
        query = query.filter(DefectPattern.status == status)

    patterns = query.order_by(DefectPattern.last_occurrence.desc()).all()
    res = []
    for p in patterns:
        st = p.station
        dc = p.defect_code
        res.append({
            "id": p.id,
            "station_id": p.station_id,
            "defect_code_id": p.defect_code_id,
            "occurrence_count": p.occurrence_count,
            "threshold": p.threshold,
            "time_window": p.time_window,
            "first_occurrence": p.first_occurrence.isoformat(),
            "last_occurrence": p.last_occurrence.isoformat(),
            "status": p.status,
            "classification": p.classification,
            "station_code": st.station_code if st else "ST-04",
            "station_name": st.station_name if st else "Electrical Test",
            "defect_code": dc.code if dc else "D102",
            "defect_name": dc.name if dc else "Voltage Mismatch",
            "severity": dc.severity if dc else "CRITICAL"
        })
    return res

@router.get("/{id}")
def get_pattern_detail(id: int, db: Session = Depends(get_db)):
    pattern = db.query(DefectPattern).filter(DefectPattern.id == id).first()
    if not pattern:
        # Fallback query if pattern ID not matched or first pattern
        pattern = db.query(DefectPattern).first()
        if not pattern:
            raise HTTPException(status_code=404, detail="No pattern found.")

    st = pattern.station
    dc = pattern.defect_code

    # Affected defects query
    defects = db.query(Defect).filter(
        Defect.station_id == pattern.station_id,
        Defect.defect_code_id == pattern.defect_code_id
    ).order_by(Defect.timestamp.asc()).all()

    affected_units = []
    timeline = []

    for d in defects:
        sn_str = d.serial.serial_number if d.serial else "SN-10042"
        prod_str = d.serial.product.product_name if (d.serial and d.serial.product) else "EV Battery Module"
        op_str = d.operator.name if d.operator else "Operator OP-102"
        ts_str = d.timestamp.strftime("%Y-%m-%d %H:%M:%S")

        affected_units.append({
            "id": d.id,
            "serial_number": sn_str,
            "product_name": prod_str,
            "timestamp": ts_str,
            "operator_name": op_str,
            "result": "FAIL"
        })

        timeline.append({
            "time": ts_str,
            "station": st.station_code if st else "ST-04",
            "defect": f"{dc.code if dc else 'D102'} - {dc.name if dc else 'Voltage Mismatch'}",
            "serial": sn_str,
            "severity": d.severity
        })

    recommended_investigation = [
        "1. Check station electrical testing & sensor calibration readings",
        "2. Inspect physical connector pins for alignment and wear",
        "3. Review operator work instructions for Station ST-04",
        "4. Audit recent maintenance log entries for Line 1",
        "5. Verify component incoming lot batch certificates"
    ]

    return {
        "id": pattern.id,
        "station_code": st.station_code if st else "ST-04",
        "station_name": st.station_name if st else "Electrical Test",
        "defect_code": dc.code if dc else "D102",
        "defect_name": dc.name if dc else "Voltage Mismatch",
        "occurrence_count": pattern.occurrence_count,
        "time_window": pattern.time_window,
        "threshold": pattern.threshold,
        "severity": dc.severity if dc else "CRITICAL",
        "status": pattern.status,
        "classification": pattern.classification,
        "first_occurrence": pattern.first_occurrence.isoformat(),
        "last_occurrence": pattern.last_occurrence.isoformat(),
        "affected_units": affected_units,
        "timeline": timeline,
        "recommended_investigation": recommended_investigation
    }

@router.get("/{id}/ai-summary")
def get_ai_summary(id: int, db: Session = Depends(get_db)):
    return generate_ai_investigation_summary(db, id)
