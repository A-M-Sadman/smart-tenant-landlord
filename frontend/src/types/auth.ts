export type UserRole = "admin" | "landlord" | "tenant" | "maintenance_staff";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
