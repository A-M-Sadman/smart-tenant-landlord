import { useState, useEffect } from 'react';
import type { AdminProperty } from '../../types/dashboard';
import { getAdminProperties } from '../../api/dashboard';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.landlord_name?.toLowerCase().includes(q) ||
      p.landlord_email?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="page-loading">Loading properties...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Properties</h1>
          <p className="page-subtitle">{properties.length} total properties</p>
        </div>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name, city, district or landlord..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No properties match your search.' : 'No properties yet.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Units</th>
                <th>Landlord</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="tenant-name">{p.name}</span>
                  </td>
                  <td>
                    <div className="tenant-cell">
                      <span className="tenant-name">{p.city}</span>
                      <span className="tenant-email">{p.district}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{p.total_units} units</span>
                  </td>
                  <td>
                    <div className="tenant-cell">
                      <span className="tenant-name">{p.landlord_name || '—'}</span>
                      <span className="tenant-email">{p.landlord_email || '—'}</span>
                    </div>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}