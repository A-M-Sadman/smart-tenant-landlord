import type { LandlordDashboard, AdminUser, AdminProperty, PlatformStats } from '../types/dashboard';

const BASE = 'http://localhost:8000/api/v1';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getLandlordDashboard(): Promise<LandlordDashboard> {
  const res = await fetch(`${BASE}/dashboard/landlord`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${BASE}/admin/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function activateUser(id: string): Promise<AdminUser> {
  const res = await fetch(`${BASE}/admin/users/${id}/activate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to activate user');
  }
  return res.json();
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const res = await fetch(`${BASE}/admin/users/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to deactivate user');
  }
  return res.json();
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  const res = await fetch(`${BASE}/admin/properties`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${BASE}/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}