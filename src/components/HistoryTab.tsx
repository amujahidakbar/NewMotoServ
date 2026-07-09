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
  lang: 'en' | 'id';
}

// Format Date helper
function formatDate(dateString: string, lang: 'en' | 'id') {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  // Using UTC split to prevent time zone shifts
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString(locale, options);
  }
  return new Date(dateString).toLocaleDateString(locale, options);
}

// Format Currency (IDR) helper
function formatCurrency(amount: number) {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const TRANSLATIONS = {
  en: {
    serviceHistory: "Service History",
    historyDesc: "Historical service logs and replacement records.",
    noActiveMotor: "No Active Motorcycle",
    noActiveMotorDesc: "Please select or add a motorcycle first to view service history.",
    serviceRecordsFor: "Service records and parts replacements for",
    recordService: "Record Service",
    filterComponent: "Filter Component",
    allComponents: "All Components",
    dateRange: "Date Range",
    allTime: "All Time",
    last30: "Last 30 Days",
    last90: "Last 90 Days",
    thisYear: "This Year",
    customRange: "Custom Range",
    startDate: "Start Date",
    endDate: "End Date",
    noLogsRecorded: "No service logs recorded",
    recordFirstService: "Record your first service to start tracking component lifetimes.",
    noRecordsFoundFor: 'No service records found for component',
    recordNow: "Record Now",
    thDate: "Date",
    thOdo: "Service Odometer",
    thComponents: "Components",
    thCost: "Cost (IDR)",
    thNotes: "Notes",
    thAction: "Action",
    deleteLog: "Delete Log"
  },
  id: {
    serviceHistory: "Riwayat Servis",
    historyDesc: "Catatan riwayat servis dan penggantian suku cadang.",
    noActiveMotor: "Tidak Ada Motor Aktif",
    noActiveMotorDesc: "Silakan pilih atau tambahkan sepeda motor terlebih dahulu untuk melihat riwayat servis.",
    serviceRecordsFor: "Catatan servis dan penggantian suku cadang untuk",
    recordService: "Catat Servis",
    filterComponent: "Saring Komponen",
    allComponents: "Semua Komponen",
    dateRange: "Rentang Waktu",
    allTime: "Semua Waktu",
    last30: "30 Hari Terakhir",
    last90: "90 Hari Terakhir",
    thisYear: "Tahun Ini",
    customRange: "Rentang Kustom",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Selesai",
    noLogsRecorded: "Belum ada riwayat servis",
    recordFirstService: "Catat servis pertama Anda untuk mulai memantau masa pakai suku cadang.",
    noRecordsFoundFor: 'Tidak ada catatan servis untuk komponen',
    recordNow: "Catat Sekarang",
    thDate: "Tanggal",
    thOdo: "Odometer Servis",
    thComponents: "Komponen",
    thCost: "Biaya (Rp)",
    thNotes: "Catatan",
    thAction: "Aksi",
    deleteLog: "Hapus Catatan"
  }
};

export default function HistoryTab({
  activeMotor,
  logs,
  onDeleteLog,
  onOpenAddServiceModal,
  lang
}: HistoryTabProps) {
  const [filterComponent, setFilterComponent] = useState('all');
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!activeMotor) {
    return (
      <section id="tab-riwayat" className="tab-content active">
        <div className="section-header">
          <h2>{t.serviceHistory}</h2>
          <p className="section-desc">{t.historyDesc}</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <h3>{t.noActiveMotor}</h3>
          <p>{t.noActiveMotorDesc}</p>
        </div>
      </section>
    );
  }

  // Filter logs by active motorcycle and selected component filter
  const motorLogs = logs.filter(log => log.motorcycleId === activeMotor.id);
  
  const filteredLogs = motorLogs.filter(log => {
    // 1. Filter by component
    if (filterComponent !== 'all' && !log.components.includes(filterComponent)) {
      return false;
    }
    
    // 2. Filter by date range
    const logDate = new Date(log.date);
    logDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (timeRange === '30') {
      const limit = new Date(today);
      limit.setDate(limit.getDate() - 30);
      return logDate >= limit;
    }
    
    if (timeRange === '90') {
      const limit = new Date(today);
      limit.setDate(limit.getDate() - 90);
      return logDate >= limit;
    }
    
    if (timeRange === 'year') {
      const limit = new Date(today.getFullYear(), 0, 1);
      return logDate >= limit;
    }
    
    if (timeRange === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (logDate > end) return false;
      }
    }
    
    return true;
  });

  // Get list of all component options to populate filter dropdown based on logs available
  const componentFilterOptions = lang === 'en' ? [
    "Engine Oil", "Spark Plug", "Gear Oil", "Front Tyre", "Rear Tyre",
    "Chain", "Drive Belt", "Coolant", "Brake Pads", "Air Filter", "Battery"
  ] : [
    "Oli Mesin", "Busi", "Oli Gardan", "Ban Depan", "Ban Belakang",
    "Rantai", "Drive Belt", "Air Radiator", "Kampas Rem", "Filter Udara", "Aki"
  ];

  const handleDeleteClick = (id: string) => {
    onDeleteLog(id);
  };

  return (
    <section id="tab-riwayat" className="tab-content active">
      <div className="section-header-row">
        <div className="section-header">
          <h2>{t.serviceHistory}</h2>
          <p className="section-desc">{t.serviceRecordsFor} ({activeMotor.name}).</p>
        </div>
        <button className="btn btn-primary btn-icon" onClick={onOpenAddServiceModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>{t.recordService}</span>
        </button>
      </div>

      {/* History Filters */}
      <div className="filters-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="filter-group" style={{ flex: '1 1 200px' }}>
            <label htmlFor="filter-component">{t.filterComponent}</label>
            <select 
              id="filter-component" 
              className="custom-select custom-select-sm"
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">{t.allComponents}</option>
              {componentFilterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ flex: '1 1 200px' }}>
            <label htmlFor="filter-timerange">{t.dateRange}</label>
            <select 
              id="filter-timerange" 
              className="custom-select custom-select-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="all">{t.allTime}</option>
              <option value="30">{t.last30}</option>
              <option value="90">{t.last90}</option>
              <option value="year">{t.thisYear}</option>
              <option value="custom">{t.customRange}</option>
            </select>
          </div>
        </div>

        {timeRange === 'custom' && (
          <div className="filter-date-inputs" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="filter-group" style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.startDate}</label>
              <input 
                type="date" 
                className="form-control" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div className="filter-group" style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.endDate}</label>
              <input 
                type="date" 
                className="form-control" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>
        )}
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
            <h3>{t.noLogsRecorded}</h3>
            <p>
              {filterComponent === 'all' 
                ? t.recordFirstService
                : `${t.noRecordsFoundFor} "${filterComponent}".`
              }
            </p>
            {filterComponent === 'all' && (
              <button className="btn btn-secondary btn-sm" onClick={onOpenAddServiceModal}>{t.recordNow}</button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>{t.thDate}</th>
                  <th>{t.thOdo}</th>
                  <th>{t.thComponents}</th>
                  <th>{t.thCost}</th>
                  <th>{t.thNotes}</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>{t.thAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-date">{formatDate(log.date, lang)}</span>
                    </td>
                    <td>
                      <strong>{log.odometer.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} KM</strong>
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
                      {formatCurrency(log.cost)}
                    </td>
                    <td>
                      <span className="log-notes" style={{ display: 'block', maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {log.notes || '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-danger btn-icon-only btn-sm" 
                        title={t.deleteLog}
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
