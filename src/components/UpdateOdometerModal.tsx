'use client';

import React, { useState } from 'react';

interface Motorcycle {
  id: string;
  name: string;
  currentOdo: number;
}

interface UpdateOdometerModalProps {
  activeMotor: Motorcycle;
  onClose: () => void;
  onUpdate: (newOdo: number) => Promise<boolean>;
}

export default function UpdateOdometerModal({
  activeMotor,
  onClose,
  onUpdate
}: UpdateOdometerModalProps) {
  const [newOdo, setNewOdo] = useState<string>(activeMotor.currentOdo.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedNewOdo = parseFloat(newOdo) || 0.0;
  const difference = parsedNewOdo - activeMotor.currentOdo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    const success = await onUpdate(parsedNewOdo);
    setLoading(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop open" id="modal-update-odometer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '400px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>Update Odometer</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}
            
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Odometer</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{activeMotor.currentOdo.toLocaleString('id-ID')} KM</strong>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>New Odometer (KM)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-control"
                  value={newOdo}
                  onChange={(e) => {
                    setNewOdo(e.target.value);
                    setError(null);
                  }}
                  min="0"
                  step="any"
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
                {difference !== 0 && (
                  <span style={{ position: 'absolute', right: '1rem', fontSize: '0.8rem', color: difference > 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: '600' }}>
                    {difference > 0 ? `+${difference.toLocaleString('id-ID', { maximumFractionDigits: 1 })}` : difference.toLocaleString('id-ID', { maximumFractionDigits: 1 })} KM
                  </span>
                )}
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Enter the current odometer reading from your motorcycle dashboard.</small>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
