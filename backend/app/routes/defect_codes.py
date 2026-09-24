from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DefectCode

router = APIRouter(prefix="/api/defect-codes", tags=["Defect Knowledge Base"])

@router.get("")
def get_defect_codes(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DefectCode)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (DefectCode.code.ilike(s)) |
            (DefectCode.name.ilike(s)) |
            (DefectCode.description.ilike(s))
        )
    
    codes = query.all()
    return [{
        "id": dc.id,
        "code": dc.code,
        "name": dc.name,
        "description": dc.description,
        "severity": dc.severity,
        "known": dc.known,
        "documented_solution": dc.documented_solution
    } for dc in codes]
