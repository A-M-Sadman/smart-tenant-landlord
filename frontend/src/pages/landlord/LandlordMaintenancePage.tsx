import { useState, useEffect, useRef } from 'react';
import type {
  MaintenanceRequest,
  RequestStatus,
  RequestPriority,
} from '../../types/maintenance';
import { getAllRequests, updateRequest, assignStaff } from '../../api/maintenance';

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

const STATUSES: RequestStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
const PRIORITIES: RequestPriority[] = ['low', 'medium', 'high', 'urgent'];

interface StaffResult {
  id: string;
  email: string;
  full_name: string | null;
}

interface AssignModalState {
  requestId: string;
  staffEmail: string;
  staffId: string;
  staffName: string;
  notes: string;
  results: StaffResult[];
  searching: boolean;
  error: string;
  submitting: boolean;
}

export default function LandlordMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<AssignModalState | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: RequestStatus) {
    setActionLoading(id);
    try {
      const updated = await updateRequest(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePriorityChange(id: string, priority: RequestPriority) {
    setActionLoading(id + '-priority');
    try {
      const updated = await updateRequest(id, { priority });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function handleStaffEmailChange(email: string) {
    if (!assignModal) return;
    setAssignModal({ ...assignModal, staffEmail: email, staffId: '', staffName: '', results: [], searching: email.length >= 2 });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (email.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/maintenance/staff/search?email=${encodeURIComponent(email)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setAssignModal(prev => prev ? { ...prev, results: data, searching: false } : null);
        } else {
          setAssignModal(prev => prev ? { ...prev, results: [], searching: false } : null);
        }
      } catch {
        setAssignModal(prev => prev ? { ...prev, results: [], searching: false } : null);
      }
    }, 400);
  }

  async function handleAssignSubmit() {
    if (!assignModal || !assignModal.staffId) return;
    setAssignModal({ ...assignModal, submitting: true, error: '' });
    try {
      const updated = await assignStaff(assignModal.requestId, {
        staff_id: assignModal.staffId,
        notes: assignModal.notes || null,
      });
      setRequests(prev => prev.map(r => r.id === assignModal.requestId ? updated : r));
      setAssignModal(null);
    } catch (e: any) {
      setAssignModal(prev => prev ? { ...prev, error: e.message, submitting: false } : null);
    }
  }

  const filtered = requests
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.tenant?.email?.toLowerCase().includes(q) ||
        r.tenant?.full_name?.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });

  if (loading) return <div className="page-loading">Loading maintenance requests...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Requests</h1>
          <p className="page-subtitle">{requests.length} total requests</p>
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

      {/* Search */}
      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by title, category, tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No requests match your search.' : 'No maintenance requests yet.'}</p>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(req => (
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
                {req.category} · Tenant: {req.tenant?.full_name || req.tenant?.email || '—'} ·{' '}
                {new Date(req.created_at).toLocaleDateString()}
              </p>

              {expanded === req.id && (
                <div className="maintenance-card-body">
                  <p className="maintenance-desc">{req.description}</p>

                  <div className="form-row" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-input"
                        value={req.status}
                        disabled={actionLoading === req.id}
                        onChange={e => handleStatusChange(req.id, e.target.value as RequestStatus)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-input"
                        value={req.priority}
                        disabled={actionLoading === req.id + '-priority'}
                        onChange={e => handlePriorityChange(req.id, e.target.value as RequestPriority)}
                      >
                        {PRIORITIES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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

                  <button
                    className="btn-primary"
                    style={{ marginTop: '12px' }}
                    onClick={() => setAssignModal({
                      requestId: req.id,
                      staffEmail: '',
                      staffId: '',
                      staffName: '',
                      notes: '',
                      results: [],
                      searching: false,
                      error: '',
                      submitting: false,
                    })}
                  >
                    Assign Staff
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Staff Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Maintenance Staff</h2>
              <button className="modal-close" onClick={() => setAssignModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Search Staff by Email</label>
                {assignModal.staffId ? (
                  <div className="selected-tenant">
                    <div className="selected-tenant-info">
                      <span className="tenant-name">{assignModal.staffName || 'Staff member'}</span>
                      <span className="tenant-email">{assignModal.staffEmail}</span>
                    </div>
                    <button
                      className="btn-ghost-small"
                      onClick={() => setAssignModal({ ...assignModal, staffId: '', staffName: '', staffEmail: '', results: [] })}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type staff email..."
                      value={assignModal.staffEmail}
                      onChange={e => handleStaffEmailChange(e.target.value)}
                    />
                    {assignModal.searching && <p className="search-hint">Searching...</p>}
                    {!assignModal.searching && assignModal.staffEmail.length >= 2 && assignModal.results.length === 0 && (
                      <p className="search-hint">No maintenance staff found</p>
                    )}
                    {assignModal.results.length > 0 && (
                      <div className="search-results">
                        {assignModal.results.map(s => (
                          <div
                            key={s.id}
                            className="search-result-item"
                            onClick={() => setAssignModal({
                              ...assignModal,
                              staffId: s.id,
                              staffName: s.full_name || s.email,
                              staffEmail: s.email,
                              results: [],
                            })}
                          >
                            <span className="tenant-name">{s.full_name || 'No name'}</span>
                            <span className="tenant-email">{s.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Instructions for the staff member..."
                  value={assignModal.notes}
                  onChange={e => setAssignModal({ ...assignModal, notes: e.target.value })}
                  rows={3}
                />
              </div>
              {assignModal.error && <p className="form-error">{assignModal.error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setAssignModal(null)} disabled={assignModal.submitting}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAssignSubmit}
                disabled={assignModal.submitting || !assignModal.staffId}
              >
                {assignModal.submitting ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}