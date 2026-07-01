import { useState, useEffect, useRef } from 'react';
import type { TenantSearchResult } from '../../types/assignment';
import { searchTenants, createAssignment } from '../../api/assignment';

interface Props {
  unitId: string;
  unitNumber: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignTenantModal({ unitId, unitNumber, onClose, onAssigned }: Props) {
  const [emailQuery, setEmailQuery] = useState('');
  const [results, setResults] = useState<TenantSearchResult[]>([]);
  const [selected, setSelected] = useState<TenantSearchResult | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (emailQuery.length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchTenants(emailQuery);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [emailQuery]);

  async function handleSubmit() {
    if (!selected) return setError('Please select a tenant');
    if (!startDate) return setError('Please set a start date');
    setError('');
    setSubmitting(true);
    try {
      await createAssignment({
        unit_id: unitId,
        tenant_id: selected.id,
        start_date: startDate,
        end_date: endDate || null,
      });
      onAssigned();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Tenant to Unit {unitNumber}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Tenant Search */}
          <div className="form-group">
            <label className="form-label">Search Tenant by Email</label>
            {selected ? (
              <div className="selected-tenant">
                <div className="selected-tenant-info">
                  <span className="tenant-name">{selected.full_name || 'No name'}</span>
                  <span className="tenant-email">{selected.email}</span>
                </div>
                <button
                  className="btn-ghost-small"
                  onClick={() => { setSelected(null); setEmailQuery(''); }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type email to search..."
                  value={emailQuery}
                  onChange={e => setEmailQuery(e.target.value)}
                />
                {searching && <p className="search-hint">Searching...</p>}
                {!searching && results.length > 0 && (
                  <div className="search-results">
                    {results.map(t => (
                      <div
                        key={t.id}
                        className="search-result-item"
                        onClick={() => { setSelected(t); setResults([]); setEmailQuery(''); }}
                      >
                        <span className="tenant-name">{t.full_name || 'No name'}</span>
                        <span className="tenant-email">{t.email}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!searching && emailQuery.length >= 2 && results.length === 0 && (
                  <p className="search-hint">No tenants found</p>
                )}
              </>
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
              <label className="form-label">End Date (optional)</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
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
            disabled={submitting || !selected || !startDate}
          >
            {submitting ? 'Assigning...' : 'Assign Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
}