import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="ENGINEER")  # ADMIN, ENGINEER, QUALITY_MANAGER, LINE_LEADER, BUYER

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    version = Column(String, default="v1.0")
    category = Column(String, default="Battery Module")
    status = Column(String, default="ACTIVE")  # ACTIVE, INACTIVE

    serials = relationship("SerialNumber", back_populates="product")
    ncrs = relationship("NCR", back_populates="product")

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String, unique=True, index=True, nullable=False)
    station_name = Column(String, nullable=False)
    line = Column(String, default="Line 1")
    operation = Column(String, default="Assembly")
    status = Column(String, default="GREEN")  # GREEN, YELLOW, RED
    defect_count = Column(Integer, default=0)
    defect_rate = Column(Float, default=0.0)
    current_operator = Column(String, nullable=True)
    last_inspection = Column(DateTime, default=datetime.datetime.utcnow)

    operators = relationship("Operator", back_populates="station")
    defects = relationship("Defect", back_populates="station")
    inspections = relationship("Inspection", back_populates="station")
    ncrs = relationship("NCR", back_populates="station")
    tickets = relationship("Ticket", back_populates="station")
    patterns = relationship("DefectPattern", back_populates="station")

class Operator(Base):
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    shift = Column(String, default="Shift A")  # Shift A, Shift B, Shift C

    station = relationship("Station", back_populates="operators")
    defects = relationship("Defect", back_populates="operator")

class SerialNumber(Base):
    __tablename__ = "serial_numbers"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    batch_number = Column(String, default="BATCH-2026-01")
    production_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="IN_PROGRESS")  # IN_PROGRESS, PASSED, REJECTED, QUARANTINED

    product = relationship("Product", back_populates="serials")
    defects = relationship("Defect", back_populates="serial")
    inspections = relationship("Inspection", back_populates="serial")
    tickets = relationship("Ticket", back_populates="serial")

class DefectCode(Base):
    __tablename__ = "defect_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    known = Column(Boolean, default=True)
    documented_solution = Column(Text, nullable=True)

    defects = relationship("Defect", back_populates="defect_code")
    patterns = relationship("DefectPattern", back_populates="defect_code")

class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    defect_code_id = Column(Integer, ForeignKey("defect_codes.id"), nullable=False)
    serial_id = Column(Integer, ForeignKey("serial_numbers.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    operator_id = Column(Integer, ForeignKey("operators.id"), nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="OPEN")  # OPEN, INVESTIGATING, RESOLVED, ESCALATED
    photo_url = Column(String, nullable=True)
    classification = Column(String, default="KNOWN")  # KNOWN, UNKNOWN, SYSTEMIC

    defect_code = relationship("DefectCode", back_populates="defects")
    serial = relationship("SerialNumber", back_populates="defects")
    station = relationship("Station", back_populates="defects")
    operator = relationship("Operator", back_populates="defects")
    ncrs = relationship("NCR", back_populates="defect")
    tickets = relationship("Ticket", back_populates="defect")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    serial_id = Column(Integer, ForeignKey("serial_numbers.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    inspection_type = Column(String, default="ELECTRICAL_TEST")
    result = Column(String, default="PASS")  # PASS, FAIL
    measured_value = Column(String, nullable=True)
    expected_value = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    serial = relationship("SerialNumber", back_populates="inspections")
    station = relationship("Station", back_populates="inspections")

class NCR(Base):
    __tablename__ = "ncrs"

    id = Column(Integer, primary_key=True, index=True)
    ncr_number = Column(String, unique=True, index=True, nullable=False)
    defect_id = Column(Integer, ForeignKey("defects.id"), nullable=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    severity = Column(String, default="CRITICAL")  # WARNING, CRITICAL
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    status = Column(String, default="OPEN")  # OPEN, INVESTIGATING, CORRECTIVE_ACTION, VERIFIED, CLOSED
    assigned_to = Column(String, default="Quality Engineering Team")
    root_cause = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=True)
    preventive_action = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)

    defect = relationship("Defect", back_populates="ncrs")
    station = relationship("Station", back_populates="ncrs")
    product = relationship("Product", back_populates="ncrs")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    defect_id = Column(Integer, ForeignKey("defects.id"), nullable=False)
    serial_id = Column(Integer, ForeignKey("serial_numbers.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    priority = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, URGENT
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to = Column(String, default="Field Quality Engineer")

    defect = relationship("Defect", back_populates="tickets")
    serial = relationship("SerialNumber", back_populates="tickets")
    station = relationship("Station", back_populates="tickets")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, default="SYSTEMIC_DEFECT")  # SYSTEMIC_DEFECT, THRESHOLD_WARNING, UNKNOWN_DEFECT
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="CRITICAL")  # INFO, WARNING, CRITICAL
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    defect_code_id = Column(Integer, ForeignKey("defect_codes.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    acknowledged = Column(Boolean, default=False)
    recipient_role = Column(String, default="FIELD_ENGINEER")  # LINE_LEADER, FIELD_ENGINEER, QUALITY_MANAGER, ALL

class DefectPattern(Base):
    __tablename__ = "defect_patterns"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    defect_code_id = Column(Integer, ForeignKey("defect_codes.id"), nullable=False)
    occurrence_count = Column(Integer, default=1)
    threshold = Column(Integer, default=3)
    time_window = Column(Integer, default=30)  # minutes
    first_occurrence = Column(DateTime, default=datetime.datetime.utcnow)
    last_occurrence = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="ACTIVE")  # ACTIVE, ESCALATED, RESOLVED
    classification = Column(String, default="SYSTEMIC")  # REPEATED, SYSTEMIC

    station = relationship("Station", back_populates="patterns")
    defect_code = relationship("DefectCode", back_populates="patterns")

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
