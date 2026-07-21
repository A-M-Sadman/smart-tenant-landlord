import type { Complaint, ComplaintCreate, ComplaintUpdate, ComplaintResponseCreate } from '../types/complaint';

const BASE = 'http://localhost:8000/api/v1/complaints';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createComplaint(data: ComplaintCreate): Promise<Complaint> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit complaint');
  }
  return res.json();
}

export async function getMyComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${BASE}/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function updateComplaint(id: string, data: ComplaintUpdate): Promise<Complaint> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update complaint');
  }
  return res.json();
}

export async function addResponse(id: string, data: ComplaintResponseCreate): Promise<Complaint> {
  const res = await fetch(`${BASE}/${id}/respond`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to add response');
  }
  return res.json();
}

export async function deleteComplaint(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete complaint');
  }
}