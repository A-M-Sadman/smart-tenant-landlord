import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TenantDashboard {
  pending_payments: number;
  open_maintenance: number;
  open_complaints: number;
  has_active_agreement: boolean;
  agreement_end_date: string | null;
  unit_number: string | null;
  property_name: string | null;
}

async function getTenantDashboard(): Promise<TenantDashboard> {
  const res = await fetch('/api/v1/dashboard/tenant', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export default function TenantHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<TenantDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">
            {dashboard?.unit_number
              ? `Unit ${dashboard.unit_number}${dashboard.property_name ?  `· ${dashboard.property_name}` : ''}`
              : 'No active unit assignment'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div
          className={`stat-card ${dashboard?.pending_payments ? 'stat-card-warning' : 'stat-card-blue'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/tenant/payments')}
        >
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.pending_payments ?? 0}</span>
            <span className="stat-label">Pending Payments</span>
          </div>
        </div>

        <div
          className={`stat-card ${dashboard?.open_maintenance ? 'stat-card-purple' : 'stat-card-green'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/tenant/maintenance')}
        >
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.open_maintenance ?? 0}</span>
            <span className="stat-label">Open Maintenance</span>
          </div>
        </div>

        <div
          className={`stat-card ${dashboard?.open_complaints ? 'stat-card-purple' : 'stat-card-teal'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/tenant/complaints')}
        >
          <div className="stat-icon">📢</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.open_complaints ?? 0}</span>
            <span className="stat-label">Open Complaints</span>
          </div>
        </div>

        <div
          className="stat-card stat-card-green"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/tenant/agreements')}
        >
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.has_active_agreement ? 'Active' : 'None'}</span>
            <span className="stat-label">Agreement</span>
          </div>
        </div>
      </div>

      {/* Agreement end date notice */}
      {dashboard?.has_active_agreement && dashboard?.agreement_end_date && (
        <div className="maintenance-notes" style={{ marginBottom: '24px' }}>
          <p className="maintenance-meta-text">
            📅 Your rental agreement is active until{' '}
            <strong>{new Date(dashboard.agreement_end_date).toLocaleDateString()}</strong>
          </p>
        </div>
      )}

      {!dashboard?.unit_number && (
        <div className="maintenance-notes" style={{ marginBottom: '24px' }}>
          <p className="maintenance-meta-text">
            ⚠️ You are not assigned to a unit yet. Contact your landlord to get started.
          </p>
        </div>
      )}

      {/* Quick links */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-links-grid">
        <div className="quick-link-card" onClick={() => navigate('/tenant/maintenance')}>
          <span className="quick-link-icon">🔧</span>
          <span className="quick-link-label">Submit Maintenance Request</span>
        </div>
        <div className="quick-link-card" onClick={() => navigate('/tenant/complaints')}>
          <span className="quick-link-icon">📢</span>
          <span className="quick-link-label">Submit Complaint</span>
        </div>
        <div className="quick-link-card" onClick={() => navigate('/tenant/payments')}>
          <span className="quick-link-icon">💰</span>
          <span className="quick-link-label">View Payments</span>
        </div>
        <div className="quick-link-card" onClick={() => navigate('/tenant/agreements')}>
          <span className="quick-link-icon">📄</span>
          <span className="quick-link-label">View Agreement</span>
        </div>
      </div>
    </div>
  );
}