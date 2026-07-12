export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'structural'
  | 'other';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RequestStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type StaffWorkStatus = 'assigned' | 'in_progress' | 'completed';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface MaintenanceAssignment {
  id: string;
  request_id: string;
  staff_id: string;
  assigned_by: string;
  notes: string | null;
  status: StaffWorkStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  staff: UserInfo | null;
  assigner: UserInfo | null;
}

export interface MaintenanceRequest {
  id: string;
  unit_id: string;
  tenant_id: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  attachment_url: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  tenant: UserInfo | null;
  assignments: MaintenanceAssignment[];
}

export interface MaintenanceRequestCreate {
  unit_id: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  priority?: RequestPriority;
  attachment_url?: string | null;
}

export interface MaintenanceRequestUpdate {
  status?: RequestStatus;
  priority?: RequestPriority;
  title?: string;
  description?: string;
}

export interface MaintenanceAssignmentCreate {
  staff_id: string;
  notes?: string | null;
}

export interface MaintenanceAssignmentUpdate {
  status?: StaffWorkStatus;
  notes?: string | null;
}

export interface StaffAssignment {
  id: string;
  request_id: string;
  staff_id: string;
  assigned_by: string;
  notes: string | null;
  status: StaffWorkStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  request: MaintenanceRequest | null;
  assigner: UserInfo | null;
}