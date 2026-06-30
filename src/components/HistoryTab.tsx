'use client';

import React, { useState } from 'react';

interface ServiceLog {
  id: string;
  motorcycleId: string;
  date: string;
  odometer: number;
  components: string[];
  cost: number;
  notes: string;
}

interface Motorcycle {
  id: string;
  name: string;
  plate: string;
}

interface HistoryTabProps {
  activeMotor: Motorcycle | undefined;
  logs: ServiceLog[];
  onDeleteLog: (id: string) => void;
  onOpenAddServiceModal: () => void;
}

// Format Date helper
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  // Using UTC split to prevent time zone shifts
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString('id-ID', options);
  }
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format Rupiah helper
function formatRupiah(amount: number) {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function HistoryTab({
  activeMotor,
  logs,
  onDeleteLog,
  onOpenAddServiceModal
}: HistoryTabProps) {
  const [filterComponent, setFilterComponent] = useState('all');

  if (!activeMotor) {
    return (
      <section id="tab-riwayat" className="tab-content active">
        <div className="section-header">
          <h2>Riwayat Servis</h2>
          <p className="section-desc">Catatan servis dan penggantian suku cadang sebelumnya.</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <h3>Belum Ada Kendaraan Aktif</h3>
          <p>Tambahkan motor di Garasi terlebih dahulu untuk melihat riwayat servis.</p>
        </div>
      </section>
    );
  }

  // Filter logs by active motorcycle and selected component filter
  const motorLogs = logs.filter(log => log.motorcycleId === activeMotor.id);
  
  const filteredLogs = filterComponent === 'all' 
    ? motorLogs 
    : motorLogs.filter(log => log.components.includes(filterComponent));

  // Get list of all component options to populate filter dropdown based on logs available
  const componentFilterOptions = [
    "Oli Mesin", "Busi", "Oli Transmisi", "Ban Depan", "Ban Belakang",
    "Rantai", "Drive Belt", "Coolant", "Kampas Rem", "Filter Udara", "Aki"
  ];

  const handleDeleteClick = (id: string) => {
    onDeleteLog(id);
  };

  return (
    <section id="tab-riwayat" className="tab-content active">
      <div className="section-header-row">
        <div className="section-header">
          <h2>Riwayat Servis</h2>
          <p className="section-desc">Catatan servis dan penggantian suku cadang motor ({activeMotor.name}).</p>
        </div>
        <button className="btn btn-primary btn-icon" onClick={onOpenAddServiceModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Catat Servis Baru</span>
        </button>
      </div>

      {/* History Filters */}
      <div className="filters-card">
        <div className="filter-group">
          <label htmlFor="filter-component">Filter Komponen</label>
          <select 
            id="filter-component" 
            className="custom-select custom-select-sm"
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
          >
            <option value="all">Semua Komponen</option>
            {componentFilterOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Service History List */}
      <div className="history-list-container">
        {filteredLogs.length === 0 ? (
          <div className="empty-state" id="history-empty-state" style={{ display: 'flex' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3>Belum ada riwayat servis</h3>
            <p>
              {filterComponent === 'all' 
                ? 'Catat servis pertama Anda untuk mulai melacak performa komponen.'
                : `Tidak ditemukan riwayat servis untuk komponen "${filterComponent}".`
              }
            </p>
            {filterComponent === 'all' && (
              <button className="btn btn-secondary btn-sm" onClick={onOpenAddServiceModal}>Catat Sekarang</button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Odometer Servis</th>
                  <th>Komponen</th>
                  <th>Biaya (Rp)</th>
                  <th>Catatan</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-date">{formatDate(log.date)}</span>
                    </td>
                    <td>
                      <strong>{log.odometer.toLocaleString('id-ID')} KM</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {log.components.map(comp => (
                          <span key={comp} className="badge badge-outline" style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}>
                            {comp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                      {formatRupiah(log.cost)}
                    </td>
                    <td>
                      <span className="log-notes" style={{ display: 'block', maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {log.notes || '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-danger btn-icon-only btn-sm" 
                        title="Hapus Catatan"
                        style={{ padding: '0.35rem', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={() => handleDeleteClick(log.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
