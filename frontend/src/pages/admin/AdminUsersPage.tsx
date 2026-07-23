import { useState, useEffect } from 'react';
import type { AdminUser } from '../../types/dashboard';
import { getAdminUsers, activateUser, deactivateUser } from '../../api/dashboard';

const ROLE_BADGE: Record<string, string> = {
  admin: 'badge-danger',
  landlord: 'badge-info',
  tenant: 'badge-success',
  maintenance_staff: 'badge-warning',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(user: AdminUser) {
    setActionLoading(user.id);
    try {
      const updated = user.is_active
        ? await deactivateUser(user.id)
        : await activateUser(user.id);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => {
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });

  if (loading) return <div className="page-loading">Loading users...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} total users</p>
        </div>
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="landlord">Landlord</option>
          <option value="tenant">Tenant</option>
          <option value="maintenance_staff">Maintenance Staff</option>
        </select>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No users match your search.' : 'No users found.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><span className="tenant-name">{u.full_name}</span></td>
                  <td><span className="tenant-email">{u.email}</span></td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[u.role] || 'badge-secondary'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={u.is_active ? 'btn-warning-small' : 'btn-primary'}
                        style={!u.is_active ? { padding: '4px 12px', fontSize: '0.8rem' } : {}}
                        onClick={() => handleToggle(u)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id
                          ? '...'
                          : u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}