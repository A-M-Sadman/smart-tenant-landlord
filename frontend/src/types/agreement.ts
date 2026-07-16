export type AgreementStatus = 'draft' | 'active' | 'expired' | 'terminated';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface AssignmentInfo {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface Agreement {
  id: string;
  assignment_id: string;
  landlord_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  security_deposit: string;
  terms: string | null;
  status: AgreementStatus;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  landlord: UserInfo | null;
  tenant: UserInfo | null;
  assignment: AssignmentInfo | null;
}

export interface AgreementCreate {
  assignment_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit?: number;
  terms?: string | null;
}

export interface AgreementUpdate {
  start_date?: string;
  end_date?: string;
  monthly_rent?: number;
  security_deposit?: number;
  terms?: string | null;
}