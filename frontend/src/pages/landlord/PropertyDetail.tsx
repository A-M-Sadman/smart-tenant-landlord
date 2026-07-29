import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertyApi } from "../../api/property";
import type { Property, Unit } from "../../types/property";
import AssignTenantModal from '../../components/landlord/AssignTenantModal';
import { getAssignments } from '../../api/assignment';



// const STATUS_COLORS: Record<string, string> = {
//   vacant: "badge-green",
//   occupied: "badge-blue",
//   maintenance: "badge-orange",
// };

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  const [assigningUnit, setAssigningUnit] = useState<{id: string, unit_number: string} | null>(null);
  const [occupiedUnitIds, setOccupiedUnitIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      propertyApi.get(id).then(setProperty),
      fetchUnits(),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleDeleteUnit = async () => {
    if (!id || !deleteUnitId) return;
    await propertyApi.deleteUnit(id, deleteUnitId);
    setUnits((prev) => prev.filter((u) => u.id !== deleteUnitId));
    setDeleteUnitId(null);
  };

  

  const fetchUnits = async () => {
    if (!id) return;
    const [fetchedUnits, assignments] = await Promise.all([
      propertyApi.listUnits(id),
      getAssignments(),  
    ]);
    setUnits(fetchedUnits);
    const occupied = new Set(
      assignments
        .filter(a => a.status === 'active')
        .map(a => a.unit_id)
    );
    setOccupiedUnitIds(occupied);
  };

  if (loading) return <div className="page"><p>Loading…</p></div>;
  if (!property) return <div className="page"><p>Property not found.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{property.name}</h1>
          <p className="page-subtitle">{property.address}, {property.city} — {property.district}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-secondary" onClick={() => navigate(`/landlord/properties/${id}/edit`)}>
            Edit Property
          </button>
          <button className="btn-primary" onClick={() => navigate(`/landlord/properties/${id}/units/new`)}>
            + Add Unit
          </button>
        </div>
      </div>

      {property.description && <p className="property-desc" style={{ marginBottom: "1.5rem" }}>{property.description}</p>}

      <h2 className="section-title">Units ({units.length})</h2>

      {units.length === 0 ? (
        <div className="empty-state"><p>No units yet. Add the first unit.</p></div>
      ) : (
        <div className="unit-grid">
          {units.map((unit) => (
            <div key={unit.id} className="unit-card">
              <div className="unit-card-header">
                <h3>Unit {unit.unit_number}</h3>
              </div>
              <div className="unit-details">
                {unit.floor != null && <span>Floor {unit.floor}</span>}
                <span>{unit.bedrooms} bed · {unit.bathrooms} bath</span>
                {unit.area_sqft && <span>{unit.area_sqft} sqft</span>}
                <span className="unit-rent">৳ {Number(unit.rent_amount).toLocaleString()}/mo</span>
              </div>
              <div className="property-card-actions">
                <button className="btn-secondary" onClick={() => navigate(`/landlord/properties/${id}/units/${unit.id}/edit`)}>
                  Edit
                </button>
                <button className="btn-danger-outline" onClick={() => setDeleteUnitId(unit.id)}>
                  Delete
                </button>
              </div>
              <div className="unit-occupancy">
                <span className={`badge ${occupiedUnitIds.has(unit.id) ? 'badge-danger' : 'badge-success'}`}>
                  {occupiedUnitIds.has(unit.id) ? 'Occupied' : 'Vacant'}
                </span>
                {!occupiedUnitIds.has(unit.id) && (
                  <button className="btn-primary-small" onClick={() => setAssigningUnit(unit)}>
                    Assign Tenant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteUnitId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete Unit?</h2>
            <p>This will permanently remove this unit. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteUnitId(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteUnit}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {assigningUnit && (
        <AssignTenantModal
          unitId={assigningUnit.id}
          unitNumber={assigningUnit.unit_number}
          onClose={() => setAssigningUnit(null)}
          onAssigned={() => { setAssigningUnit(null); fetchUnits(); }}
        />
      )}
    </div>
  );
}
