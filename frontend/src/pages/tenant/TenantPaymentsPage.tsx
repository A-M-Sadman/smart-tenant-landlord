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

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    getMyPayments()
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}