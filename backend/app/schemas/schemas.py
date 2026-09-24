import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# --- PRODUCT SCHEMAS ---
class ProductSchema(BaseModel):
    id: int
    product_code: str
    product_name: str
    version: str
    category: str
    status: str

    model_config = ConfigDict(from_attributes=True)

# --- STATION SCHEMAS ---
class StationSchema(BaseModel):
    id: int
    station_code: str
    station_name: str
    line: str
    operation: str
    status: str
    defect_count: int
    defect_rate: float
    current_operator: Optional[str] = None
    last_inspection: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- OPERATOR SCHEMAS ---
class OperatorSchema(BaseModel):
    id: int
    employee_code: str
    name: str
    station_id: Optional[int] = None
    shift: str

    model_config = ConfigDict(from_attributes=True)

# --- DEFECT CODE SCHEMAS ---
class DefectCodeSchema(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    severity: str
    known: bool
    documented_solution: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- DEFECT SCHEMAS ---
class DefectCreate(BaseModel):
    station_code: str
    defect_code: str
    serial_number: str
    product_code: Optional[str] = "EV-BATTERY-200"
    operator_code: Optional[str] = "OP-102"
    description: Optional[str] = None
    severity: Optional[str] = "HIGH"
    photo_url: Optional[str] = None

class DefectSchema(BaseModel):
    id: int
    defect_code_id: int
    serial_id: int
    station_id: int
    operator_id: Optional[int] = None
    description: Optional[str] = None
    timestamp: datetime.datetime
    severity: str
    status: str
    photo_url: Optional[str] = None
    classification: str

    station_code: Optional[str] = None
    station_name: Optional[str] = None
    defect_code: Optional[str] = None
    defect_name: Optional[str] = None
    serial_number: Optional[str] = None
    product_name: Optional[str] = None
    operator_name: Optional[str] = None
    documented_solution: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- NCR SCHEMAS ---
class NCRSchema(BaseModel):
    id: int
    ncr_number: str
    defect_id: Optional[int] = None
    station_id: int
    product_id: Optional[int] = None
    severity: str
    description: str
    created_at: datetime.datetime
    status: str
    assigned_to: str
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None
    due_date: Optional[datetime.datetime] = None

    station_code: Optional[str] = None
    product_name: Optional[str] = None
    defect_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NCRUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None

# --- TICKET SCHEMAS ---
class TicketSchema(BaseModel):
    id: int
    ticket_number: str
    defect_id: int
    serial_id: int
    station_id: int
    description: str
    created_at: datetime.datetime
    priority: str
    status: str
    assigned_to: str

    station_code: Optional[str] = None
    serial_number: Optional[str] = None
    defect_name: Optional[str] = None
    defect_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None

# --- ALERT SCHEMAS ---
class AlertSchema(BaseModel):
    id: int
    alert_type: str
    title: str
    message: str
    severity: str
    station_id: Optional[int] = None
    defect_code_id: Optional[int] = None
    created_at: datetime.datetime
    acknowledged: bool
    recipient_role: str

    station_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- PATTERN SCHEMAS ---
class AffectedUnit(BaseModel):
    serial_number: str
    product_name: str
    timestamp: str
    operator_name: str
    result: str

class DefectPatternSchema(BaseModel):
    id: int
    station_id: int
    defect_code_id: int
    occurrence_count: int
    threshold: int
    time_window: int
    first_occurrence: datetime.datetime
    last_occurrence: datetime.datetime
    status: str
    classification: str

    station_code: Optional[str] = None
    defect_code: Optional[str] = None
    defect_name: Optional[str] = None
    severity: Optional[str] = "HIGH"

    model_config = ConfigDict(from_attributes=True)

# --- SETTING SCHEMAS ---
class SettingSchema(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemSettingsUpdate(BaseModel):
    threshold: int
    time_window: int

# --- SIMULATION RESULT SCHEMA ---
class SimulationResult(BaseModel):
    defect: DefectSchema
    classification: str
    is_systemic: bool
    is_unknown: bool
    is_known: bool
    actions_taken: List[str]
    alert_created: Optional[AlertSchema] = None
    ncr_created: Optional[NCRSchema] = None
    ticket_created: Optional[TicketSchema] = None
    occurrence_count: int
    threshold: int
    time_window: int

# --- DASHBOARD SUMMARY SCHEMA ---
class DashboardSummary(BaseModel):
    defects_today: int
    open_tickets: int
    systemic_issues: int
    open_ncrs: int
    pass_rate: float
    active_stations_total: int
    active_stations_online: int
    recent_defects: List[DefectSchema]
    systemic_alerts: List[dict]

class AISummaryResponse(BaseModel):
    summary: str
    recommendation_areas: List[str]
