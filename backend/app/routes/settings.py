from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Setting
from app.schemas.schemas import SystemSettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings_list = db.query(Setting).all()
    res = {}
    for s in settings_list:
        res[s.key] = s.value

    # Default fallback values if missing
    if "systemic_threshold" not in res:
        res["systemic_threshold"] = "3"
    if "time_window_minutes" not in res:
        res["time_window_minutes"] = "30"
    if "default_severity" not in res:
        res["default_severity"] = "HIGH"
    if "demo_mode" not in res:
        res["demo_mode"] = "true"

    return res

@router.put("")
def update_settings(update_data: SystemSettingsUpdate, db: Session = Depends(get_db)):
    # Update threshold
    s_thresh = db.query(Setting).filter(Setting.key == "systemic_threshold").first()
    if not s_thresh:
        s_thresh = Setting(key="systemic_threshold", value=str(update_data.threshold), description="Occurrence count threshold for systemic escalation")
        db.add(s_thresh)
    else:
        s_thresh.value = str(update_data.threshold)

    # Update time window
    s_win = db.query(Setting).filter(Setting.key == "time_window_minutes").first()
    if not s_win:
        s_win = Setting(key="time_window_minutes", value=str(update_data.time_window), description="Time window in minutes for occurrence check")
        db.add(s_win)
    else:
        s_win.value = str(update_data.time_window)

    db.commit()

    return {
        "systemic_threshold": str(update_data.threshold),
        "time_window_minutes": str(update_data.time_window),
        "message": "Rule engine parameters updated successfully!"
    }
