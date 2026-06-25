import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertyApi } from "../../api/property";

export default function UnitForm() {
  const { id: propertyId, unitId } = useParams();
  const isEdit = Boolean(unitId);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    unit_number: "", floor: "", bedrooms: "1", bathrooms: "1", area_sqft: "", rent_amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && propertyId && unitId) {
      propertyApi.getUnit(propertyId, unitId).then((u) =>
        setForm({
          unit_number: u.unit_number,
          floor: u.floor?.toString() ?? "",
          bedrooms: u.bedrooms.toString(),
          bathrooms: u.bathrooms.toString(),
          area_sqft: u.area_sqft?.toString() ?? "",
          rent_amount: u.rent_amount.toString(),
        })
      );
    }
  }, [isEdit, propertyId, unitId]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        unit_number: form.unit_number,
        floor: form.floor ? parseInt(form.floor) : undefined,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        area_sqft: form.area_sqft ? parseFloat(form.area_sqft) : undefined,
        rent_amount: parseFloat(form.rent_amount),
      };
      if (isEdit && propertyId && unitId) {
        await propertyApi.updateUnit(propertyId, unitId, payload);
      } else if (propertyId) {
        await propertyApi.createUnit(propertyId, payload);
      }
      navigate(`/landlord/properties/${propertyId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Edit Unit" : "Add Unit"}</h1>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Unit Number</label>
              <input type="text" value={form.unit_number} onChange={set("unit_number")} required placeholder="e.g. A-101" />
            </div>
            <div className="form-group">
              <label>Floor (optional)</label>
              <input type="number" value={form.floor} onChange={set("floor")} placeholder="e.g. 1" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={set("bedrooms")} min="1" required />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={set("bathrooms")} min="1" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area (sqft, optional)</label>
              <input type="number" value={form.area_sqft} onChange={set("area_sqft")} placeholder="e.g. 850" />
            </div>
            <div className="form-group">
              <label>Rent Amount (৳/mo)</label>
              <input type="number" value={form.rent_amount} onChange={set("rent_amount")} required placeholder="e.g. 15000" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/landlord/properties/${propertyId}`)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}