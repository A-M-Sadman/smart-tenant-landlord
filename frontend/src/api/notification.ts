import type { Notification, NotificationPreference, NotificationPreferenceUpdate, NotificationSend } from '../types/notification';

const BASE = 'http://localhost:8000/api/v1/notifications';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await fetch(`${BASE}/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark as read');
  return res.json();
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${BASE}/read-all`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete notification');
}

export async function getPreferences(): Promise<NotificationPreference> {
  const res = await fetch(`${BASE}/preferences`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return res.json();
}

export async function updatePreferences(data: NotificationPreferenceUpdate): Promise<NotificationPreference> {
  const res = await fetch(`${BASE}/preferences`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update preferences');
  return res.json();
}

export async function sendNotification(data: NotificationSend): Promise<Notification> {
  const res = await fetch(`${BASE}/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to send notification');
  }
  return res.json();
}