import type {
    Assignment,
    AssignmentCreate,
    AssignmentUpdate,
    TenantSearchResult,
} from '../types/assignment';

const BASE = '/api/v1';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createAssignment(data: AssignmentCreate): Promise<Assignment> {
  const res = await fetch(`${BASE}/assignments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create assignment');
  }
  return res.json();
}

export async function getAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${BASE}/assignments`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await fetch(`${BASE}/assignments/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch assignment');
  return res.json();
}

export async function updateAssignment(id: string, data: AssignmentUpdate): Promise<Assignment> {
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

export async function endAssignment(id: string): Promise<Assignment> {
  const res = await fetch(`${BASE}/assignments/${id}/end`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to end assignment');
  }
  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${BASE}/assignments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete assignment');
  }
}

export async function getUnitActiveAssignment(unitId: string): Promise<Assignment | null> {
  const res = await fetch(`${BASE}/units/${unitId}/assignment`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch unit assignment');
  const data = await res.json();
  return data ?? null;
}

export async function searchTenants(email: string): Promise<TenantSearchResult[]> {
  const res = await fetch(
    `${BASE}/tenants/search?email=${encodeURIComponent(email)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error('Failed to search tenants');
  return res.json();
}