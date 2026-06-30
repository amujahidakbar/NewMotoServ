'use client';

import React, { useState, useEffect } from 'react';

interface Motorcycle {
  id: string;
  name: string;
  type: string;
  intervals: Record<string, number>;
}

interface SettingsTabProps {
  activeMotor: Motorcycle | undefined;
  user: { name: string; email: string } | null;
  onUpdateIntervals: (intervals: Record<string, number>) => Promise<boolean>;
  onResetIntervals: () => Promise<boolean>;
  onFactoryResetData: () => Promise<boolean>;
  onOpenAuthModal: () => void;
  showAlert: (title: string, message: string, onOk?: () => void) => void;
  showConfirm: (
    title: string, 
    message: string, 
    onOk: () => void, 
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDanger?: boolean }
  ) => void;
}

export default function SettingsTab({
  activeMotor,
  user,
  onUpdateIntervals,
  onResetIntervals,
  onFactoryResetData,
  onOpenAuthModal,
  showAlert,
  showConfirm
}: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Sync state values when activeMotor changes
  useEffect(() => {
    if (activeMotor) {
      setFormValues({ ...activeMotor.intervals });
    }
  }, [activeMotor]);

  if (!activeMotor) {
    return (
      <section id="tab-pengaturan" className="tab-content active">
        <div className="section-header">
          <h2>Pengaturan Batas Servis</h2>
          <p className="section-desc">Atur interval kilometer ideal untuk penggantian komponen motor Anda.</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <h3>Belum Ada Kendaraan Aktif</h3>
          <p>Pilih atau tambahkan sepeda motor terlebih dahulu untuk mengonfigurasi batas servis.</p>
        </div>
      </section>
    );
  }

  const handleInputChange = (comp: string, value: string) => {
    const val = parseInt(value) || 0;
    setFormValues(prev => ({
      ...prev,
      [comp]: val
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const invalidComps = Object.entries(formValues).filter(([_, val]) => val <= 100);
    if (invalidComps.length > 0) {
      showAlert('Input Tidak Valid', 'Interval servis minimal harus lebih besar dari 100 KM!');
      return;
    }

    setLoading(true);
    const success = await onUpdateIntervals(formValues);
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleResetClick = async () => {
    showConfirm(
      'Reset Interval Ke Default',
      'Apakah Anda yakin ingin mengembalikan seluruh interval komponen motor ini ke standar default rekomendasi pabrikan?',
      async () => {
        setLoading(true);
        const success = await onResetIntervals();
        if (success) {
          setIsEditing(false);
        }
        setLoading(false);
      }
    );
  };

  const handleFactoryResetClick = async () => {
    showConfirm(
      'Reset Semua Data',
      'PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data motor, catatan servis, dan interval kustom pada akun Anda? Tindakan ini tidak dapat dibatalkan.',
      () => {
        showConfirm(
          'Konfirmasi Akhir',
          'KONFIRMASI KEDUA: Apakah Anda benar-benar yakin? Semua data akan hilang selamanya.',
          async () => {
            setLoading(true);
            await onFactoryResetData();
            setLoading(false);
          },
          undefined,
          { isDanger: true }
        );
      },
      undefined,
      { isDanger: true }
    );
  };

  const components = Object.keys(activeMotor.intervals);

  return (
    <section id="tab-pengaturan" className="tab-content active">
      <div className="section-header">
        <h2>Pengaturan Batas Servis</h2>
        <p className="section-desc">Atur interval kilometer ideal untuk penggantian komponen motor Anda.</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3>Sesuaikan Interval Jarak Tempuh (KM)</h3>
          <span className="active-motor-tag" id="settings-motor-tag">Motor Aktif: {activeMotor.name} ({activeMotor.type})</span>
        </div>

        {!isEditing ? (
          <div id="settings-view-container">
            <div className="form-grid" id="settings-intervals-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {components.map(comp => (
                <div key={comp} className="form-group" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>{comp}</label>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {(activeMotor.intervals[comp] || 0).toLocaleString('id-ID')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>KM</span>
                  </strong>
                </div>
              ))}
            </div>
            <div className="settings-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-icon" 
                onClick={() => {
                  setFormValues({ ...activeMotor.intervals });
                  setIsEditing(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Ubah Interval</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} id="settings-intervals-form" className="settings-form" style={{ display: 'block' }}>
            <div className="form-grid" id="settings-intervals-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {components.map(comp => (
                <div key={comp} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{comp}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={formValues[comp] !== undefined ? formValues[comp] : ''}
                      onChange={(e) => handleInputChange(comp, e.target.value)}
                      min="100"
                      required
                      style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                    />
                    <span style={{ position: 'absolute', right: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, pointerEvents: 'none' }}>KM</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="settings-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleResetClick}
                disabled={loading}
              >
                Reset ke Default Pabrikan
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
                style={{ marginLeft: 'auto' }}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cloud Backup Settings */}
      <div className="settings-card" style={{ marginTop: '1.5rem' }}>
        <div className="settings-card-header">
          <h3>Pencadangan Cloud (Database MySQL)</h3>
          <span 
            className={`sync-badge ${user ? 'status-connected' : 'status-disconnected'}`}
            style={{ 
              fontSize: '0.7rem', 
              padding: '0.2rem 0.45rem', 
              borderRadius: 'var(--radius-sm)', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}
          >
            {user ? 'Aktif' : 'Non-aktif'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {user ? (
            <>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                Akun Anda terhubung dengan email: <strong>{user.email}</strong>. Data motor dan riwayat servis Anda otomatis tersinkronisasi dan dicadangkan ke database MySQL server.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  disabled
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                >
                  Pencadangan Otomatis Aktif
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                Anda saat ini menggunakan <strong>Sesi Lokal (Guest)</strong>. Data hanya disimpan di browser Anda saat ini. Masuk atau daftarkan akun untuk mengaktifkan pencadangan otomatis ke cloud MySQL.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={onOpenAuthModal}
                style={{ alignSelf: 'flex-start' }}
              >
                Login / Register Akun Backup
              </button>
            </>
          )}
        </div>
      </div>

      <div className="danger-zone-card" style={{ marginTop: '1.5rem' }}>
        <h3>Zona Bahaya</h3>
        <p>Mereset semua data aplikasi akan menghapus seluruh motor, riwayat servis, dan pengaturan yang tersimpan.</p>
        <button 
          className="btn btn-danger" 
          id="btn-factory-reset"
          disabled={loading}
          onClick={handleFactoryResetClick}
        >
          Hapus Semua Data Aplikasi
        </button>
      </div>
    </section>
  );
}
