export interface TenantProfile {
  id: string;
  user_id: string;
  nid?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  profile_photo_url?: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantProfileUpdate {
  nid?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  profile_photo_url?: string;
}