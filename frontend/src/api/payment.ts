import type { Payment, PaymentCreate, PaymentUpdate } from '../types/payment';
 
const BASE = 'http://localhost:8000/api/v1/payments';
 
function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
 
export async function createPayment(data: PaymentCreate): Promise<Payment> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create payment');
  }
  return res.json();
}
 
export async function getPayments(): Promise<Payment[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}
 
export async function getPaymentsByAgreement(agreementId: string): Promise<Payment[]> {
  const res = await fetch(`${BASE}/agreement/${agreementId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}
 
export async function updatePayment(id: string, data: PaymentUpdate): Promise<Payment> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update payment');
  }
  return res.json();
}
 
export async function deletePayment(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete payment');
  }
}
 
export async function getMyPayments(): Promise<Payment[]> {
  const res = await fetch(`${BASE}/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch your payments');
  return res.json();
}