'use client';

import React from 'react';
import { calculateMotorHealth, ComponentHealth } from '@/lib/calculations';

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

interface DashboardTabProps {
  activeMotor: Motorcycle | undefined;
  onOpenAddMotorModal: () => void;
  onOpenAddServiceModal: (preselectedComponent?: string) => void;
}

// Helper to render component icons
export function getComponentIcon(name: string) {
  const cleanName = name.toLowerCase();
  
  if (cleanName.includes('oli mesin')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    );
  }
  if (cleanName.includes('oli transmisi') || cleanName.includes('gardan')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/>
        <circle cx="12" cy="15" r="2"/>
      </svg>
    );
  }
  if (cleanName.includes('busi')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    );
  }
  if (cleanName.includes('filter') || cleanName.includes('saringan')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
        <path d="M12 3v18M3 12h18"/>
      </svg>
    );
  }
  if (cleanName.includes('belt') || cleanName.includes('v-belt')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="9" ry="5"/>
        <ellipse cx="12" cy="12" rx="5" ry="2.5"/>
      </svg>
    );
  }
  if (cleanName.includes('rantai') || cleanName.includes('gir')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="10" width="4" height="4" rx="1"/>
        <rect x="10" y="10" width="4" height="4" rx="1"/>
        <rect x="17" y="10" width="4" height="4" rx="1"/>
        <path d="M7 12h3M14 12h3"/>
      </svg>
    );
  }
  if (cleanName.includes('rem') || cleanName.includes('pad')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10a8 8 0 0 1 16 0M4 14a8 8 0 0 0 16 0"/><line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    );
  }
  if (cleanName.includes('ban depan')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7"/>
      </svg>
    );
  }
  if (cleanName.includes('ban belakang') || cleanName.includes('ban')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7"/>
      </svg>
    );
  }
  if (cleanName.includes('coolant') || cleanName.includes('air radiator') || cleanName.includes('radiator')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
      </svg>
    );
  }
  if (cleanName.includes('aki') || cleanName.includes('baterai') || cleanName.includes('accu')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="12" rx="2" ry="2"/><line x1="6" y1="3" x2="6" y2="7"/><line x1="18" y1="3" x2="18" y2="7"/><line x1="8" y1="13" x2="12" y2="13"/><line x1="10" y1="11" x2="10" y2="15"/><line x1="14" y1="13" x2="16" y2="13"/>
      </svg>
    );
  }
  // Fallback for custom components
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export default function DashboardTab({
  activeMotor,
  onOpenAddMotorModal,
  onOpenAddServiceModal
}: DashboardTabProps) {
  // 1. Render empty state if no active motor
  if (!activeMotor) {
    return (
      <section id="tab-dashboard" className="tab-content active">
        <div className="section-header">
          <div>
            <h2>Dashboard Pemantauan</h2>
            <p className="section-desc">Status kesehatan suku cadang sepeda motor Anda saat ini.</p>
          </div>
        </div>

        <div 
          className="dashboard-empty-state" 
          id="dashboard-empty-state" 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            gap: '1.5rem',
            marginTop: '1rem',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(6, 182, 212, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="18" r="3"/>
              <path d="M6 18h4l2-5h6l3 5"/>
              <path d="M12 13l-1-5H7l-2 3M17 10h-5"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Belum Ada Kendaraan di Garasi</h3>
            <p className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
              Tambahkan sepeda motor pertama Anda untuk mulai mencatat odometer dan memantau status kesehatan suku cadangnya secara otomatis.
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-primary btn-icon" 
            style={{ padding: '0.75rem 1.5rem' }}
            onClick={onOpenAddMotorModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Tambah Motor Pertama</span>
          </button>
        </div>
      </section>
    );
  }

  // 2. Calculate health metrics
  const healthMetrics = calculateMotorHealth(
    activeMotor.currentOdo,
    activeMotor.intervals,
    activeMotor.lastService
  );

  const { overallPercentage, criticalCount, warningCount, componentsHealth } = healthMetrics;

  // Determine overall status indicators
  let strokeColor = 'var(--color-success)';
  let overallStatusDotClass = 'status-dot green';
  let overallStatusText = 'Semua Komponen Baik';
  let overallSummaryText = 'Perjalanan Anda aman. Belum ada komponen yang membutuhkan perhatian segera.';

  if (criticalCount > 0) {
    strokeColor = 'var(--color-danger)';
    overallStatusDotClass = 'status-dot red';
    overallStatusText = `${criticalCount} Komponen Kritis!`;
    overallSummaryText = 'Segera lakukan penggantian suku cadang yang kritis untuk keamanan berkendara.';
  } else if (warningCount > 0) {
    strokeColor = 'var(--color-warning)';
    overallStatusDotClass = 'status-dot yellow';
    overallStatusText = `${warningCount} Komponen Perlu Perhatian`;
    overallSummaryText = 'Beberapa suku cadang mendekati batas interval. Agendakan servis dalam waktu dekat.';
  }

  return (
    <section id="tab-dashboard" className="tab-content active">
      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <div className="alert-banner" id="global-alert-banner" style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <div className="alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="alert-message">
            {criticalCount} komponen motor Anda telah melebihi batas kilometer servis! Wajib ganti segera.
          </div>
        </div>
      )}

      <div className="section-header">
        <div>
          <h2>Dashboard Pemantauan</h2>
          <p className="section-desc">Status kesehatan suku cadang sepeda motor Anda saat ini.</p>
        </div>
      </div>

      {/* Motor Info Overview Card */}
      <div className="overview-card" id="motorcycle-overview-card" style={{ display: 'flex' }}>
        <div className="overview-visual">
          <div className="status-gauge">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path 
                className="circle" 
                id="overall-status-circle" 
                strokeDasharray={`${overallPercentage}, 100`} 
                style={{ stroke: strokeColor }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="gauge-content">
              <span className="gauge-value" id="overall-health-pct">{overallPercentage}%</span>
              <span className="gauge-label">Kesehatan</span>
            </div>
          </div>
        </div>
        <div className="overview-details">
          <h3 className="motor-name-display" id="info-motor-name">{activeMotor.name}</h3>
          <div className="motor-meta">
            <span className="badge" id="info-motor-type">{activeMotor.type}</span>
            {activeMotor.plate && <span className="plate-number" id="info-motor-plate">{activeMotor.plate}</span>}
          </div>
          <div className="status-indicator-box">
            <span className={overallStatusDotClass} id="info-status-dot"></span>
            <span className="status-text" id="info-status-text">{overallStatusText}</span>
          </div>
          <p className="summary-text" id="info-status-summary">
            {overallSummaryText}
          </p>
        </div>
      </div>

      {/* Parts Status Grid */}
      <div className="parts-grid-header" style={{ display: 'block' }}>
        <h3>Status Komponen & Suku Cadang</h3>
      </div>
      <div className="parts-grid" id="parts-status-grid" style={{ display: 'grid' }}>
        {componentsHealth.map((comp) => {
          let cardStatusClass = '';
          let badgeText = 'Baik';

          if (comp.status === 'danger') {
            cardStatusClass = 'status-danger';
            badgeText = 'Wajib Servis';
          } else if (comp.status === 'warning') {
            cardStatusClass = 'status-warning';
            badgeText = 'Perlu Servis';
          }

          const cardClass = `part-card ${cardStatusClass}`;

          const remainingValText = comp.remaining <= 0 
            ? `Terlewat ${Math.abs(comp.remaining).toLocaleString('id-ID')} KM`
            : `Sisa ${comp.remaining.toLocaleString('id-ID')} KM`;

          return (
            <div key={comp.name} className={cardClass}>
              <div className="part-header">
                <div className="part-name-wrapper">
                  <div className="part-icon">
                    {getComponentIcon(comp.name)}
                  </div>
                  <div className="part-title">{comp.name}</div>
                </div>
                <span className="part-badge">{badgeText}</span>
              </div>
              
              <div className="part-progress-container">
                <div className="part-progress-bar-bg">
                  <div className="part-progress-bar-fill" style={{ width: `${comp.percentage}%` }}></div>
                </div>
                <div className="part-progress-labels">
                  <span>{comp.percentage}% Sisa Umur</span>
                  <span>Batas: {comp.interval.toLocaleString('id-ID')} KM</span>
                </div>
              </div>

              <div className="part-stats">
                <div className="stat-box">
                  <span className="stat-label">Servis Terakhir</span>
                  <span className="stat-value">{comp.lastServiceOdo.toLocaleString('id-ID')} KM</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Jarak Tempuh Part</span>
                  <span className="stat-value">{comp.run.toLocaleString('id-ID')} KM</span>
                </div>
              </div>

              <div className="part-footer">
                <div className="remaining-info">
                  <span className="remaining-label">Estimasi Jarak</span>
                  <span className="remaining-value">{remainingValText}</span>
                </div>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm btn-quick-record-service"
                  onClick={() => onOpenAddServiceModal(comp.name)}
                  style={{ minWidth: '80px', justifyContent: 'center' }}
                >
                  Servis
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
