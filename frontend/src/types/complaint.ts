export type ComplaintCategory =
  | 'noise'
  | 'safety'
  | 'billing'
  | 'neighbor'
  | 'management'
  | 'other';

export type ComplaintStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface ComplaintResponse {
  id: string;
  complaint_id: string;
  responder_id: string;
  message: string;
  created_at: string;
  responder: UserInfo | null;
}

export interface Complaint {
  id: string;
  unit_id: string;
  tenant_id: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  tenant: UserInfo | null;
  responses: ComplaintResponse[];
}

export interface ComplaintCreate {
  unit_id: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
}

export interface ComplaintUpdate {
  status?: ComplaintStatus;
}

export interface ComplaintResponseCreate {
  message: string;
}