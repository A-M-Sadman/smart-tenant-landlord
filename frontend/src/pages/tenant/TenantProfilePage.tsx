import { useEffect, useState, type FormEvent } from "react";
import { tenantApi } from "../../api/tenant";
import type { TenantProfile } from "../../types/tenant";

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nid: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    occupation: "",
    profile_photo_url: "",
  });

  useEffect(() => {
    tenantApi.getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          nid: p.nid ?? "",
          emergency_contact_name: p.emergency_contact_name ?? "",
          emergency_contact_phone: p.emergency_contact_phone ?? "",
          occupation: p.occupation ?? "",
          profile_photo_url: p.profile_photo_url ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await tenantApi.updateProfile({
        nid: form.nid || undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
        occupation: form.occupation || undefined,
        profile_photo_url: form.profile_photo_url || undefined,
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p>Loading…</p></div>;
  if (!profile) return <div className="page"><p>Profile not found.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
        {!editing && (
          <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {/* Account info card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          {profile.profile_photo_url ? (
            <img src={profile.profile_photo_url} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-large">{profile.full_name?.[0]?.toUpperCase()}</div>
          )}
          <div>
            <h2 className="profile-name">{profile.full_name}</h2>
            <p className="profile-email">{profile.email}</p>
            {profile.phone && <p className="profile-phone">{profile.phone}</p>}
          </div>
        </div>
      </div>

      {success && <div className="form-success">{success}</div>}
      {error && <div className="form-error">{error}</div>}

      {editing ? (
        <div className="form-card" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Edit Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>NID Number</label>
                <input type="text" value={form.nid} onChange={set("nid")} placeholder="National ID" />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input type="text" value={form.occupation} onChange={set("occupation")} placeholder="e.g. Software Engineer" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" value={form.emergency_contact_name} onChange={set("emergency_contact_name")} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input type="tel" value={form.emergency_contact_phone} onChange={set("emergency_contact_phone")} />
              </div>
            </div>
            <div className="form-group">
              <label>Profile Photo URL (optional)</label>
              <input type="url" value={form.profile_photo_url} onChange={set("profile_photo_url")} placeholder="https://..." />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="form-card" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Profile Details</h3>
          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <span className="detail-label">NID</span>
              <span className="detail-value">{profile.nid ?? "—"}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Occupation</span>
              <span className="detail-value">{profile.occupation ?? "—"}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Emergency Contact</span>
              <span className="detail-value">{profile.emergency_contact_name ?? "—"}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Emergency Phone</span>
              <span className="detail-value">{profile.emergency_contact_phone ?? "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}