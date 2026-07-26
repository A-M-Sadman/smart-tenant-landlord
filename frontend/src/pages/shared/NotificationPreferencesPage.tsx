import { useState, useEffect } from 'react';
import type { NotificationPreference } from '../../types/notification';
import { getPreferences, updatePreferences } from '../../api/notification';

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(key: keyof NotificationPreference) {
    if (!prefs) return;
    const newVal = !prefs[key];
    const updated = { ...prefs, [key]: newVal };
    setPrefs(updated as NotificationPreference);
    setSaving(true);
    setSaved(false);
    try {
      const saved = await updatePreferences({ [key]: newVal });
      setPrefs(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-loading">Loading preferences...</div>;
  if (!prefs) return <div className="page-error">Failed to load preferences</div>;

  const toggles = [
    { key: 'in_app_notifications', label: 'In-App Notifications', description: 'Show notifications inside the platform' },
    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'rent_reminders', label: 'Rent Reminders', description: 'Get reminded about upcoming and overdue payments' },
    { key: 'maintenance_updates', label: 'Maintenance Updates', description: 'Notifications about maintenance request status changes' },
    { key: 'complaint_updates', label: 'Complaint Updates', description: 'Notifications when your complaints receive responses' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Preferences</h1>
          <p className="page-subtitle">Choose what you want to be notified about</p>
        </div>
        {saved && (
          <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ✓ Saved
          </span>
        )}
      </div>

      <div className="preferences-list">
        {toggles.map(({ key, label, description }) => (
          <div key={key} className="preference-item">
            <div className="preference-info">
              <span className="preference-label">{label}</span>
              <span className="preference-desc">{description}</span>
            </div>
            <button
              className={`toggle-btn ${prefs[key as keyof NotificationPreference] ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => handleToggle(key as keyof NotificationPreference)}
              disabled={saving}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}