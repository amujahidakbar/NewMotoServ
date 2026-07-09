'use client';

import React, { useState, useEffect } from 'react';
import { getComponentsForType } from '@/lib/constants';

interface Motorcycle {
  id: string;
  name: string;
  currentOdo: number;
  type: string;
  intervals: Record<string, number>;
}

interface AddServiceModalProps {
  activeMotor: Motorcycle;
  preselectedComponent?: string;
  onClose: () => void;
  onAddLog: (log: {
    date: string;
    odometer: number;
    components: string[];
    cost: number;
    notes: string;
  }) => Promise<boolean>;
}

export default function AddServiceModal({
  activeMotor,
  preselectedComponent,
  onClose,
  onAddLog
}: AddServiceModalProps) {
  const [date, setDate] = useState('');
  const [odometer, setOdometer] = useState(activeMotor.currentOdo.toString());
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dates and pre-selections
  useEffect(() => {
    // Set to local YYYY-MM-DD
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    setDate(localDate.toISOString().split('T')[0]);

    if (preselectedComponent) {
      setSelectedComponents([preselectedComponent]);
    }
  }, [preselectedComponent]);

  const handleCheckboxChange = (comp: string) => {
    setSelectedComponents(prev => 
      prev.includes(comp) 
        ? prev.filter(c => c !== comp) 
        : [...prev, comp]
    );
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedOdo = parseFloat(odometer);

    if (isNaN(parsedOdo) || parsedOdo < 0) {
      setError('Odometer must be a positive number!');
      return;
    }

    if (selectedComponents.length === 0) {
      setError('Select at least one component to service!');
      return;
    }

    setLoading(true);
    const success = await onAddLog({
      date,
      odometer: parsedOdo,
      components: selectedComponents,
      cost: parseInt(cost) || 0,
      notes
    });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  const defaultComponents = getComponentsForType(activeMotor.type || 'kopling') as string[];
  const customComponents = Object.keys(activeMotor.intervals || {}).filter(
    comp => !defaultComponents.includes(comp)
  );
  const availableComponents = [...defaultComponents, ...customComponents];

  return (
    <div className="modal-backdrop open" id="modal-add-service-log" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '500px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>Record Part Service</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Service Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Service Odometer (KM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  min="0"
                  step="any"
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>

            {/* Checkboxes grid for components */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Replaced Parts / Components</label>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '0.5rem', 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--border-color)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.05)'
                }}
              >
                {availableComponents.map(comp => (
                  <label 
                    key={comp} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.2rem 0'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(comp)}
                      onChange={() => handleCheckboxChange(comp)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <span>{comp}</span>
                  </label>
                ))}
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>You can select multiple components if they were serviced at the same time.</small>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Cost (IDR - Optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 150000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Notes & Details (Optional)</label>
              <textarea
                className="form-control"
                placeholder="e.g. Changed engine oil with fully synthetic oil and replaced air filter."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Record Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
