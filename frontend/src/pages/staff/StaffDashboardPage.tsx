import { useState, useEffect } from 'react';
import { getMyAssignments, updateAssignment } from '../../api/maintenance';
import { useAuth } from '../../context/AuthContext';

type StaffWorkStatus = 'assigned' | 'in_progress' | 'completed';

interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

interface MaintenanceRequest {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tenant: UserInfo | null;
  assignments: any[];
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  attachment_url: string | null;
  tenant_id: string;
}

interface StaffAssignment {
  id: string;
  request_id: string;
  staff_id: string;
  assigned_by: string;
  notes: string | null;
  status: StaffWorkStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  request: MaintenanceRequest | null;
  assigner: UserInfo | null;
}

interface StaffDashboard {
  total_assigned: number;
  in_progress: number;
  completed: number;
}

const STATUS_LABELS: Record<StaffWorkStatus, string> = {
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_BADGE: Record<StaffWorkStatus, string> = {
  assigned: 'badge-secondary',
  in_progress: 'badge-warning',
  completed: 'badge-success',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'badge-secondary',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
};

async function getStaffDashboard(): Promise<StaffDashboard> {
  const res = await fetch('http://localhost:8000/api/v1/dashboard/staff', {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [a, d] = await Promise.all([getMyAssignments(), getStaffDashboard()]);
        setAssignments(a);
        setDashboard(d);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleStatusUpdate(id: string, status: StaffWorkStatus) {
    setActionLoading(id);
    try {
      const updated = await updateAssignment(id, { status });
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      setDashboard(prev => {
        if (!prev) return prev;
        const newStats = { ...prev };
        if (status === 'in_progress') {
          newStats.total_assigned = Math.max(0, newStats.total_assigned - 1);
          newStats.in_progress += 1;
        } else if (status === 'completed') {
          newStats.in_progress = Math.max(0, newStats.in_progress - 1);
          newStats.completed += 1;
        }
        return newStats;
      });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const pending = assignments.filter(a => a.status !== 'completed');
  const completed = assignments.filter(a => a.status === 'completed');

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Your maintenance assignment overview</p>
        </div>
      </div>

      {/* Stat cards */}
      {dashboard && (
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.total_assigned}</span>
              <span className="stat-label">New Assignments</span>
            </div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">⚙️</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.in_progress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card stat-card-teal">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.total_assigned + dashboard.in_progress + dashboard.completed}</span>
              <span className="stat-label">Total All Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>No assignments yet. Check back when a landlord assigns you work.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="section">
              <h2 className="section-title">Active</h2>
              <div className="card-list">
                {pending.map(a => (
                  <div key={a.id} className="maintenance-card">
                    <div className="maintenance-card-header">
                      <div className="maintenance-card-meta">
                        <span className={`badge ${STATUS_BADGE[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                        {a.request && (
                          <span className={`badge ${PRIORITY_BADGE[a.request.priority]}`}>
                            {a.request.priority}
                          </span>
                        )}
                      </div>
                      <button
                        className="btn-ghost-small"
                        onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                      >
                        {expanded === a.id ? 'Hide' : 'Details'}
                      </button>
                    </div>

                    <h3 className="maintenance-card-title">{a.request?.title || '—'}</h3>
                    <p className="maintenance-card-category">
                      {a.request?.category} · Unit {a.request?.unit_id.slice(0, 8)}...
                    </p>

                    {expanded === a.id && (
                      <div className="maintenance-card-body">
                        <p className="maintenance-desc">{a.request?.description}</p>
                        {a.notes && (
                          <div className="maintenance-notes">
                            <span className="notes-label">Notes from landlord:</span>
                            <p>{a.notes}</p>
                          </div>
                        )}
                        <p className="maintenance-meta-text">
                          Assigned by: {a.assigner?.full_name || a.assigner?.email || '—'}
                        </p>
                        <p className="maintenance-meta-text">
                          Assigned on: {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="maintenance-card-actions">
                      {a.status === 'assigned' && (
                        <button
                          className="btn-primary"
                          onClick={() => handleStatusUpdate(a.id, 'in_progress')}
                          disabled={actionLoading === a.id}
                        >
                          {actionLoading === a.id ? '...' : 'Start Work'}
                        </button>
                      )}
                      {a.status === 'in_progress' && (
                        <button
                          className="btn-success"
                          onClick={() => handleStatusUpdate(a.id, 'completed')}
                          disabled={actionLoading === a.id}
                        >
                          {actionLoading === a.id ? '...' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="section">
              <h2 className="section-title">Completed</h2>
              <div className="card-list">
                {completed.map(a => (
                  <div key={a.id} className="maintenance-card maintenance-card-done">
                    <div className="maintenance-card-header">
                      <span className={`badge ${STATUS_BADGE[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                    <h3 className="maintenance-card-title">{a.request?.title || '—'}</h3>
                    <p className="maintenance-card-category">{a.request?.category}</p>
                    {a.completed_at && (
                      <p className="maintenance-meta-text">
                        Completed: {new Date(a.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}