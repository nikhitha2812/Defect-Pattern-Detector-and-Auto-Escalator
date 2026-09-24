export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'ENGINEER' | 'QUALITY_MANAGER' | 'LINE_LEADER' | 'BUYER';
}

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  version: string;
  category: string;
  status: string;
}

export interface Station {
  id: number;
  station_code: string;
  station_name: string;
  line: string;
  operation: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  defect_count: number;
  defect_rate: number;
  current_operator?: string;
  last_inspection?: string;
}

export interface DefectCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  known: boolean;
  documented_solution?: string;
}

export interface Defect {
  id: number;
  defect_code_id: number;
  serial_id: number;
  station_id: number;
  operator_id?: number;
  description?: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  photo_url?: string;
  classification: 'KNOWN' | 'UNKNOWN' | 'SYSTEMIC';

  station_code: string;
  station_name?: string;
  defect_code: string;
  defect_name: string;
  serial_number: string;
  product_name?: string;
  operator_name?: string;
  documented_solution?: string;

  linked_ticket?: {
    id: number;
    ticket_number: string;
    status: string;
    priority: string;
  };
  linked_ncr?: {
    id: number;
    ncr_number: string;
    status: string;
    severity: string;
  };
}

export interface NCR {
  id: number;
  ncr_number: string;
  defect_id?: number;
  station_id: number;
  product_id?: number;
  severity: string;
  description: string;
  created_at: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CORRECTIVE_ACTION' | 'VERIFIED' | 'CLOSED';
  assigned_to: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  due_date?: string;

  station_code?: string;
  station_name?: string;
  product_name?: string;
  defect_name?: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  defect_id: number;
  serial_id: number;
  station_id: number;
  description: string;
  created_at: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to: string;

  station_code?: string;
  station_name?: string;
  serial_number?: string;
  defect_name?: string;
  defect_code?: string;
}

export interface Alert {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  station_id?: number;
  defect_code_id?: number;
  created_at: string;
  acknowledged: boolean;
  recipient_role: string;
  station_code?: string;
}

export interface DefectPattern {
  id: number;
  station_id: number;
  defect_code_id: number;
  occurrence_count: number;
  threshold: number;
  time_window: number;
  first_occurrence: string;
  last_occurrence: string;
  status: string;
  classification: string;

  station_code?: string;
  station_name?: string;
  defect_code?: string;
  defect_name?: string;
  severity?: string;
}

export interface SimulationResult {
  defect: Defect;
  classification: 'KNOWN' | 'UNKNOWN' | 'SYSTEMIC';
  is_systemic: boolean;
  is_unknown: boolean;
  is_known: boolean;
  actions_taken: string[];
  alert_created?: Alert;
  ncr_created?: NCR;
  ticket_created?: Ticket;
  occurrence_count: number;
  threshold: number;
  time_window: number;
}
