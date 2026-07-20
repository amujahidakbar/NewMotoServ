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

interface FuelTabProps {
  activeMotor: Motorcycle | undefined;
  fuelLogs: FuelLog[];
  onOpenAddFuelModal: () => void;
  onOpenEditFuelModal: (log: FuelLog) => void;
  onDeleteFuelLog: (id: string) => Promise<boolean>;
  showConfirm: (
    title: string,
    message: string,
    onOk: () => void,
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDanger?: boolean }
  ) => void;
  lang: 'en' | 'id';
}

// Format Date helper to prevent time zone shifts
function formatDate(dateString: string, lang: 'en' | 'id') {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString(locale, options);
  }
  return new Date(dateString).toLocaleDateString(locale, options);
}

function formatCurrency(amount: number, lang: 'en' | 'id') {
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const TRANSLATIONS = {
  en: {
    fuelTracker: "Fuel Efficiency Tracker",
    fuelDesc: "Monitor fuel economy and gas expense records for your vehicles.",
    noActiveMotor: "No Active Motorcycle",
    noActiveMotorDesc: "Please select or add a motorcycle first to manage fuel logs.",
    recordFuel: "Record Fuel",
    averageConsumption: "Average Consumption",
    requiresTwoLogs: "Requires at least 2 logs",
    costPerKm: "Cost Per Kilometer",
    trackedDistance: "Tracked distance",
    totalFuelExpenses: "Total Fuel Expenses",
    totalVolume: "Total volume",
    fillups: "fill-ups",
    dailyFuelConsumption: "Daily Fuel Consumption",
    days: "days",
    noData: "No data available",
    fuelLogHistory: "Fuel Log History",
    dateFilter: "Date Filter:",
    allTime: "All Time",
    last30: "Last 30 Days",
    last90: "Last 90 Days",
    thisYear: "This Year",
    customRange: "Custom Range",
    startDate: "Start Date",
    endDate: "End Date",
    noLogsRecorded: "No fuel logs recorded yet. Click \"Record Fuel\" above to log your first fill-up.",
    noLogsInRange: "No fuel logs found for the selected date range.",
    thDate: "Date",
    thOdo: "Odometer",
    thVolume: "Volume",
    thCost: "Total Cost",
    thPriceL: "Price/Liter",
    thConsumption: "Consumption per KM",
    thAction: "Action",
    initialOdo: "Initial / Odo correction",
    editLog: "Edit Log",
    deleteLog: "Delete Log",
    confirmDeleteTitle: "Delete Fuel Log",
    confirmDeleteMsg: "Are you sure you want to delete the fuel log from {date} at odometer {odo} KM?",
    deleteBtn: "Delete",
    cancelBtn: "Cancel"
  },
  id: {
    fuelTracker: "Pelacak Efisiensi BBM",
    fuelDesc: "Pantau konsumsi bahan bakar dan catatan pengeluaran bensin kendaraan Anda.",
    noActiveMotor: "Tidak Ada Motor Aktif",
    noActiveMotorDesc: "Silakan pilih atau tambahkan sepeda motor terlebih dahulu untuk mencatat BBM.",
    recordFuel: "Catat BBM",
    averageConsumption: "Rata-rata Konsumsi",
    requiresTwoLogs: "Membutuhkan minimal 2 log",
    costPerKm: "Biaya per Kilometer",
    trackedDistance: "Jarak terpantau",
    totalFuelExpenses: "Total Pengeluaran BBM",
    totalVolume: "Volume total",
    fillups: "pengisian",
    dailyFuelConsumption: "Konsumsi BBM Harian",
    days: "hari",
    noData: "Belum ada data",
    fuelLogHistory: "Riwayat Pengisian BBM",
    dateFilter: "Filter Waktu:",
    allTime: "Semua Waktu",
    last30: "30 Hari Terakhir",
    last90: "90 Hari Terakhir",
    thisYear: "Tahun Ini",
    customRange: "Rentang Kustom",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Selesai",
    noLogsRecorded: "Belum ada riwayat pengisian BBM. Klik \"Catat BBM\" di atas untuk pengisian pertama.",
    noLogsInRange: "Tidak ada riwayat pengisian BBM dalam rentang waktu yang dipilih.",
    thDate: "Tanggal",
    thOdo: "Odometer",
    thVolume: "Volume",
    thCost: "Total Biaya",
    thPriceL: "Harga/Liter",
    thConsumption: "Konsumsi per KM",
    thAction: "Aksi",
    initialOdo: "Awal / Koreksi Odometer",
    editLog: "Ubah Catatan",
    deleteLog: "Hapus Catatan",
    confirmDeleteTitle: "Hapus Catatan BBM",
    confirmDeleteMsg: "Apakah Anda yakin ingin menghapus catatan BBM tanggal {date} pada odometer {odo} KM?",
    deleteBtn: "Hapus",
    cancelBtn: "Batal"
  }
};

export default function FuelTab({
  activeMotor,
  fuelLogs,
  onOpenAddFuelModal,
  onOpenEditFuelModal,
  onDeleteFuelLog,
  showConfirm,
  lang
}: FuelTabProps) {
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!activeMotor) {
    return (
      <section id="tab-bbm" className="tab-content active">
        <div className="section-header">
          <h2>{t.fuelTracker}</h2>
          <p className="section-desc">{t.fuelDesc}</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <h3>{t.noActiveMotor}</h3>
          <p>{t.noActiveMotorDesc}</p>
        </div>
      </section>
    );
  }

  // Filter logs for active motorcycle
  const motorLogs = fuelLogs
    .filter(log => log.motorcycleId === activeMotor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odometer - a.odometer);

  const filteredMotorLogs = motorLogs.filter(log => {
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

  // For calculations, we need chronological order (oldest first)
  const chronoLogs = [...filteredMotorLogs].reverse();

  // Calculate statistics
  let totalLiters = 0;
  let totalCost = 0;
  let totalDistance = 0;
  let avgKmL = 0;
  let avgCostKm = 0;
  let avgLitersKm = 0;

  chronoLogs.forEach(log => {
    totalLiters += log.liters;
    totalCost += log.price;
  });

  // Daily fuel consumption calculations
  let dailyLiters = 0;
  let dailyCost = 0;
  let totalDays = 0;

  if (chronoLogs.length > 0) {
    const d1 = new Date(chronoLogs[0].date);
    let d2 = new Date();
    if (timeRange === 'custom' && endDate) {
      d2 = new Date(endDate);
    }
    
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    const diffTime = d2.getTime() - d1.getTime();
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) totalDays = 1;
    
    dailyLiters = totalLiters / totalDays;
    dailyCost = totalCost / totalDays;
  }

  if (chronoLogs.length >= 2) {
    const firstLog = chronoLogs[0];
    const lastLog = chronoLogs[chronoLogs.length - 1];
    totalDistance = lastLog.odometer - firstLog.odometer;

    // Fuel consumed inside the tracked distance is everything filled after the first log
    const litersForEfficiency = chronoLogs.slice(1).reduce((sum, log) => sum + log.liters, 0);
    const costForEfficiency = chronoLogs.slice(1).reduce((sum, log) => sum + log.price, 0);

    if (totalDistance > 0 && litersForEfficiency > 0) {
      avgKmL = totalDistance / litersForEfficiency;
      avgCostKm = costForEfficiency / totalDistance;
      avgLitersKm = litersForEfficiency / totalDistance;
    }
  }

  const handleDeleteClick = (id: string, date: string, odo: number) => {
    const formattedDate = formatDate(date, lang);
    showConfirm(
      t.confirmDeleteTitle,
      t.confirmDeleteMsg.replace('{date}', formattedDate).replace('{odo}', odo.toLocaleString('id-ID')),
      () => {
        onDeleteFuelLog(id);
      },
      undefined,
      { confirmText: t.deleteBtn, cancelText: t.cancelBtn, isDanger: true }
    );
  };

  return (
    <section id="tab-bbm" className="tab-content active">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>{t.fuelTracker}</h2>
          <p className="section-desc">{t.fuelDesc}</p>
        </div>
        <button className="btn btn-primary btn-sm btn-icon" onClick={onOpenAddFuelModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>{t.recordFuel}</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.averageConsumption}</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${avgKmL.toFixed(1)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>KM/L</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${(avgLitersKm).toFixed(3)} L / KM` : t.requiresTwoLogs}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.costPerKm}</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${formatCurrency(Math.round(avgCostKm), lang)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>/KM</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${t.trackedDistance}: ${totalDistance.toLocaleString('id-ID')} KM` : t.requiresTwoLogs}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.totalFuelExpenses}</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {formatCurrency(totalCost, lang)}
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {t.totalVolume}: {totalLiters.toFixed(1)} L ({chronoLogs.length} {t.fillups})
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.dailyFuelConsumption}</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {chronoLogs.length > 0 ? `${dailyLiters.toFixed(2)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>L/{lang === 'en' ? 'Day' : 'Hari'}</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length > 0 ? `${formatCurrency(Math.round(dailyCost), lang)} / ${lang === 'en' ? 'day' : 'hari'} (${totalDays} ${t.days})` : t.noData}
          </div>
        </div>
      </div>

      {/* Fuel Log List Table */}
      <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.fuelLogHistory}</h3>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t.dateFilter}</label>
            <select 
              className="custom-select custom-select-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
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
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.startDate}</label>
              <input 
                type="date" 
                className="form-control" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.endDate}</label>
              <input 
                type="date" 
                className="form-control" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>
        )}

        {filteredMotorLogs.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {timeRange === 'all' 
              ? t.noLogsRecorded
              : t.noLogsInRange
            }
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thDate}</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thOdo}</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thVolume}</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thCost}</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thPriceL}</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>{t.thConsumption}</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{t.thAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMotorLogs.map((log, index) => {
                  let tripKmL = 0;
                  let tripCostKm = 0;
                  let tripLitersKm = 0;
                  let hasTripStats = false;
                  
                  const currentChronoIndex = chronoLogs.findIndex(item => item.id === log.id);
                  if (currentChronoIndex > 0) {
                    const prevLog = chronoLogs[currentChronoIndex - 1];
                    const distance = log.odometer - prevLog.odometer;
                    
                    if (distance > 0) {
                      tripKmL = distance / log.liters;
                      tripCostKm = log.price / distance;
                      tripLitersKm = log.liters / distance;
                      hasTripStats = true;
                    }
                  }

                  const pricePerLiter = log.price / log.liters;

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        {formatDate(log.date, lang)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                        {log.odometer.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} KM
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {log.liters.toFixed(2)} L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                        {formatCurrency(log.price, lang)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatCurrency(Math.round(pricePerLiter), lang)}/L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {hasTripStats ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                              {tripKmL.toFixed(1)} KM/L
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {formatCurrency(Math.round(tripCostKm), lang)}/KM &bull; {tripLitersKm.toFixed(3)} L/KM
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {t.initialOdo}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            title={t.editLog}
                            onClick={() => onOpenEditFuelModal(log)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              color: 'var(--color-primary)',
                              border: 'none',
                              background: 'rgba(6, 182, 212, 0.05)'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                          </button>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            title={t.deleteLog}
                            onClick={() => handleDeleteClick(log.id, log.date, log.odometer)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              color: 'var(--color-danger)',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.05)'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
