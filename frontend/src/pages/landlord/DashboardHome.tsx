import { useState, useEffect } from 'react';
import type { LandlordDashboard } from '../../types/dashboard';
import { getLandlordDashboard } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';

const ACTIVITY_ICON: Record<string, string> = {
  maintenance: '🔧',
  complaint: '📢',
  payment: '💰',
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<LandlordDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLandlordDashboard()
      .then(setDashboard)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error || !dashboard) return <div className="page-error">{error || 'No data'}</div>;

  const { stats, recent_activity } = dashboard;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's an overview of your properties</p>
        </div>
      </div>

      {/* Primary stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_properties}</span>
            <span className="stat-label">Properties</span>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">🚪</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_units}</span>
            <span className="stat-label">Units</span>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_tenants}</span>
            <span className="stat-label">Active Tenants</span>
          </div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.open_assignments}</span>
            <span className="stat-label">Active Assignments</span>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="stats-grid stats-grid-wide">
        <div className={`stat-card-sm ${stats.open_maintenance_requests > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">🔧</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.open_maintenance_requests}</span>
            <span className="stat-sm-label">Open Maintenance</span>
          </div>
        </div>
        <div className={`stat-card-sm ${stats.pending_payments > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">💰</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.pending_payments}</span>
            <span className="stat-sm-label">Pending Payments</span>
          </div>
        </div>
        <div className={`stat-card-sm ${stats.overdue_payments > 0 ? 'stat-sm-danger' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">⚠️</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.overdue_payments}</span>
            <span className="stat-sm-label">Overdue Payments</span>
          </div>
        </div>
        <div className={`stat-card-sm ${stats.open_complaints > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">📢</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.open_complaints}</span>
            <span className="stat-sm-label">Open Complaints</span>
          </div>
        </div>
        <div className="stat-card-sm stat-sm-neutral">
          <span className="stat-sm-icon">📄</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.open_agreements}</span>
            <span className="stat-sm-label">Active Agreements</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section" style={{ marginTop: '32px' }}>
        <h2 className="section-title">Recent Activity</h2>
        {recent_activity.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity yet.</p>
          </div>
        ) : (
          <div className="activity-list">
            {recent_activity.map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{ACTIVITY_ICON[a.type] || '📌'}</span>
                <div className="activity-info">
                  <p className="activity-desc">{a.description}</p>
                  <span className="activity-time">
                    {new Date(a.timestamp).toLocaleDateString()} at{' '}
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}