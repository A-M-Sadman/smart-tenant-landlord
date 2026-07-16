import { useState, useEffect } from 'react';
import type { Agreement } from '../../types/agreement';
import { getAgreements, activateAgreement, deleteAgreement, updateAgreement } from '../../api/agreement';
import CreateAgreementModal from '../../components/landlord/CreateAgreementModal';

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-secondary',
  active: 'badge-success',
  expired: 'badge-warning',
  terminated: 'badge-danger',
};

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Agreement | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editAgreement, setEditAgreement] = useState<Agreement | null>(null);

  // Edit form state
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editRent, setEditRent] = useState('');
  const [editDeposit, setEditDeposit] = useState('');
  const [editTerms, setEditTerms] = useState('');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchAgreements();
  }, []);

  async function fetchAgreements() {
    setLoading(true);
    try {
      const data = await getAgreements();
      setAgreements(data);
    } catch {
      setError('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: string) {
    setActionLoading(id);
    try {
      const updated = await activateAgreement(id);
      setAgreements(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    try {
      await deleteAgreement(id);
      setAgreements(prev => prev.filter(a => a.id !== id));
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function openEdit(a: Agreement) {
    setEditAgreement(a);
    setEditStartDate(a.start_date);
    setEditEndDate(a.end_date);
    setEditRent(a.monthly_rent);
    setEditDeposit(a.security_deposit);
    setEditTerms(a.terms || '');
    setEditError('');
  }

  async function handleEditSubmit() {
    if (!editAgreement) return;
    if (editEndDate <= editStartDate) return setEditError('End date must be after start date');
    if (Number(editRent) <= 0) return setEditError('Monthly rent must be greater than 0');
    setEditError('');
    setEditSubmitting(true);
    try {
      const updated = await updateAgreement(editAgreement.id, {
        start_date: editStartDate,
        end_date: editEndDate,
        monthly_rent: Number(editRent),
        security_deposit: Number(editDeposit) || 0,
        terms: editTerms.trim() || null,
      });
      setAgreements(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditAgreement(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditSubmitting(false);
    }
  }

  const filtered = agreements.filter(a => {
    const q = search.toLowerCase();
    return (
      a.tenant?.email?.toLowerCase().includes(q) ||
      a.tenant?.full_name?.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.start_date.includes(q) ||
      a.end_date.includes(q)
    );
  });

  if (loading) return <div className="page-loading">Loading agreements...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rental Agreements</h1>
          <p className="page-subtitle">
            {agreements.length} total agreement{agreements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Agreement
        </button>
      </div>

      {/* Search */}
      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by tenant name, email or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No agreements match your search.' : 'No agreements yet. Create one using the button above.'}</p>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(a => (
            <div key={a.id} className="maintenance-card">
              <div className="maintenance-card-header">
                <div className="maintenance-card-meta">
                  <span className={`badge ${STATUS_BADGE[a.status]}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                <button
                  className="btn-ghost-small"
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                >
                  {expanded === a.id ? 'Hide' : 'Details'}
                </button>
              </div>

              <h3 className="maintenance-card-title">
                Agreement with {a.tenant?.full_name || a.tenant?.email || '—'}
              </h3>
              <p className="maintenance-card-category">
                {a.start_date} → {a.end_date} · ৳{Number(a.monthly_rent).toLocaleString()}/mo
              </p>

              {expanded === a.id && (
                <div className="maintenance-card-body">
                  <div className="agreement-details-grid">
                    <div className="agreement-detail-item">
                      <span className="notes-label">Tenant</span>
                      <span>{a.tenant?.full_name || a.tenant?.email || '—'}</span>
                    </div>
                    <div className="agreement-detail-item">
                      <span className="notes-label">Monthly Rent</span>
                      <span>৳{Number(a.monthly_rent).toLocaleString()}</span>
                    </div>
                    <div className="agreement-detail-item">
                      <span className="notes-label">Security Deposit</span>
                      <span>৳{Number(a.security_deposit).toLocaleString()}</span>
                    </div>
                    <div className="agreement-detail-item">
                      <span className="notes-label">Period</span>
                      <span>{a.start_date} → {a.end_date}</span>
                    </div>
                    {a.signed_at && (
                      <div className="agreement-detail-item">
                        <span className="notes-label">Signed At</span>
                        <span>{new Date(a.signed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {a.terms && (
                      <div className="agreement-detail-item agreement-detail-full">
                        <span className="notes-label">Terms</span>
                        <p className="maintenance-desc">{a.terms}</p>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons" style={{ marginTop: '12px' }}>
                    {a.status === 'draft' && (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => handleActivate(a.id)}
                          disabled={actionLoading === a.id}
                        >
                          {actionLoading === a.id ? '...' : 'Activate'}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => openEdit(a)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger-small"
                          onClick={() => setConfirmDelete(a)}
                          disabled={actionLoading === a.id}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateAgreementModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchAgreements(); }}
        />
      )}

      {/* Edit Modal */}
      {editAgreement && (
        <div className="modal-overlay" onClick={() => setEditAgreement(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Agreement</h2>
              <button className="modal-close" onClick={() => setEditAgreement(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editEndDate}
                    min={editStartDate}
                    onChange={e => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={editRent}
                    onChange={e => setEditRent(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={editDeposit}
                    onChange={e => setEditDeposit(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  value={editTerms}
                  onChange={e => setEditTerms(e.target.value)}
                />
              </div>
              {editError && <p className="form-error">{editError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditAgreement(null)} disabled={editSubmitting}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditSubmit} disabled={editSubmitting}>
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Agreement</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the draft agreement with{' '}
                <strong>{confirmDelete.tenant?.email}</strong>? This cannot be undone.
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