import { useState, useEffect } from 'react';
import type { MaintenanceRequest, MaintenanceCategory, RequestPriority } from '../../types/maintenance';
import { createMaintenanceRequest, getMyRequests } from '../../api/maintenance';

const CATEGORIES: MaintenanceCategory[] = [
  'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other',
];

const PRIORITIES: RequestPriority[] = ['low', 'medium', 'high', 'urgent'];

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-info',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
  closed: 'badge-secondary',
  rejected: 'badge-danger',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'badge-secondary',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
};

interface ActiveAssignment {
  id: string;
  unit_id: string;
  unit: { id: string; unit_number: string } | null;
}

export default function TenantMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<MaintenanceCategory>('plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('medium');

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [reqData, assignmentData] = await Promise.all([
          getMyRequests(),
          fetchActiveAssignment(),
        ]);
        setRequests(reqData);
        setActiveAssignment(assignmentData);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchActiveAssignment(): Promise<ActiveAssignment | null> {
    try {
      const res = await fetch('/api/v1/assignments/mine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function resetForm() {
    setCategory('plumbing');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setFormError('');
  }

  async function handleSubmit() {
    if (!activeAssignment) return setFormError('You do not have an active unit assignment');
    if (!title.trim()) return setFormError('Please enter a title');
    if (!description.trim()) return setFormError('Please enter a description');
    setFormError('');
    setSubmitting(true);
    try {
      const newReq = await createMaintenanceRequest({
        unit_id: activeAssignment.unit_id,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      setRequests(prev => [newReq, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Requests</h1>
          {activeAssignment?.unit && (
            <p className="page-subtitle">Unit {activeAssignment.unit.unit_number}</p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(true); resetForm(); }}
          disabled={!activeAssignment}
          title={!activeAssignment ? 'You need an active unit assignment to submit a request' : ''}
        >
          + New Request
        </button>
      </div>

      {!activeAssignment && (
        <div className="maintenance-notes" style={{ marginBottom: '16px' }}>
          <p className="maintenance-meta-text">
            ⚠️ You don't have an active unit assignment. Contact your landlord to be assigned to a unit before submitting maintenance requests.
          </p>
        </div>
      )}

      {/* Submit form modal */}
      {showForm && activeAssignment && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Maintenance Request</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Auto-filled unit info */}
              <div className="form-group">
                <label className="form-label">Unit</label>
                <div className="selected-tenant">
                  <div className="selected-tenant-info">
                    <span className="tenant-name">
                      Unit {activeAssignment.unit?.unit_number || activeAssignment.unit_id}
                    </span>
                    <span className="tenant-email">Your assigned unit</span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={e => setCategory(e.target.value as MaintenanceCategory)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    className="form-input"
                    value={priority}
                    onChange={e => setPriority(e.target.value as RequestPriority)}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {formError && <p className="form-error">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests list */}
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No maintenance requests yet. Submit one using the button above.</p>
        </div>
      ) : (
        <div className="card-list">
          {requests.map(req => (
            <div key={req.id} className="maintenance-card">
              <div className="maintenance-card-header">
                <div className="maintenance-card-meta">
                  <span className={`badge ${STATUS_BADGE[req.status]}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span className={`badge ${PRIORITY_BADGE[req.priority]}`}>
                    {req.priority}
                  </span>
                </div>
                <button
                  className="btn-ghost-small"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
                  {expanded === req.id ? 'Hide' : 'Details'}
                </button>
              </div>

              <h3 className="maintenance-card-title">{req.title}</h3>
              <p className="maintenance-card-category">
                {req.category} · {new Date(req.created_at).toLocaleDateString()}
              </p>

              {expanded === req.id && (
                <div className="maintenance-card-body">
                  <p className="maintenance-desc">{req.description}</p>
                  {req.assignments.length > 0 && (
                    <div className="maintenance-notes">
                      <span className="notes-label">Assigned staff:</span>
                      {req.assignments.map(a => (
                        <p key={a.id}>
                          {a.staff?.full_name || a.staff?.email || '—'} —{' '}
                          <span className={`badge ${a.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {a.status.replace('_', ' ')}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                  {req.resolved_at && (
                    <p className="maintenance-meta-text">
                      Resolved: {new Date(req.resolved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}