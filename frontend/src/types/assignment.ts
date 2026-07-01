export type AssignmentStatus = 'active' | 'past' | 'terminated';

export interface TenantInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface UnitInfo {
  id: string;
  unit_number: string;
  property_id: string;
}

export interface Assignment {
  id: string;
  unit_id: string;
  tenant_id: string;
  assigned_by: string;
  start_date: string;
  end_date: string | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
  tenant: TenantInfo | null;
  unit: UnitInfo | null;
}

export interface AssignmentCreate {
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date?: string | null;
}

export interface AssignmentUpdate {
  end_date?: string | null;
  status?: AssignmentStatus;
}

export interface TenantSearchResult {
  id: string;
  email: string;
  full_name: string | null;
}