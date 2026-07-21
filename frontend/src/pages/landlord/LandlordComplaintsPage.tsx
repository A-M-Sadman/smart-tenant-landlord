import { useState, useEffect } from 'react';
import type { Complaint, ComplaintStatus } from '../../types/complaint';
import { getAllComplaints, updateComplaint, addResponse } from '../../api/complaint';

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-info',
  under_review: 'badge-warning',
  resolved: 'badge-success',
  dismissed: 'badge-secondary',
};

const STATUSES: ComplaintStatus[] = ['open', 'under_review', 'resolved', 'dismissed'];

export default function LandlordComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

  useEffect(() => {
    getAll();
  }, []);

  async function getAll() {
    setLoading(true);
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: ComplaintStatus) {
    setActionLoading(id);
    try {
      const updated = await updateComplaint(id, { status });
      setComplaints(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReply(id: string) {
    const message = replyText[id]?.trim();
    if (!message) return;
    setReplySubmitting(id);
    try {
      const updated = await addResponse(id, { message });
      setComplaints(prev => prev.map(c => c.id === id ? updated : c));
      setReplyText(prev => ({ ...prev, [id]: '' }));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReplySubmitting(null);
    }
  }

  const filtered = complaints
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => {
      const q = search.toLowerCase();
      return (
        c.subject.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tenant?.full_name?.toLowerCase().includes(q) ||
        c.tenant?.email?.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    });

  if (loading) return <div className="page-loading">Loading complaints...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">{complaints.length} total complaint{complaints.length !== 1 ? 's' : ''}</p>
        </div>
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by subject, category, tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No complaints match your search.' : 'No complaints yet.'}</p>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(c => (
            <div key={c.id} className="maintenance-card">
              <div className="maintenance-card-header">
                <div className="maintenance-card-meta">
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                  <span className="badge badge-secondary">{c.category}</span>
                </div>
                <button
                  className="btn-ghost-small"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  {expanded === c.id ? 'Hide' : 'Details'}
                </button>
              </div>

              <h3 className="maintenance-card-title">{c.subject}</h3>
              <p className="maintenance-card-category">
                Tenant: {c.tenant?.full_name || c.tenant?.email || '—'} ·{' '}
                {new Date(c.created_at).toLocaleDateString()}
              </p>

              {expanded === c.id && (
                <div className="maintenance-card-body">
                  <p className="maintenance-desc">{c.description}</p>

                  {/* Status update */}
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label">Update Status</label>
                    <select
                      className="form-input"
                      value={c.status}
                      disabled={actionLoading === c.id}
                      onChange={e => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                      style={{ maxWidth: '200px' }}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Existing responses */}
                  {c.responses.length > 0 && (
                    <div className="complaint-responses">
                      <span className="notes-label">Responses</span>
                      {c.responses.map(r => (
                        <div key={r.id} className="complaint-response-item">
                          <div className="complaint-response-header">
                            <span className="tenant-name">
                              {r.responder?.full_name || r.responder?.email || 'You'}
                            </span>
                            <span className="maintenance-meta-text">
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="maintenance-desc">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply box */}
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label">Add Response</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Write a response to the tenant..."
                      rows={3}
                      value={replyText[c.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                    />
                    <button
                      className="btn-primary"
                      style={{ marginTop: '8px' }}
                      onClick={() => handleReply(c.id)}
                      disabled={replySubmitting === c.id || !replyText[c.id]?.trim()}
                    >
                      {replySubmitting === c.id ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}