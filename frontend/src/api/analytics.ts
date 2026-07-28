import type { Analytics } from '../types/analytics';

const BASE = '/api/v1/analytics';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getAnalytics(): Promise<Analytics> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}