import type {
    MaintenanceRequest,
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceAssignmentCreate,
    MaintenanceAssignmentUpdate,
    StaffAssignment,
} from '../types/maintenance';

const BASE = '/api/v1/maintenance';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ── Tenant ────────────────────────────────────────────────────────────────────

export async function createMaintenanceRequest(
  data: MaintenanceRequestCreate
): Promise<MaintenanceRequest> {
  const res = await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit request');
  }
  return res.json();
}

export async function getMyRequests(): Promise<MaintenanceRequest[]> {
  const res = await fetch(`${BASE}/requests/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch your requests');
  return res.json();
}

export async function getRequest(id: string): Promise<MaintenanceRequest> {
  const res = await fetch(`${BASE}/requests/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch request');
  return res.json();
}

// ── Landlord ──────────────────────────────────────────────────────────────────

export async function getAllRequests(): Promise<MaintenanceRequest[]> {
  const res = await fetch(`${BASE}/requests`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}

export async function updateRequest(
  id: string,
  data: MaintenanceRequestUpdate
): Promise<MaintenanceRequest> {
  const res = await fetch(`${BASE}/requests/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update request');
  }
  return res.json();
}

export async function assignStaff(
  requestId: string,
  data: MaintenanceAssignmentCreate
): Promise<MaintenanceRequest> {
  const res = await fetch(`${BASE}/requests/${requestId}/assign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to assign staff');
  }
  return res.json();
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export async function getMyAssignments(): Promise<StaffAssignment[]> {
  const res = await fetch(`${BASE}/assignments/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function updateAssignment(
  id: string,
  data: MaintenanceAssignmentUpdate
): Promise<StaffAssignment> {
  const res = await fetch(`${BASE}/assignments/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update assignment');
  }
  return res.json();
}