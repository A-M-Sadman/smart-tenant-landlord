import { useState, useEffect } from 'react';
import type { Notification } from '../../types/notification';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
} from '../../api/notification';
import { useAuth } from '../../context/AuthContext';
import { searchTenants } from '../../api/assignment';

const TYPE_ICON: Record<string, string> = {
  general: '📢',
  rent: '💰',
  maintenance: '🔧',
  complaint: '📣',
  agreement: '📄',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === 'landlord';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSend, setShowSend] = useState(false);

  // Send form state
  const [sendEmail, setSendEmail] = useState('');
  const [sendUserId, setSendUserId] = useState('');
  const [sendUserName, setSendUserName] = useState('');
  const [sendResults, setSendResults] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendType, setSendType] = useState('general');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: string) {
    setActionLoading(id);
    try {
      const updated = await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id + '-del');
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUserSearch(email: string) {
    setSendEmail(email);
    setSendUserId('');
    setSendUserName('');
    if (email.length < 2) { setSendResults([]); return; }
    setSearchingUsers(true);
    try {
      const results = await searchTenants(email);
      setSendResults(results);
    } catch {
      setSendResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }

  async function handleSend() {
    if (!sendUserId) return setSendError('Please select a recipient');
    if (!sendTitle.trim()) return setSendError('Please enter a title');
    if (!sendMessage.trim()) return setSendError('Please enter a message');
    setSendError('');
    setSending(true);
    try {
      await sendNotification({
        user_id: sendUserId,
        type: sendType,
        title: sendTitle.trim(),
        message: sendMessage.trim(),
      });
      setShowSend(false);
      setSendEmail(''); setSendUserId(''); setSendUserName('');
      setSendTitle(''); setSendMessage(''); setSendType('general');
    } catch (e: any) {
      setSendError(e.message);
    } finally {
      setSending(false);
    }
  }

  const unread = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="page-loading">Loading notifications...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {unread > 0 && (
            <button className="btn-secondary" onClick={handleMarkAllRead}>
              Mark All Read
            </button>
          )}
          {isLandlord && (
            <button className="btn-primary" onClick={() => setShowSend(true)}>
              + Send Notification
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.is_read ? 'notification-unread' : ''}`}
            >
              <div className="notification-icon">
                {TYPE_ICON[n.type] || '📢'}
              </div>
              <div className="notification-body">
                <div className="notification-header">
                  <h3 className="notification-title">{n.title}</h3>
                  <span className="notification-time">
                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="notification-message">{n.message}</p>
                <div className="notification-actions">
                  {!n.is_read && (
                    <button
                      className="btn-ghost-small"
                      onClick={() => handleMarkRead(n.id)}
                      disabled={actionLoading === n.id}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    className="btn-ghost-small"
                    onClick={() => handleDelete(n.id)}
                    disabled={actionLoading === n.id + '-del'}
                    style={{ color: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showSend && (
        <div className="modal-overlay" onClick={() => setShowSend(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button className="modal-close" onClick={() => setShowSend(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Recipient *</label>
                {sendUserId ? (
                  <div className="selected-tenant">
                    <div className="selected-tenant-info">
                      <span className="tenant-name">{sendUserName || 'User'}</span>
                      <span className="tenant-email">{sendEmail}</span>
                    </div>
                    <button className="btn-ghost-small" onClick={() => { setSendUserId(''); setSendEmail(''); setSendUserName(''); }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by email..."
                      value={sendEmail}
                      onChange={e => handleUserSearch(e.target.value)}
                    />
                    {searchingUsers && <p className="search-hint">Searching...</p>}
                    {sendResults.length > 0 && (
                      <div className="search-results">
                        {sendResults.map(u => (
                          <div
                            key={u.id}
                            className="search-result-item"
                            onClick={() => {
                              setSendUserId(u.id);
                              setSendEmail(u.email);
                              setSendUserName(u.full_name || u.email);
                              setSendResults([]);
                            }}
                          >
                            <span className="tenant-name">{u.full_name || 'No name'}</span>
                            <span className="tenant-email">{u.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={sendType}
                    onChange={e => setSendType(e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="rent">Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="complaint">Complaint</option>
                    <option value="agreement">Agreement</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Notification title"
                  value={sendTitle}
                  onChange={e => setSendTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Notification message..."
                  rows={4}
                  value={sendMessage}
                  onChange={e => setSendMessage(e.target.value)}
                />
              </div>
              {sendError && <p className="form-error">{sendError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSend(false)} disabled={sending}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSend} disabled={sending || !sendUserId}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}