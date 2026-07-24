export interface LandlordStats {
  total_properties: number;
  total_units: number;
  total_tenants: number;
  open_maintenance_requests: number;
  pending_payments: number;
  overdue_payments: number;
  open_complaints: number;
  open_assignments: number;
  open_agreements: number;
}

export interface RecentActivity {
  type: 'maintenance' | 'complaint' | 'payment';
  description: string;
  timestamp: string;
}

export interface LandlordDashboard {
  stats: LandlordStats;
  recent_activity: RecentActivity[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  total_units: number;
  landlord_id: string;
  landlord_email: string | null;
  landlord_name: string | null;
  created_at: string;
}

export interface PlatformStats {
  total_users: number;
  total_landlords: number;
  total_tenants: number;
  total_maintenance_staff: number;
  total_admins: number;
  total_properties: number;
  total_units: number;
  total_active_assignments: number;
  total_active_agreements: number;
  total_open_complaints: number;
  total_open_maintenance: number;
  total_pending_payments: number;
}