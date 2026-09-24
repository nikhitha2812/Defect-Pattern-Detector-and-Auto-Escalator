from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import DefectCreate
from app.services.rule_engine import process_defect_submission
from app.seed import run_seed
from app.websocket import manager

router = APIRouter(prefix="/api/demo", tags=["Hackathon Demo Mode"])

@router.post("/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    run_seed(db)
    return {"message": "Database reset to preloaded hackathon state successfully!"}

@router.post("/simulate-sequence")
async def simulate_demo_sequence(db: Session = Depends(get_db)):
    # Pre-packaged sequence of 3 defects targeting ST-04 / D102
    results = []
    for i in range(1, 4):
        serial_num = f"SN-DEMO-100{i}"
        d_create = DefectCreate(
            station_code="ST-04",
            defect_code="D102",
            serial_number=serial_num,
            product_code="EV-BATTERY-200",
            operator_code="OP-102",
            description=f"Voltage Mismatch detected on cell module pair {i}",
            severity="HIGH"
        )
        res = process_defect_submission(db, d_create)
        results.append({
            "step": i,
            "serial": serial_num,
            "classification": res["classification"],
            "is_systemic": res["is_systemic"],
            "actions_taken": res["actions_taken"],
            "ncr_number": res["ncr_created"].ncr_number if res["ncr_created"] else None
        })

    ws_payload = {
        "event_type": "DEMO_SEQUENCE_COMPLETED",
        "results": results
    }
    await manager.broadcast(ws_payload)

    return {
        "message": "Demo sequence executed successfully! Systemic escalation triggered.",
        "results": results
    }
