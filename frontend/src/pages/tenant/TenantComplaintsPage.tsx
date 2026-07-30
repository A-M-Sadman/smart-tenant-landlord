import { useState, useEffect } from 'react';
import type { Complaint, ComplaintCategory } from '../../types/complaint';
import { createComplaint, getMyComplaints, deleteComplaint } from '../../api/complaint';

const CATEGORIES: ComplaintCategory[] = [
  'noise', 'safety', 'billing', 'neighbor', 'management', 'other',
];

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-info',
  under_review: 'badge-warning',
  resolved: 'badge-success',
  dismissed: 'badge-secondary',
};

interface ActiveAssignment {
  unit_id: string;
  unit: { id: string; unit_number: string } | null;
}

export default function TenantComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Complaint | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<ComplaintCategory>('noise');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [complaintsData, assignmentData] = await Promise.all([
          getMyComplaints(),
          fetchActiveAssignment(),
        ]);
        setComplaints(complaintsData);
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
    setCategory('noise');
    setSubject('');
    setDescription('');
    setFormError('');
  }

  async function handleSubmit() {
    if (!activeAssignment) return setFormError('You need an active unit assignment to submit a complaint');
    if (!subject.trim()) return setFormError('Please enter a subject');
    if (!description.trim()) return setFormError('Please enter a description');
    setFormError('');
    setSubmitting(true);
    try {
      const newComplaint = await createComplaint({
        unit_id: activeAssignment.unit_id,
        category,
        subject: subject.trim(),
        description: description.trim(),
      });
      setComplaints(prev => [newComplaint, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">{complaints.length} total complaint{complaints.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(true); resetForm(); }}
          disabled={!activeAssignment}
          title={!activeAssignment ? 'You need an active unit assignment to submit a complaint' : ''}
        >
          + New Complaint
        </button>
      </div>

      {!activeAssignment && (
        <div className="maintenance-notes" style={{ marginBottom: '16px' }}>
          <p className="maintenance-meta-text">
            ⚠️ You don't have an active unit assignment. Contact your landlord before submitting a complaint.
          </p>
        </div>
      )}

      {/* Submit Modal */}
      {showForm && activeAssignment && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Complaint</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
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
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={e => setCategory(e.target.value as ComplaintCategory)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief summary of your complaint"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe your complaint in detail..."
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              {formError && <p className="form-error">{formError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="empty-state">
          <p>No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="card-list">
          {complaints.map(c => (
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
                {new Date(c.created_at).toLocaleDateString()}
              </p>

              {expanded === c.id && (
                <div className="maintenance-card-body">
                  <p className="maintenance-desc">{c.description}</p>

                  {/* Responses */}
                  {c.responses.length > 0 && (
                    <div className="complaint-responses">
                      <span className="notes-label">Landlord Responses</span>
                      {c.responses.map(r => (
                        <div key={r.id} className="complaint-response-item">
                          <div className="complaint-response-header">
                            <span className="tenant-name">
                              {r.responder?.full_name || r.responder?.email || 'Landlord'}
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

                  {c.status === 'open' && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        className="btn-danger-small"
                        onClick={() => setConfirmDelete(c)}
                        disabled={actionLoading === c.id}
                      >
                        Delete Complaint
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Complaint</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete your complaint about{' '}
                <strong>"{confirmDelete.subject}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={actionLoading === confirmDelete.id}
              >
                {actionLoading === confirmDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}