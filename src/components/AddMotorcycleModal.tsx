'use client';

import React, { useState } from 'react';

interface AddMotorcycleModalProps {
  onClose: () => void;
  onAdd: (motor: {
    name: string;
    brand: string;
    plate: string;
    type: string;
    currentOdo: number;
  }) => Promise<boolean>;
}

export default function AddMotorcycleModal({
  onClose,
  onAdd
}: AddMotorcycleModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('Matic');
  const [currentOdo, setCurrentOdo] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !type) {
      setError('Nama motor dan tipe motor wajib diisi!');
      return;
    }

    setLoading(true);
    const success = await onAdd({
      name,
      brand,
      plate,
      type,
      currentOdo: parseFloat(currentOdo) || 0.0
    });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop open" id="modal-add-motorcycle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '450px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tambah Motor Baru</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nama Motor</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Yamaha NMAX 155"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Merk / Pabrikan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Yamaha"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Plat Nomor</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: B 1234 ABC"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tipe Transmisi</label>
                <select
                  className="custom-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="Matic">Matic (Skuter)</option>
                  <option value="Manual">Manual (Bebek)</option>
                  <option value="Kopling">Kopling (Sport)</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Odometer Awal (KM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentOdo}
                  onChange={(e) => setCurrentOdo(e.target.value)}
                  min="0"
                  step="any"
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Tambah Motor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
