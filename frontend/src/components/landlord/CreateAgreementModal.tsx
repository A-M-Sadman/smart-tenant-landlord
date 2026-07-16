import { useState, useEffect } from 'react';
import type { AgreementCreate } from '../../types/agreement';
import { createAgreement } from '../../api/agreement';
import { getAssignments } from '../../api/assignment';
import type { Assignment } from '../../types/assignment';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAgreementModal({ onClose, onCreated }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const [assignmentId, setAssignmentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('0');
  const [terms, setTerms] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAssignments()
      .then(data => {
        const active = data.filter(a => a.status === 'active');
        setAssignments(active);
        if (active.length > 0) setAssignmentId(active[0].id);
      })
      .finally(() => setLoadingAssignments(false));
  }, []);

  async function handleSubmit() {
    if (!assignmentId) return setError('Please select an assignment');
    if (!startDate) return setError('Please set a start date');
    if (!endDate) return setError('Please set an end date');
    if (!monthlyRent || Number(monthlyRent) <= 0) return setError('Please enter a valid monthly rent');
    if (endDate <= startDate) return setError('End date must be after start date');

    setError('');
    setSubmitting(true);
    try {
      const payload: AgreementCreate = {
        assignment_id: assignmentId,
        start_date: startDate,
        end_date: endDate,
        monthly_rent: Number(monthlyRent),
        security_deposit: Number(securityDeposit) || 0,
        terms: terms.trim() || null,
      };
      await createAgreement(payload);
      onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedAssignment = assignments.find(a => a.id === assignmentId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Rental Agreement</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Assignment selector */}
          <div className="form-group">
            <label className="form-label">Active Assignment *</label>
            {loadingAssignments ? (
              <p className="search-hint">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="form-error">No active assignments found. Assign a tenant to a unit first.</p>
            ) : (
              <select
                className="form-input"
                value={assignmentId}
                onChange={e => setAssignmentId(e.target.value)}
              >
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>
                    Unit — {a.tenant?.email || a.tenant_id} (since {a.start_date})
                  </option>
                ))}
              </select>
            )}
            {selectedAssignment?.tenant && (
              <p className="search-hint">
                Tenant: {selectedAssignment.tenant.full_name || selectedAssignment.tenant.email}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Financials */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Monthly Rent (৳) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                value={monthlyRent}
                onChange={e => setMonthlyRent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Security Deposit (৳)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                value={securityDeposit}
                onChange={e => setSecurityDeposit(e.target.value)}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="form-group">
            <label className="form-label">Terms & Conditions (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Enter any terms and conditions..."
              rows={4}
              value={terms}
              onChange={e => setTerms(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting || assignments.length === 0}
          >
            {submitting ? 'Creating...' : 'Create Agreement'}
          </button>
        </div>
      </div>
    </div>
  );
}