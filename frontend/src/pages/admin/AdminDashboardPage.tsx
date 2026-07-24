import { useState, useEffect } from 'react';
import type { PlatformStats } from '../../types/dashboard';
import { getPlatformStats } from '../../api/dashboard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading stats...</div>;
  if (!stats) return <div className="page-error">Failed to load stats</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview</p>
        </div>
      </div>

      {/* User stats */}
      <h2 className="section-title">Users</h2>
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_users}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_landlords}</span>
            <span className="stat-label">Landlords</span>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_tenants}</span>
            <span className="stat-label">Tenants</span>
          </div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_maintenance_staff}</span>
            <span className="stat-label">Maintenance Staff</span>
          </div>
        </div>
      </div>

      {/* Property stats */}
      <h2 className="section-title" style={{ marginTop: '32px' }}>Properties</h2>
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">🏠</div>
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
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_active_assignments}</span>
            <span className="stat-label">Active Assignments</span>
          </div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total_active_agreements}</span>
            <span className="stat-label">Active Agreements</span>
          </div>
        </div>
      </div>

      {/* Activity stats */}
      <h2 className="section-title" style={{ marginTop: '32px' }}>Activity</h2>
      <div className="stats-grid stats-grid-wide">
        <div className={`stat-card-sm ${stats.total_open_complaints > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">📢</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.total_open_complaints}</span>
            <span className="stat-sm-label">Open Complaints</span>
          </div>
        </div>
        <div className={`stat-card-sm ${stats.total_open_maintenance > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">🔧</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.total_open_maintenance}</span>
            <span className="stat-sm-label">Open Maintenance</span>
          </div>
        </div>
        <div className={`stat-card-sm ${stats.total_pending_payments > 0 ? 'stat-sm-warning' : 'stat-sm-neutral'}`}>
          <span className="stat-sm-icon">💰</span>
          <div className="stat-sm-info">
            <span className="stat-sm-value">{stats.total_pending_payments}</span>
            <span className="stat-sm-label">Pending Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}