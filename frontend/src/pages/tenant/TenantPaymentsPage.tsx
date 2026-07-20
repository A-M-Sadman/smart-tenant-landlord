import { useState, useEffect } from 'react';
import { getMyPayments } from '../../api/payment';

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_banking' | 'other';

interface AgreementInfo {
  id: string;
  monthly_rent: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Payment {
  id: string;
  agreement_id: string;
  tenant_id: string;
  amount: string;
  due_date: string;
  paid_date: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  agreement: AgreementInfo | null;
}

const STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: 'badge-warning',
  paid: 'badge-success',
  overdue: 'badge-danger',
  partial: 'badge-info',
};

const METHODS: PaymentMethod[] = ['cash', 'bank_transfer', 'mobile_banking', 'other'];

const BASE = 'http://localhost:8000/api/v1/payments';

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [payModal, setPayModal] = useState<Payment | null>(null);

  // Pay form state
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payDate, setPayDate] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getMyPayments()
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  function openPayModal(p: Payment) {
    setPayModal(p);
    setPayMethod('cash');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayRef('');
    setPayNotes('');
    setPayError('');
  }

  async function handlePay() {
    if (!payModal) return;
    if (!payDate) return setPayError('Please set the paid date');
    setPayError('');
    setPaying(true);
    try {
      const res = await fetch(`${BASE}/${payModal.id}/pay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          payment_method: payMethod,
          paid_date: payDate,
          transaction_reference: payRef || null,
          notes: payNotes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Payment failed');
      }
      const updated: Payment = await res.json();
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setPayModal(null);
    } catch (e: any) {
      setPayError(e.message);
    } finally {
      setPaying(false);
    }
  }

  const pending = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paid = payments.filter(p => p.status === 'paid');

  const filtered = payments.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  );

  if (loading) return <div className="page-loading">Loading payments...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rent Payments</h1>
          <p className="page-subtitle">
            {pending.length} pending · {paid.length} paid
          </p>
        </div>
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{filterStatus === 'all' ? 'No payment records yet.' : `No ${filterStatus} payments.`}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Paid Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>৳{Number(p.amount).toLocaleString()}</td>
                  <td>{p.due_date}</td>
                  <td>{p.paid_date || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {p.payment_method.replace('_', ' ')}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[p.status]}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td>{p.transaction_reference || '—'}</td>
                  <td>
                    {(p.status === 'pending' || p.status === 'overdue') && (
                      <button
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        onClick={() => openPayModal(p)}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Now Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Payment</h2>
              <button className="modal-close" onClick={() => setPayModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="maintenance-notes" style={{ marginBottom: '16px' }}>
                <span className="notes-label">Amount Due</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0' }}>
                  ৳{Number(payModal.amount).toLocaleString()}
                </p>
                <span className="notes-label" style={{ marginTop: '8px', display: 'block' }}>Due Date</span>
                <p style={{ margin: '2px 0 0' }}>{payModal.due_date}</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-input"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  >
                    {METHODS.map(m => (
                      <option key={m} value={m}>
                        {m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. bKash TrxID, bank ref..."
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Any additional info..."
                  rows={2}
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                />
              </div>

              {payError && <p className="form-error">{payError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setPayModal(null)} disabled={paying}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? 'Submitting...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}