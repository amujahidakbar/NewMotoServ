'use client';

import React from 'react';
import { calculateMotorHealth } from '@/lib/calculations';

interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  plate: string;
  type: string;
  currentOdo: number;
  intervals: Record<string, number>;
  lastService: Record<string, number>;
}

interface GarageTabProps {
  motorcycles: Motorcycle[];
  activeMotorcycleId: string;
  onSelectMotorcycle: (id: string) => void;
  onDeleteMotorcycle: (id: string) => void;
  onOpenAddMotorModal: () => void;
}

export default function GarageTab({
  motorcycles,
  activeMotorcycleId,
  onSelectMotorcycle,
  onDeleteMotorcycle,
  onOpenAddMotorModal
}: GarageTabProps) {

  const handleDeleteClick = (id: string, name: string) => {
    onDeleteMotorcycle(id);
  };

  return (
    <section id="tab-garasi" className="tab-content active">
      <div className="section-header-row">
        <div className="section-header">
          <h2>Garasi Motor</h2>
          <p className="section-desc">Kelola kendaraan Anda dan tambahkan motor baru.</p>
        </div>
        <button className="btn btn-primary btn-icon" onClick={onOpenAddMotorModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Tambah Motor</span>
        </button>
      </div>

      {motorcycles.length === 0 ? (
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(6, 182, 212, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="18" r="3"/>
              <path d="M6 18h4l2-5h6l3 5"/>
              <path d="M12 13l-1-5H7l-2 3M17 10h-5"/>
            </svg>
          </div>
          <h3>Garasi Anda Kosong</h3>
          <p style={{ maxWidth: '400px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Belum ada sepeda motor yang didaftarkan. Tambahkan motor pertama Anda untuk mulai memantau perawatan suku cadang.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onOpenAddMotorModal}>
            Tambah Motor Sekarang
          </button>
        </div>
      ) : (
        <div className="motorcycles-grid" id="motorcycles-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {motorcycles.map((motor) => {
            const isActive = motor.id === activeMotorcycleId;
            const health = calculateMotorHealth(motor.currentOdo, motor.intervals, motor.lastService);
            
            let healthColor = 'var(--color-success)';
            if (health.criticalCount > 0) {
              healthColor = 'var(--color-danger)';
            } else if (health.warningCount > 0) {
              healthColor = 'var(--color-warning)';
            }

            return (
              <div 
                key={motor.id} 
                className={`motorcycle-card ${isActive ? 'active' : ''}`}
              >
                {isActive && <span className="active-ribbon">Aktif</span>}
                
                <div className="motor-card-header">
                  <div className="motor-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2M21 17a2 2 0 11-4 0M7 17a2 2 0 11-4 0"/>
                      <path d="M13 6h-3M16 10H5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="motor-card-title">{motor.name}</h3>
                    <span className="badge">{motor.type}</span>
                  </div>
                </div>

                <div className="motor-card-info-grid">
                  <div className="info-box">
                    <span className="info-label">Odometer</span>
                    <span className="info-val">{motor.currentOdo.toLocaleString('id-ID')} KM</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">No. Polisi</span>
                    <span className="info-val">{motor.plate || '-'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Kesehatan</span>
                    <span className="info-val" style={{ color: healthColor }}>
                      {health.overallPercentage}%
                    </span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Merk</span>
                    <span className="info-val">{motor.brand || '-'}</span>
                  </div>
                </div>

                <div className="motor-card-actions">
                  {!isActive ? (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm btn-activate-motor"
                      onClick={() => onSelectMotorcycle(motor.id)}
                    >
                      Aktifkan
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-sm"
                      disabled
                      style={{ 
                        backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                        borderColor: 'rgba(16, 185, 129, 0.1)', 
                        color: 'var(--color-success)',
                        cursor: 'default',
                        pointerEvents: 'none',
                        flex: 1
                      }}
                    >
                      Sedang Digunakan
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm btn-delete-motor"
                    onClick={() => handleDeleteClick(motor.id, motor.name)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
