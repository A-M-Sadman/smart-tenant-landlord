import { useState, useEffect } from 'react';
import { getMyAgreements, acceptAgreement } from '../../api/agreement';

type AgreementStatus = 'draft' | 'active' | 'expired' | 'terminated';

interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

interface Agreement {
  id: string;
  assignment_id: string;
  landlord_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  security_deposit: string;
  terms: string | null;
  status: AgreementStatus;
  signed_at: string | null;
  tenant_accepted_at: string | null;
  created_at: string;
  updated_at: string;
  landlord: UserInfo | null;
  tenant: UserInfo | null;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-secondary',
  active: 'badge-warning',
  expired: 'badge-secondary',
  terminated: 'badge-danger',
};

function getDisplayStatus(agreement: Agreement): { label: string; badge: string } {
  if (agreement.status === 'active' && agreement.tenant_accepted_at) {
    return { label: 'Accepted', badge: 'badge-success' };
  }
  if (agreement.status === 'active' && !agreement.tenant_accepted_at) {
    return { label: 'Pending Acceptance', badge: 'badge-warning' };
  }
  return {
    label: agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1),
    badge: STATUS_BADGE[agreement.status] || 'badge-secondary',
  };
}

export default function TenantAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<Agreement | null>(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  async function fetchAgreements() {
    setLoading(true);
    try {
      const data = await getMyAgreements();
      setAgreements(data);
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    setActionLoading(id);
    try {
      const updated = await acceptAgreement(id);
      setAgreements(prev => prev.map(a => a.id === id ? updated as Agreement : a));
      setConfirmAccept(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="page-loading">Loading agreements...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Agreements</h1>
          <p className="page-subtitle">
            {agreements.length} agreement{agreements.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {agreements.length === 0 ? (
        <div className="empty-state">
          <p>No rental agreements yet. Your landlord will create one once you are assigned to a unit.</p>
        </div>
      ) : (
        <div className="card-list">
          {agreements.map(a => {
            const displayStatus = getDisplayStatus(a);
            return (
              <div key={a.id} className="maintenance-card">
                <div className="maintenance-card-header">
                  <div className="maintenance-card-meta">
                    <span className={`badge ${displayStatus.badge}`}>
                      {displayStatus.label}
                    </span>
                  </div>
                  <button
                    className="btn-ghost-small"
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  >
                    {expanded === a.id ? 'Hide' : 'Details'}
                  </button>
                </div>

                <h3 className="maintenance-card-title">
                  Rental Agreement
                </h3>
                <p className="maintenance-card-category">
                  {a.start_date} → {a.end_date} · ৳{Number(a.monthly_rent).toLocaleString()}/mo
                </p>

                {expanded === a.id && (
                  <div className="maintenance-card-body">
                    <div className="agreement-details-grid">
                      <div className="agreement-detail-item">
                        <span className="notes-label">Landlord</span>
                        <span>{a.landlord?.full_name || a.landlord?.email || '—'}</span>
                      </div>
                      <div className="agreement-detail-item">
                        <span className="notes-label">Monthly Rent</span>
                        <span>৳{Number(a.monthly_rent).toLocaleString()}</span>
                      </div>
                      <div className="agreement-detail-item">
                        <span className="notes-label">Security Deposit</span>
                        <span>৳{Number(a.security_deposit).toLocaleString()}</span>
                      </div>
                      <div className="agreement-detail-item">
                        <span className="notes-label">Period</span>
                        <span>{a.start_date} → {a.end_date}</span>
                      </div>
                      {a.signed_at && (
                        <div className="agreement-detail-item">
                          <span className="notes-label">Signed by Landlord</span>
                          <span>{new Date(a.signed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {a.tenant_accepted_at && (
                        <div className="agreement-detail-item">
                          <span className="notes-label">Accepted by You</span>
                          <span>{new Date(a.tenant_accepted_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {a.terms && (
                        <div className="agreement-detail-item agreement-detail-full">
                          <span className="notes-label">Terms & Conditions</span>
                          <p className="maintenance-desc">{a.terms}</p>
                        </div>
                      )}
                    </div>

                    {a.status === 'active' && !a.tenant_accepted_at && (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          className="btn-primary"
                          onClick={() => setConfirmAccept(a)}
                          disabled={actionLoading === a.id}
                        >
                          Accept Agreement
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {confirmAccept && (
        <div className="modal-overlay" onClick={() => setConfirmAccept(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Accept Agreement</h2>
              <button className="modal-close" onClick={() => setConfirmAccept(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                By accepting this agreement, you confirm that you have read and agree to all the terms
                for the period <strong>{confirmAccept.start_date} → {confirmAccept.end_date}</strong> at{' '}
                <strong>৳{Number(confirmAccept.monthly_rent).toLocaleString()}/month</strong>.
              </p>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmAccept(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => handleAccept(confirmAccept.id)}
                disabled={actionLoading === confirmAccept.id}
              >
                {actionLoading === confirmAccept.id ? 'Accepting...' : 'Yes, Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}