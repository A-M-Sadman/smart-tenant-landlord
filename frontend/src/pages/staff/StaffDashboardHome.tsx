import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface StaffDashboard {
  total_assigned: number;
  in_progress: number;
  completed: number;
}

async function getStaffDashboard(): Promise<StaffDashboard> {
  const res = await fetch('/api/v1/dashboard/staff', {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function StaffDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Your maintenance assignment overview</p>
        </div>
      </div>

      {dashboard && (
        <div className="stats-grid">
          <div
            className="stat-card stat-card-blue"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/staff/assignments')}
          >
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.total_assigned}</span>
              <span className="stat-label">New Assignments</span>
            </div>
          </div>
          <div
            className="stat-card stat-card-purple"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/staff/assignments')}
          >
            <div className="stat-icon">⚙️</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.in_progress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div
            className="stat-card stat-card-green"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/staff/assignments')}
          >
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{dashboard.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card stat-card-teal">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">
                {dashboard.total_assigned + dashboard.in_progress + dashboard.completed}
              </span>
              <span className="stat-label">Total All Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick link */}
      <div style={{ marginTop: '32px' }}>
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '480px' }}>
          <div className="quick-link-card" onClick={() => navigate('/staff/assignments')}>
            <span className="quick-link-icon">🔧</span>
            <span className="quick-link-label">View My Assignments</span>
          </div>
          <div className="quick-link-card" onClick={() => navigate('/staff/assignments')}>
            <span className="quick-link-icon">✅</span>
            <span className="quick-link-label">Update Work Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}