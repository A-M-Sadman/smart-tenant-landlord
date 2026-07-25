import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { Analytics } from '../../types/analytics';
import { getAnalytics } from '../../api/analytics';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

function formatMonth(month: string): string {
  const [year, mo] = month.split('-');
  const date = new Date(Number(year), Number(mo) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading analytics...</div>;
  if (error || !analytics) return <div className="page-error">{error || 'No data'}</div>;

  const revenueData = analytics.revenue.map(r => ({
    ...r,
    month: formatMonth(r.month),
  }));

  const paymentData = analytics.payment_trends.map(p => ({
    ...p,
    month: formatMonth(p.month),
  }));

  const maintenanceData = analytics.maintenance_trends.map(m => ({
    ...m,
    month: formatMonth(m.month),
  }));

  const occupancyPieData = [
    { name: 'Occupied', value: analytics.occupancy.occupied_units },
    { name: 'Vacant', value: analytics.occupancy.vacant_units },
  ];

  const complaintData = analytics.complaint_categories.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.count,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Last 6 months overview</p>
        </div>
      </div>

      {/* Occupancy summary */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <span className="stat-value">{analytics.occupancy.total_units}</span>
            <span className="stat-label">Total Units</span>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{analytics.occupancy.occupied_units}</span>
            <span className="stat-label">Occupied</span>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <span className="stat-value">{analytics.occupancy.vacant_units}</span>
            <span className="stat-label">Vacant</span>
          </div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{analytics.occupancy.occupancy_rate}%</span>
            <span className="stat-label">Occupancy Rate</span>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="chart-card">
        <h2 className="chart-title">Revenue Overview</h2>
        <p className="chart-subtitle">Monthly rent collected vs pending (৳)</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
            formatter={(value) => {
                const numericValue =
                typeof value === "number" ? value : Number(value ?? 0);
                return `৳${numericValue.toLocaleString()}`;
            }}
            />
            <Legend />
            <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment trends */}
      <div className="chart-card">
        <h2 className="chart-title">Payment Trends</h2>
        <p className="chart-subtitle">Monthly payment status breakdown</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={paymentData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="paid" name="Paid" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="overdue" name="Overdue" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Maintenance trends */}
      <div className="chart-card">
        <h2 className="chart-title">Maintenance Requests</h2>
        <p className="chart-subtitle">Open vs resolved requests over time</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={maintenanceData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="open" name="Open" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row — occupancy pie + complaints bar */}
      <div className="charts-row">
        {/* Occupancy pie */}
        <div className="chart-card chart-card-half">
          <h2 className="chart-title">Occupancy Breakdown</h2>
          <p className="chart-subtitle">Current unit occupancy</p>
          {analytics.occupancy.total_units === 0 ? (
            <div className="empty-state"><p>No units yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaints by category */}
        <div className="chart-card chart-card-half">
          <h2 className="chart-title">Complaints by Category</h2>
          <p className="chart-subtitle">Total complaints per category</p>
          {complaintData.length === 0 ? (
            <div className="empty-state"><p>No complaints yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={complaintData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Complaints" radius={[0, 4, 4, 0]}>
                  {complaintData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}