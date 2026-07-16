import { useState, useEffect } from 'react';
import type { Assignment } from '../../types/assignment';
import { getAssignments, endAssignment, deleteAssignment } from '../../api/assignment';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Assignment | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd(id: string) {
    setActionLoading(id);
    try {
      const updated = await endAssignment(id);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    try {
      await deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      active: 'badge-success',
      past: 'badge-secondary',
      terminated: 'badge-danger',
    };
    return `badge ${map[status] || 'badge-secondary'}`;
  }

  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    return (
      a.tenant?.email?.toLowerCase().includes(q) ||
      a.tenant?.full_name?.toLowerCase().includes(q) ||
      a.unit?.unit_number?.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="page-loading">Loading assignments...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tenant Assignments</h1>
        <p className="page-subtitle">{assignments.length} total assignment{assignments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by tenant name, email, unit or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No assignments match your search.' : 'No assignments yet. Assign tenants from the Properties page.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="tenant-cell">
                      <span className="tenant-name">{a.tenant?.full_name || '—'}</span>
                      <span className="tenant-email">{a.tenant?.email || '—'}</span>
                    </div>
                  </td>
                  <td>Unit {a.unit?.unit_number || '—'}</td>
                  <td>{a.start_date}</td>
                  <td>{a.end_date || '—'}</td>
                  <td>
                    <span className={statusBadge(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {a.status === 'active' && (
                        <button
                          className="btn-warning-small"
                          onClick={() => handleEnd(a.id)}
                          disabled={actionLoading === a.id}
                        >
                          {actionLoading === a.id ? '...' : 'End'}
                        </button>
                      )}
                      <button
                        className="btn-danger-small"
                        onClick={() => setConfirmDelete(a)}
                        disabled={actionLoading === a.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Assignment</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the assignment for{' '}
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