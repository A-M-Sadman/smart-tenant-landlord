import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertyApi } from "../../api/property";
import type { Property } from "../../types/property";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    propertyApi.list().then(setProperties).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await propertyApi.delete(deleteId);
    setProperties((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.district.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page"><p>Loading…</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">{filtered.length} propert{filtered.length === 1 ? "y" : "ies"}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/landlord/properties/new")}>
          + Add Property
        </button>
      </div>

      {/* Search */}
      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name, city, district or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No properties match your search.' : 'No properties yet. Add your first one.'}</p>
        </div>
      ) : (
        <div className="property-grid">
          {filtered.map((p) => (
            <div key={p.id} className="property-card">
              <div className="property-card-header">
                <h3>{p.name}</h3>
                <span className="badge badge-blue">{p.total_units} units</span>
              </div>
              {typeof p.image_url === "string" && p.image_url && (
                <img
                  src={p.image_url}
                  alt={typeof p.name === "string" ? p.name : ""}
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }}
                />
              )}
              <p className="property-address">{p.address}, {p.city}</p>
              <p className="property-district">{p.district}</p>
              {p.description && <p className="property-desc">{p.description}</p>}
              <div className="property-card-actions">
                <button className="btn-secondary" onClick={() => navigate(`/landlord/properties/${p.id}`)}>
                  View
                </button>
                <button className="btn-secondary" onClick={() => navigate(`/landlord/properties/${p.id}/edit`)}>
                  Edit
                </button>
                <button className="btn-danger-outline" onClick={() => setDeleteId(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete Property?</h2>
            <p>This will permanently delete the property and all its units. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}