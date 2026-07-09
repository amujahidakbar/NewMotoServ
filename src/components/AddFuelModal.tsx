'use client';

import React, { useState } from 'react';

interface FuelLog {
  id: string;
  motorcycleId: string;
  date: string;
  odometer: number;
  liters: number;
  price: number;
}

interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  currentOdo: number;
}

interface AddFuelModalProps {
  activeMotor: Motorcycle;
  editingLog?: FuelLog | null;
  onClose: () => void;
  onAdd: (data: {
    date: string;
    odometer: number;
    liters: number;
    price: number;
  }) => Promise<boolean>;
}

export default function AddFuelModal({
  activeMotor,
  editingLog,
  onClose,
  onAdd
}: AddFuelModalProps) {
  const [date, setDate] = useState(() => {
    if (editingLog) return editingLog.date;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [odometer, setOdometer] = useState<string>(() => 
    editingLog ? editingLog.odometer.toString() : activeMotor.currentOdo.toString()
  );
  const [liters, setLiters] = useState(() => 
    editingLog ? editingLog.liters.toString() : ''
  );
  const [price, setPrice] = useState(() => 
    editingLog ? editingLog.price.toString() : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedOdo = parseFloat(odometer.toString());
    const parsedLiters = parseFloat(liters);
    const parsedPrice = parseInt(price);

    if (isNaN(parsedOdo) || parsedOdo < 0) {
      setError('Invalid Odometer!');
      return;
    }

    if (isNaN(parsedLiters) || parsedLiters <= 0) {
      setError('Fuel volume must be greater than 0 Liters!');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Total cost must be greater than IDR 0!');
      return;
    }

    setLoading(true);
    try {
      const success = await onAdd({
        date,
        odometer: parsedOdo,
        liters: parsedLiters,
        price: parsedPrice
      });

      if (success) {
        onClose();
      } else {
        setError('Failed to save fuel log to database.');
      }
    } catch (err: any) {
      setError(err.message || 'System error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 110 }}>
      <div className="modal-dialog" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'modalFadeIn 0.3s ease-out' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {editingLog ? 'Edit Fuel Log' : 'Record Fuel Fill-up'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Motorcycle</label>
              <input
                type="text"
                className="form-control"
                value={`${activeMotor.name} (${activeMotor.brand})`}
                disabled
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Fill-up Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Odometer (KM)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`e.g. ${activeMotor.currentOdo}`}
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  required
                  min="0"
                  step="any"
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Volume (Liters)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 4.25"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  required
                  min="0.01"
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Cost (IDR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 42000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="1"
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>
            
            {liters && price && !isNaN(parseFloat(liters)) && !isNaN(parseInt(price)) && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                Estimated Price: <strong>IDR {Math.round(parseInt(price) / parseFloat(liters)).toLocaleString('id-ID')} / Liter</strong>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={loading}
              style={{ padding: '0.5rem 1rem', fontWeight: 600 }}
            >
              {loading ? 'Saving...' : (editingLog ? 'Save Changes' : 'Save Log')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
