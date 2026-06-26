import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertyApi } from "../../api/property";
import ImageUpload from "../../components/landlord/ImageUpload";

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", address: "", city: "", district: "", description: "", image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      propertyApi.get(id).then((p) =>
        setForm({ name: p.name, address: p.address, city: p.city, district: p.district, description: p.description ?? "", image_url: "" })
      );
    }
  }, [id, isEdit]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        district: form.district,
        description: form.description || undefined,
        image_url: form.image_url || undefined, 
      };
      if (isEdit && id) {
        await propertyApi.update(id, payload);
      } else {
        await propertyApi.create(payload);
      }
      navigate("/landlord/properties");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Edit Property" : "Add Property"}</h1>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property Name</label>
            <input type="text" value={form.name} onChange={set("name")} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={form.address} onChange={set("address")} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" value={form.city} onChange={set("city")} required />
            </div>
            <div className="form-group">
              <label>District</label>
              <input type="text" value={form.district} onChange={set("district")} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={form.description} onChange={set("description")} rows={3} />
          </div>
          <div className="form-group">
            <label>Property Image (optional)</label>
            <ImageUpload
              label="Upload Property Image"
              onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/landlord/properties")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}