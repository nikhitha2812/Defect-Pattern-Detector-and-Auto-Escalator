import datetime
import random
from sqlalchemy.orm import Session
from app.models.models import (
    Defect, DefectCode, Station, SerialNumber, Product, Operator,
    NCR, Ticket, Alert, DefectPattern, Setting, Inspection
)
from app.schemas.schemas import DefectCreate

def get_setting_int(db: Session, key: str, default_val: int) -> int:
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting and setting.value:
        try:
            return int(setting.value)
        except ValueError:
            pass
    return default_val

def process_defect_submission(db: Session, defect_in: DefectCreate):
    # 1. Resolve or Create Station
    station = db.query(Station).filter(Station.station_code == defect_in.station_code).first()
    if not station:
        station = Station(
            station_code=defect_in.station_code,
            station_name=f"Station {defect_in.station_code}",
            line="Line 1",
            operation="Manufacturing Test",
            status="GREEN"
        )
        db.add(station)
        db.flush()

    # 2. Resolve or Create Defect Code
    defect_code = db.query(DefectCode).filter(DefectCode.code == defect_in.defect_code).first()
    if not defect_code:
        # Check if code starts with D2 (unknown) vs D1 (known)
        is_known = not defect_in.defect_code.startswith("D2")
        defect_code = DefectCode(
            code=defect_in.defect_code,
            name=f"Defect {defect_in.defect_code}",
            description=defect_in.description or "Manufacturing anomaly detected during quality check.",
            severity=defect_in.severity or "HIGH",
            known=is_known,
            documented_solution="Recalibrate station testing equipment and rerun diagnostic." if is_known else None
        )
        db.add(defect_code)
        db.flush()

    # 3. Resolve or Create Product
    prod_code = defect_in.product_code or "EV-BATTERY-200"
    product = db.query(Product).filter(Product.product_code == prod_code).first()
    if not product:
        product = Product(
            product_code=prod_code,
            product_name="EV Battery Pack 200kWh",
            category="EV Battery Module",
            status="ACTIVE"
        )
        db.add(product)
        db.flush()

    # 4. Resolve or Create Serial Number
    serial = db.query(SerialNumber).filter(SerialNumber.serial_number == defect_in.serial_number).first()
    if not serial:
        serial = SerialNumber(
            serial_number=defect_in.serial_number,
            product_id=product.id,
            batch_number="BATCH-2026-09",
            status="REJECTED"
        )
        db.add(serial)
        db.flush()
    else:
        serial.status = "REJECTED"

    # 5. Resolve Operator
    op_code = defect_in.operator_code or "OP-102"
    operator = db.query(Operator).filter(Operator.employee_code == op_code).first()
    if not operator:
        operator = db.query(Operator).first()

    # 6. Create Base Defect Record
    now = datetime.datetime.utcnow()
    defect = Defect(
        defect_code_id=defect_code.id,
        serial_id=serial.id,
        station_id=station.id,
        operator_id=operator.id if operator else None,
        description=defect_in.description or defect_code.description,
        timestamp=now,
        severity=defect_in.severity or defect_code.severity or "HIGH",
        status="OPEN",
        photo_url=defect_in.photo_url or "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
        classification="KNOWN"
    )
    db.add(defect)
    db.flush()

    # Also log an Inspection failure
    inspection = Inspection(
        serial_id=serial.id,
        station_id=station.id,
        inspection_type="Automated Sentinel Check",
        result="FAIL",
        measured_value="Out of Tolerance",
        expected_value="Nominal Range",
        timestamp=now
    )
    db.add(inspection)

    # 7. Category Classification & Rule Engine Execution
    actions_taken = []
    ticket_created_obj = None
    ncr_created_obj = None
    alert_created_obj = None

    # Check if defect is Known vs Unknown
    is_known = defect_code.known and bool(defect_code.documented_solution and defect_code.documented_solution.strip())
    if not is_known:
        defect.classification = "UNKNOWN"
        # Auto-create Engineering Ticket for unknown defects
        ticket_num = f"TICKET-{random.randint(1000, 9999)}"
        ticket_created_obj = Ticket(
            ticket_number=ticket_num,
            defect_id=defect.id,
            serial_id=serial.id,
            station_id=station.id,
            description=f"Unknown Defect {defect_code.code} - {defect_code.name}: {defect.description or 'No documented solution'}",
            created_at=now,
            priority="HIGH" if defect.severity in ["HIGH", "CRITICAL"] else "MEDIUM",
            status="OPEN",
            assigned_to="Field Quality Engineer"
        )
        db.add(ticket_created_obj)
        db.flush()
        actions_taken.append(f"Auto-created Engineering Ticket {ticket_num} for unknown defect.")

        # Create alert for unknown defect
        alert_obj = Alert(
            alert_type="UNKNOWN_DEFECT",
            title=f"Unknown Defect: {defect_code.code}",
            message=f"Unknown defect '{defect_code.name}' detected at station {station.station_code} on serial {serial.serial_number}. Automatic ticket created.",
            severity="WARNING",
            station_id=station.id,
            defect_code_id=defect_code.id,
            created_at=now,
            recipient_role="FIELD_ENGINEER"
        )
        db.add(alert_obj)
        alert_created_obj = alert_obj
        actions_taken.append("Created alert for Field Quality Engineer.")
    else:
        defect.classification = "KNOWN"
        actions_taken.append("Classified as Known Defect with documented resolution.")

    # 8. Check Configurable Systemic Pattern Rule
    threshold = get_setting_int(db, "systemic_threshold", 3)
    time_window_mins = get_setting_int(db, "time_window_minutes", 30)

    window_start = now - datetime.timedelta(minutes=time_window_mins)
    
    # Query recent occurrences of SAME station AND SAME defect code in the window
    recent_count = db.query(Defect).filter(
        Defect.station_id == station.id,
        Defect.defect_code_id == defect_code.id,
        Defect.timestamp >= window_start
    ).count()

    is_systemic = recent_count >= threshold

    if is_systemic:
        defect.classification = "SYSTEMIC"
        station.status = "RED"

        # Create or Update DefectPattern
        pattern = db.query(DefectPattern).filter(
            DefectPattern.station_id == station.id,
            DefectPattern.defect_code_id == defect_code.id,
            DefectPattern.status != "RESOLVED"
        ).first()

        if not pattern:
            first_occ = db.query(Defect.timestamp).filter(
                Defect.station_id == station.id,
                Defect.defect_code_id == defect_code.id,
                Defect.timestamp >= window_start
            ).order_by(Defect.timestamp.asc()).first()
            
            first_time = first_occ[0] if first_occ else now
            pattern = DefectPattern(
                station_id=station.id,
                defect_code_id=defect_code.id,
                occurrence_count=recent_count,
                threshold=threshold,
                time_window=time_window_mins,
                first_occurrence=first_time,
                last_occurrence=now,
                status="ESCALATED",
                classification="SYSTEMIC"
            )
            db.add(pattern)
        else:
            pattern.occurrence_count = recent_count
            pattern.last_occurrence = now
            pattern.threshold = threshold
            pattern.time_window = time_window_mins
            pattern.status = "ESCALATED"
        
        db.flush()

        # Create Non-Conformance Report (NCR)
        ncr_num = f"NCR-2026-{random.randint(1000, 9999)}"
        ncr_created_obj = NCR(
            ncr_number=ncr_num,
            defect_id=defect.id,
            station_id=station.id,
            product_id=product.id,
            severity="CRITICAL",
            description=f"SYSTEMIC PATTERN DETECTED: {recent_count} occurrences of '{defect_code.name}' ({defect_code.code}) at {station.station_code} within {time_window_mins} minutes.",
            created_at=now,
            status="OPEN",
            assigned_to="Quality Assurance Manager",
            root_cause="Pending Investigation",
            corrective_action="Inspect station calibration and review operator process.",
            preventive_action="Update line maintenance schedule."
        )
        db.add(ncr_created_obj)
        db.flush()
        actions_taken.append(f"Auto-escalated to SYSTEMIC! Created Non-Conformance Report {ncr_num}.")

        # Create Critical Alerts
        alert_sys1 = Alert(
            alert_type="SYSTEMIC_DEFECT",
            title=f"CRITICAL: Systemic Defect Pattern at {station.station_code}",
            message=f"Station {station.station_code} recorded {recent_count} occurrences of {defect_code.code} ({defect_code.name}) in {time_window_mins} mins (Threshold: {threshold}). Automated NCR created.",
            severity="CRITICAL",
            station_id=station.id,
            defect_code_id=defect_code.id,
            created_at=now,
            recipient_role="LINE_LEADER"
        )
        db.add(alert_sys1)

        alert_sys2 = Alert(
            alert_type="SYSTEMIC_DEFECT",
            title=f"ESCALATION: Line Leader & Field Engineer Alerted",
            message=f"Systemic issue at {station.station_code}. Affected serials identified. Immediate station inspection required.",
            severity="CRITICAL",
            station_id=station.id,
            defect_code_id=defect_code.id,
            created_at=now,
            recipient_role="FIELD_ENGINEER"
        )
        db.add(alert_sys2)
        db.flush()

        alert_created_obj = alert_sys1
        actions_taken.append("Sent Critical Alert to Line Leader.")
        actions_taken.append("Sent Critical Alert to Field Quality Engineer.")
        actions_taken.append("Flagged station status as CRITICAL (RED).")

    elif recent_count == threshold - 1:
        station.status = "YELLOW"
        actions_taken.append(f"Approaching systemic threshold ({recent_count}/{threshold} in {time_window_mins} mins). Flagged station as WARNING (YELLOW).")
        alert_warn = Alert(
            alert_type="THRESHOLD_WARNING",
            title=f"WARNING: Defect threshold approaching at {station.station_code}",
            message=f"{recent_count} occurrences of {defect_code.code} recorded at {station.station_code}. 1 more will trigger systemic escalation.",
            severity="WARNING",
            station_id=station.id,
            defect_code_id=defect_code.id,
            created_at=now,
            recipient_role="LINE_LEADER"
        )
        db.add(alert_warn)
        db.flush()
        alert_created_obj = alert_warn

    # Update station metrics
    total_defects_st = db.query(Defect).filter(Defect.station_id == station.id).count()
    station.defect_count = total_defects_st
    station.last_inspection = now

    db.commit()

    return {
        "defect": defect,
        "classification": defect.classification,
        "is_systemic": is_systemic,
        "is_unknown": not is_known,
        "is_known": is_known and not is_systemic,
        "actions_taken": actions_taken,
        "alert_created": alert_created_obj,
        "ncr_created": ncr_created_obj,
        "ticket_created": ticket_created_obj,
        "occurrence_count": recent_count,
        "threshold": threshold,
        "time_window": time_window_mins
    }
