import type { Agreement, AgreementCreate, AgreementUpdate } from '../types/agreement';

const BASE = 'http://localhost:8000/api/v1/agreements';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createAgreement(data: AgreementCreate): Promise<Agreement> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create agreement');
  }
  return res.json();
}

export async function getAgreements(): Promise<Agreement[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch agreements');
  return res.json();
}

export async function getAgreement(id: string): Promise<Agreement> {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch agreement');
  return res.json();
}

export async function getAgreementByAssignment(assignmentId: string): Promise<Agreement | null> {
  const res = await fetch(`${BASE}/assignment/${assignmentId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch agreement');
  const data = await res.json();
  return data ?? null;
}

export async function updateAgreement(id: string, data: AgreementUpdate): Promise<Agreement> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update agreement');
  }
  return res.json();
}

export async function activateAgreement(id: string): Promise<Agreement> {
  const res = await fetch(`${BASE}/${id}/activate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to activate agreement');
  }
  return res.json();
}

export async function deleteAgreement(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete agreement');
  }
}

// Add these two functions to the bottom of src/api/agreement.ts

export async function getMyAgreements(): Promise<any[]> {
  const res = await fetch(`${BASE}/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch your agreements');
  return res.json();
}

export async function acceptAgreement(id: string): Promise<any> {
  const res = await fetch(`${BASE}/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to accept agreement');
  }
  return res.json();
}