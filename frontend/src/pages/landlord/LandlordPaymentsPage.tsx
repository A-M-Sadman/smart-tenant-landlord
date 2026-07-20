import { useState, useEffect } from 'react';
import type { Payment, PaymentStatus, PaymentMethod } from '../../types/payment';
import { getPayments, createPayment, updatePayment, deletePayment } from '../../api/payment';
import { getAgreements } from '../../api/agreement';
import type { Agreement } from '../../types/agreement';

const STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: 'badge-warning',
  paid: 'badge-success',
  overdue: 'badge-danger',
  partial: 'badge-info',
};

const METHODS: PaymentMethod[] = ['cash', 'bank_transfer', 'mobile_banking', 'other'];
const STATUSES: PaymentStatus[] = ['pending', 'paid', 'overdue', 'partial'];

export default function LandlordPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);

  // Create form state
  const [agreementId, setAgreementId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [txRef, setTxRef] = useState('');
  const [notes, setNotes] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      getPayments(),
      getAgreements(),
    ]).then(([p, a]) => {
      setPayments(p);
      setAgreements(a.filter((ag: Agreement) => ag.status === 'active'));
    }).finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setAgreementId('');
    setAmount('');
    setDueDate('');
    setPaidDate('');
    setMethod('cash');
    setStatus('pending');
    setTxRef('');
    setNotes('');
    setCreateError('');
  }

  async function handleCreate() {
    if (!agreementId) return setCreateError('Please select an agreement');
    if (!amount || Number(amount) <= 0) return setCreateError('Please enter a valid amount');
    if (!dueDate) return setCreateError('Please set a due date');
    setCreateError('');
    setCreating(true);
    try {
      const newPayment = await createPayment({
        agreement_id: agreementId,
        amount: Number(amount),
        due_date: dueDate,
        payment_method: method,
        paid_date: paidDate || null,
        status,
        transaction_reference: txRef || null,
        notes: notes || null,
      });
      setPayments(prev => [newPayment, ...prev]);
      setShowCreate(false);
      resetForm();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleMarkPaid(id: string) {
    setActionLoading(id);
    try {
      const updated = await updatePayment(id, {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      });
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    try {
      await deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = payments
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => {
      const q = search.toLowerCase();
      return (
        p.tenant?.full_name?.toLowerCase().includes(q) ||
        p.tenant?.email?.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.due_date.includes(q) ||
        p.transaction_reference?.toLowerCase().includes(q)
      );
    });

  if (loading) return <div className="page-loading">Loading payments...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rent Payments</h1>
          <p className="page-subtitle">{payments.length} total payment{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => { setShowCreate(true); resetForm(); }}>
            + New Payment
          </button>
        </div>
      </div>

      <div className="search-bar-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by tenant, status, date or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No payments match your search.' : 'No payments yet. Create one using the button above.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Paid Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <>
                  <tr key={p.id}>
                    <td>
                      <div className="tenant-cell">
                        <span className="tenant-name">{p.tenant?.full_name || '—'}</span>
                        <span className="tenant-email">{p.tenant?.email || '—'}</span>
                      </div>
                    </td>
                    <td>৳{Number(p.amount).toLocaleString()}</td>
                    <td>{p.due_date}</td>
                    <td>{p.paid_date || '—'}</td>
                    <td>{p.payment_method.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[p.status]}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-ghost-small"
                          onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        >
                          {expanded === p.id ? 'Hide' : 'Details'}
                        </button>
                        {p.status !== 'paid' && (
                          <button
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={actionLoading === p.id}
                          >
                            {actionLoading === p.id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                        <button
                          className="btn-danger-small"
                          onClick={() => setConfirmDelete(p)}
                          disabled={actionLoading === p.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === p.id && (
                    <tr key={p.id + '-detail'}>
                      <td colSpan={7}>
                        <div className="payment-detail-row">
                          {p.transaction_reference && (
                            <div className="agreement-detail-item">
                              <span className="notes-label">Transaction Ref</span>
                              <span>{p.transaction_reference}</span>
                            </div>
                          )}
                          {p.notes && (
                            <div className="agreement-detail-item">
                              <span className="notes-label">Notes</span>
                              <span>{p.notes}</span>
                            </div>
                          )}
                          <div className="agreement-detail-item">
                            <span className="notes-label">Agreement Period</span>
                            <span>{p.agreement?.start_date} → {p.agreement?.end_date}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Rent Payment</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Agreement *</label>
                {agreements.length === 0 ? (
                  <p className="form-error">No active agreements found.</p>
                ) : (
                  <select
                    className="form-input"
                    value={agreementId}
                    onChange={e => setAgreementId(e.target.value)}
                  >
                    <option value="">Select an agreement</option>
                    {agreements.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.tenant?.full_name || a.tenant?.email || 'Tenant'} — ৳{Number(a.monthly_rent).toLocaleString()}/mo
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-input"
                    value={status}
                    onChange={e => setStatus(e.target.value as PaymentStatus)}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Paid Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={paidDate}
                    onChange={e => setPaidDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-input"
                    value={method}
                    onChange={e => setMethod(e.target.value as PaymentMethod)}
                  >
                    {METHODS.map(m => (
                      <option key={m} value={m}>{m.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Optional notes..."
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              {createError && <p className="form-error">{createError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreate(false)} disabled={creating}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Payment</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Delete payment of <strong>৳{Number(confirmDelete.amount).toLocaleString()}</strong> due on{' '}
                <strong>{confirmDelete.due_date}</strong>? This cannot be undone.
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