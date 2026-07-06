'use client';

import React, { useState } from 'react';

interface Motorcycle {
  id: string;
  name: string;
  currentOdo: number;
  intervals: Record<string, number>;
}

interface AddCustomComponentModalProps {
  activeMotor: Motorcycle;
  onClose: () => void;
  onAdd: (componentName: string, intervalKm: number, lastServiceKm: number) => Promise<boolean>;
}

export default function AddCustomComponentModal({
  activeMotor,
  onClose,
  onAdd
}: AddCustomComponentModalProps) {
  const [componentName, setComponentName] = useState('');
  const [intervalKm, setIntervalKm] = useState('2000');
  const [lastServiceKm, setLastServiceKm] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = componentName.trim();
    if (!name) {
      setError('Nama komponen tidak boleh kosong!');
      return;
    }

    const parsedInterval = parseInt(intervalKm);
    const parsedLastService = parseFloat(lastServiceKm);

    if (isNaN(parsedInterval) || parsedInterval <= 100) {
      setError('Interval servis minimal harus lebih besar dari 100 KM!');
      return;
    }

    if (isNaN(parsedLastService) || parsedLastService < 0) {
      setError('Odometer servis terakhir tidak valid!');
      return;
    }

    if (Object.keys(activeMotor.intervals || {}).some(comp => comp.trim().toLowerCase() === name.toLowerCase())) {
      setError('Komponen dengan nama ini sudah terdaftar pada motor Anda!');
      return;
    }

    setLoading(true);
    const success = await onAdd(name, parsedInterval, parsedLastService);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop open" id="modal-add-custom-component" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '400px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tambah Komponen Baru</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}
            
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Menambahkan komponen pelacakan kustom untuk motor: <strong>{activeMotor.name}</strong>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nama Komponen</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Kampas Kopling, Filter Oli"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                required
                autoFocus
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Interval Servis (KM)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Contoh: 3000"
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value)}
                min="101"
                required
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Frekuensi penggantian komponen (misal: ganti setiap 3.000 KM).</small>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Odometer Servis Terakhir (KM)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Contoh: 1500"
                value={lastServiceKm}
                onChange={(e) => setLastServiceKm(e.target.value)}
                min="0"
                step="any"
                required
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Kilometer odometer saat komponen ini diganti terakhir kali. Jika nilainya melebihi odometer motor saat ini, odometer motor akan otomatis disesuaikan.</small>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Komponen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
