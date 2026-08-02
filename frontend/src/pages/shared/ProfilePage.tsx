import { useState, useEffect, useRef } from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

const CLOUDINARY_CLOUD = 'dmk7xvsvx';
const CLOUDINARY_PRESET = 'smart_tenant_upload';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me', { headers: authHeaders() });
        const data = await res.json();
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');

        // Fetch profile image for tenants
        if (data.role === 'tenant') {
          const tRes = await fetch('/api/v1/tenant/profile', { headers: authHeaders() });
          if (tRes.ok) {
            const tData = await tRes.json();
            if (tData.profile_image_url) setProfileImg(tData.profile_image_url);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      // Update tenant profile with new image
      await fetch('/api/v1/tenant/profile', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ profile_image_url: imageUrl }),
      });

      setProfileImg(imageUrl);
    } catch {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!fullName.trim()) return setError('Name cannot be empty');
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/v1/auth/users/me', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const roleLabel: Record<string, string> = {
    landlord: 'Landlord',
    tenant: 'Tenant',
    maintenance_staff: 'Maintenance Staff',
    admin: 'Admin',
  };

  if (loading) return <div className="page-loading">Loading profile...</div>;
  if (!profile) return <div className="page-error">Failed to load profile</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saved && (
            <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              ✓ Saved
            </span>
          )}
          {!editing && (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {profileImg ? (
              <img
                src={profileImg}
                alt="Profile"
                className="profile-avatar-img"
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="profile-avatar-large">
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
            )}
            {/* Upload button for tenants */}
            {profile.role === 'tenant' && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Change photo"
                >
                  {uploading ? '…' : '✎'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </>
            )}
          </div>
          <div>
            <p className="profile-name">{profile.full_name}</p>
            <p className="profile-email">{profile.email}</p>
            {profile.phone && <p className="profile-phone">{profile.phone}</p>}
            {profile.role === 'tenant' && (
              <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
                Click the pencil icon to change your photo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="profile-card">
        <h2 className="section-title" style={{ margin: '0 0 16px' }}>Account Details</h2>
        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <span className="detail-label">Role</span>
            <span className="detail-value">{roleLabel[profile.role] || profile.role}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{profile.email}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{profile.phone || '—'}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Account Status</span>
            <span
              className={`badge ${profile.is_active ? 'badge-success' : 'badge-danger'}`}
              style={{ display: 'inline-flex', width: 'fit-content' }}
            >
              {profile.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setEditing(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <p className="search-hint">Email cannot be changed</p>
              </div>
              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
