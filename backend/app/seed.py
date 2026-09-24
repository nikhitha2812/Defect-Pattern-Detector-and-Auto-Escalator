import datetime
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.models import (
    User, Product, Station, Operator, SerialNumber, DefectCode,
    Defect, Inspection, NCR, Ticket, Alert, DefectPattern, Setting
)

def run_seed(db: Session = None):
    should_close = False
    if db is None:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True
    else:
        # Clear existing tables content
        db.query(Alert).delete()
        db.query(NCR).delete()
        db.query(Ticket).delete()
        db.query(DefectPattern).delete()
        db.query(Inspection).delete()
        db.query(Defect).delete()
        db.query(SerialNumber).delete()
        db.query(Operator).delete()
        db.query(Station).delete()
        db.query(Product).delete()
        db.query(DefectCode).delete()
        db.query(User).delete()
        db.query(Setting).delete()
        db.commit()

    now = datetime.datetime.utcnow()

    # 1. Users
    users = [
        User(email="admin@forgesentinel.com", password_hash="hashed_admin", full_name="Admin Director", role="ADMIN"),
        User(email="engineer@forgesentinel.com", password_hash="hashed_engineer", full_name="Alex Rivera", role="ENGINEER"),
        User(email="manager@forgesentinel.com", password_hash="hashed_manager", full_name="Sarah Jenkins", role="QUALITY_MANAGER"),
        User(email="leader@forgesentinel.com", password_hash="hashed_leader", full_name="Carlos Ruiz", role="LINE_LEADER"),
        User(email="buyer@forgesentinel.com", password_hash="hashed_buyer", full_name="David Vance", role="BUYER"),
    ]
    db.add_all(users)
    db.flush()

    # 2. Products
    products = [
        Product(product_code="EV-BATTERY-200", product_name="EV Battery Pack 200kWh", version="v2.4", category="Battery Module", status="ACTIVE"),
        Product(product_code="MOTOR-X100", product_name="High-Efficiency Drive Motor X100", version="v1.1", category="Electric Powertrain", status="ACTIVE"),
        Product(product_code="CONTROLLER-500", product_name="Main Inverter Controller ECU-500", version="v3.0", category="Control Electronics", status="ACTIVE"),
        Product(product_code="INVERTER-300", product_name="Dual Power Inverter Module 300kW", version="v1.8", category="Power Distribution", status="ACTIVE"),
    ]
    db.add_all(products)
    db.flush()

    # 3. Stations
    stations = [
        Station(station_code="ST-01", station_name="Assembly Station", line="Line A", operation="Sub-Assembly", status="GREEN", defect_count=4, defect_rate=1.2, current_operator="OP-101", last_inspection=now - datetime.timedelta(minutes=5)),
        Station(station_code="ST-02", station_name="Welding Station", line="Line A", operation="Laser Weld", status="GREEN", defect_count=7, defect_rate=2.1, current_operator="OP-102", last_inspection=now - datetime.timedelta(minutes=3)),
        Station(station_code="ST-03", station_name="Visual Inspection", line="Line A", operation="AOI Inspection", status="GREEN", defect_count=3, defect_rate=0.8, current_operator="OP-103", last_inspection=now - datetime.timedelta(minutes=12)),
        Station(station_code="ST-04", station_name="Electrical Test", line="Line A", operation="HV Diagnostic", status="YELLOW", defect_count=15, defect_rate=4.5, current_operator="OP-104", last_inspection=now - datetime.timedelta(minutes=2)),
        Station(station_code="ST-05", station_name="Final Assembly", line="Line B", operation="Enclosure Casing", status="GREEN", defect_count=8, defect_rate=1.9, current_operator="OP-105", last_inspection=now - datetime.timedelta(minutes=15)),
        Station(station_code="ST-06", station_name="Functional Test", line="Line B", operation="EOL Performance", status="GREEN", defect_count=5, defect_rate=1.1, current_operator="OP-106", last_inspection=now - datetime.timedelta(minutes=8)),
        Station(station_code="ST-07", station_name="Packaging", line="Line B", operation="Palletizing", status="GREEN", defect_count=2, defect_rate=0.4, current_operator="OP-107", last_inspection=now - datetime.timedelta(minutes=20)),
    ]
    db.add_all(stations)
    db.flush()

    st_map = {st.station_code: st for st in stations}
    pr_map = {p.product_code: p for p in products}

    # 4. Operators
    operators = [
        Operator(employee_code="OP-101", name="Marcus Vance", station_id=st_map["ST-01"].id, shift="Shift A"),
        Operator(employee_code="OP-102", name="Elena Rostova", station_id=st_map["ST-02"].id, shift="Shift B"),
        Operator(employee_code="OP-103", name="Chen Wei", station_id=st_map["ST-03"].id, shift="Shift A"),
        Operator(employee_code="OP-104", name="Priya Sharma", station_id=st_map["ST-04"].id, shift="Shift B"),
        Operator(employee_code="OP-105", name="John Miller", station_id=st_map["ST-05"].id, shift="Shift C"),
        Operator(employee_code="OP-106", name="Sofia Garcia", station_id=st_map["ST-06"].id, shift="Shift A"),
        Operator(employee_code="OP-107", name="David Kim", station_id=st_map["ST-07"].id, shift="Shift B"),
    ]
    db.add_all(operators)
    db.flush()
    op_map = {op.employee_code: op for op in operators}

    # 5. Defect Codes (Known & Unknown)
    defect_codes = [
        DefectCode(code="D101", name="Surface Scratch", description="Cosmetic anomaly on outer protective casing.", severity="LOW", known=True, documented_solution="Buff surface with micro-fine abrasive cloth and apply touch-up sealant."),
        DefectCode(code="D102", name="Voltage Mismatch", description="Electrical test voltage outside designated 400V tolerance threshold.", severity="HIGH", known=True, documented_solution="Recalibrate electrical testing equipment and repeat inspection."),
        DefectCode(code="D103", name="Connector Misalignment", description="High-voltage harness pins displaced during insertion.", severity="MEDIUM", known=True, documented_solution="Realign connector harness pins and ensure primary locking tabs click into position."),
        DefectCode(code="D104", name="Weld Temperature High", description="Laser welding thermal sensor exceeded safe operating limit.", severity="HIGH", known=True, documented_solution="Adjust laser pulse duration down by 5% and inspect cooling fluid flow rate."),
        DefectCode(code="D105", name="Torque Failure", description="Fastener torque achieved below 45Nm specification.", severity="MEDIUM", known=True, documented_solution="Recalibrate pneumatic torque driver to 45Nm tolerance spec."),
        DefectCode(code="D201", name="Unknown Current Fluctuation", description="Transient noise burst detected on sensor line during EOL testing.", severity="HIGH", known=False, documented_solution=None),
        DefectCode(code="D202", name="Unexpected Sensor Error", description="Unregistered telemetry code returned from internal BMS controller.", severity="CRITICAL", known=False, documented_solution=None),
    ]
    db.add_all(defect_codes)
    db.flush()
    dc_map = {dc.code: dc for dc in defect_codes}

    # 6. Serial Numbers
    serials = [
        SerialNumber(serial_number="SN-10040", product_id=pr_map["EV-BATTERY-200"].id, batch_number="BATCH-2026-09", production_date=now - datetime.timedelta(hours=5), status="REJECTED"),
        SerialNumber(serial_number="SN-10041", product_id=pr_map["EV-BATTERY-200"].id, batch_number="BATCH-2026-09", production_date=now - datetime.timedelta(hours=4), status="REJECTED"),
        SerialNumber(serial_number="SN-10042", product_id=pr_map["EV-BATTERY-200"].id, batch_number="BATCH-2026-09", production_date=now - datetime.timedelta(minutes=14), status="REJECTED"),
        SerialNumber(serial_number="SN-10043", product_id=pr_map["EV-BATTERY-200"].id, batch_number="BATCH-2026-09", production_date=now - datetime.timedelta(minutes=6), status="REJECTED"),
        SerialNumber(serial_number="SN-10044", product_id=pr_map["MOTOR-X100"].id, batch_number="BATCH-2026-08", production_date=now - datetime.timedelta(hours=2), status="PASSED"),
        SerialNumber(serial_number="SN-10045", product_id=pr_map["CONTROLLER-500"].id, batch_number="BATCH-2026-07", production_date=now - datetime.timedelta(hours=1), status="REJECTED"),
    ]
    db.add_all(serials)
    db.flush()
    sn_map = {s.serial_number: s for s in serials}

    # 7. System Settings
    settings = [
        Setting(key="systemic_threshold", value="3", description="Occurrence threshold to trigger systemic escalation"),
        Setting(key="time_window_minutes", value="30", description="Time window in minutes for systemic pattern evaluation"),
        Setting(key="default_severity", value="HIGH", description="Default defect severity level"),
        Setting(key="demo_mode", value="true", description="Enable real-time demo controls")
    ]
    db.add_all(settings)
    db.flush()

    # 8. Preload Defect Data including IMPORTANT DEMO SCENARIO (Section 27)
    # ST-04 / D102 has EXACTLY 2 existing occurrences within the last 15 minutes!
    # Occurrence 1: 14 mins ago
    d1 = Defect(
        defect_code_id=dc_map["D102"].id,
        serial_id=sn_map["SN-10042"].id,
        station_id=st_map["ST-04"].id,
        operator_id=op_map["OP-104"].id,
        description="Voltage Mismatch - 418V measured (expected 400V +/- 5V)",
        timestamp=now - datetime.timedelta(minutes=14),
        severity="HIGH",
        status="OPEN",
        photo_url="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
        classification="KNOWN"
    )
    # Occurrence 2: 6 mins ago
    d2 = Defect(
        defect_code_id=dc_map["D102"].id,
        serial_id=sn_map["SN-10043"].id,
        station_id=st_map["ST-04"].id,
        operator_id=op_map["OP-104"].id,
        description="Voltage Mismatch - 422V measured (expected 400V +/- 5V)",
        timestamp=now - datetime.timedelta(minutes=6),
        severity="HIGH",
        status="OPEN",
        photo_url="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
        classification="KNOWN"
    )
    # An unknown defect for testing tickets (D201 at ST-02)
    d3 = Defect(
        defect_code_id=dc_map["D201"].id,
        serial_id=sn_map["SN-10045"].id,
        station_id=st_map["ST-02"].id,
        operator_id=op_map["OP-102"].id,
        description="Unexpected Current Fluctuation recorded on line sensor",
        timestamp=now - datetime.timedelta(hours=1),
        severity="HIGH",
        status="OPEN",
        photo_url="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60",
        classification="UNKNOWN"
    )
    # Surface scratch at ST-01
    d4 = Defect(
        defect_code_id=dc_map["D101"].id,
        serial_id=sn_map["SN-10040"].id,
        station_id=st_map["ST-01"].id,
        operator_id=op_map["OP-101"].id,
        description="Minor surface scratch on corner bracket",
        timestamp=now - datetime.timedelta(hours=3),
        severity="LOW",
        status="RESOLVED",
        photo_url="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60",
        classification="KNOWN"
    )

    db.add_all([d1, d2, d3, d4])
    db.flush()

    # 9. Inspections
    inspections = [
        Inspection(serial_id=sn_map["SN-10042"].id, station_id=st_map["ST-04"].id, inspection_type="HV Electrical Test", result="FAIL", measured_value="418V", expected_value="400V", timestamp=now - datetime.timedelta(minutes=14)),
        Inspection(serial_id=sn_map["SN-10043"].id, station_id=st_map["ST-04"].id, inspection_type="HV Electrical Test", result="FAIL", measured_value="422V", expected_value="400V", timestamp=now - datetime.timedelta(minutes=6)),
        Inspection(serial_id=sn_map["SN-10044"].id, station_id=st_map["ST-06"].id, inspection_type="Functional Test", result="PASS", measured_value="100%", expected_value="100%", timestamp=now - datetime.timedelta(hours=2)),
        Inspection(serial_id=sn_map["SN-10045"].id, station_id=st_map["ST-02"].id, inspection_type="Sensor Sweep", result="FAIL", measured_value="Fluctuating", expected_value="Steady", timestamp=now - datetime.timedelta(hours=1)),
    ]
    db.add_all(inspections)

    # 10. Automatic Ticket for Unknown Defect
    t1 = Ticket(
        ticket_number="TICKET-1042",
        defect_id=d3.id,
        serial_id=sn_map["SN-10045"].id,
        station_id=st_map["ST-02"].id,
        description="UNKNOWN DEFECT: D201 Unexpected Current Fluctuation detected with no documented solution.",
        created_at=now - datetime.timedelta(hours=1),
        priority="HIGH",
        status="OPEN",
        assigned_to="Field Quality Engineer"
    )
    db.add(t1)

    # 11. Initial Warning Alert for ST-04 (2 of 3 threshold)
    a1 = Alert(
        alert_type="THRESHOLD_WARNING",
        title="WARNING: Defect D102 approaching threshold at ST-04",
        message="2 occurrences of D102 Voltage Mismatch recorded at station ST-04 within the last 15 minutes. 1 more occurrence will trigger systemic escalation.",
        severity="WARNING",
        station_id=st_map["ST-04"].id,
        defect_code_id=dc_map["D102"].id,
        created_at=now - datetime.timedelta(minutes=6),
        acknowledged=False,
        recipient_role="LINE_LEADER"
    )
    db.add(a1)

    db.commit()
    print("Database successfully seeded with realistic manufacturing data and preloaded hackathon scenario!")
    if should_close:
        db.close()

if __name__ == "__main__":
    run_seed()
