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
}

// Format Date helper to prevent time zone shifts
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString('id-ID', options);
  }
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

export default function FuelTab({
  activeMotor,
  fuelLogs,
  onOpenAddFuelModal,
  onOpenEditFuelModal,
  onDeleteFuelLog,
  showConfirm
}: FuelTabProps) {
  const [filterMonth, setFilterMonth] = useState('');

  if (!activeMotor) {
    return (
      <section id="tab-bbm" className="tab-content active">
        <div className="section-header">
          <h2>Konsumsi Bahan Bakar (BBM)</h2>
          <p className="section-desc">Pantau efisiensi konsumsi bahan bakar dan pengeluaran BBM kendaraan Anda.</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <h3>Belum Ada Kendaraan Aktif</h3>
          <p>Pilih atau tambahkan sepeda motor terlebih dahulu untuk mengelola catatan BBM.</p>
        </div>
      </section>
    );
  }

  // Filter logs for active motorcycle
  const motorLogs = fuelLogs
    .filter(log => log.motorcycleId === activeMotor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odometer - a.odometer);

  // For calculations, we need chronological order (oldest first)
  const chronoLogs = [...motorLogs].reverse();

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
    showConfirm(
      'Hapus Catatan BBM',
      `Apakah Anda yakin ingin menghapus catatan BBM tanggal ${date} pada odometer ${odo.toLocaleString('id-ID')} KM?`,
      () => {
        onDeleteFuelLog(id);
      },
      undefined,
      { confirmText: 'Hapus', cancelText: 'Batal', isDanger: true }
    );
  };

  return (
    <section id="tab-bbm" className="tab-content active">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Konsumsi Bahan Bakar (BBM)</h2>
          <p className="section-desc">Pantau efisiensi konsumsi bahan bakar dan pengeluaran BBM kendaraan Anda.</p>
        </div>
        <button className="btn btn-primary btn-sm btn-icon" onClick={onOpenAddFuelModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Catat BBM</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rata-rata Konsumsi</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${avgKmL.toFixed(1)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>KM/L</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${(avgLitersKm).toFixed(3)} L / KM` : 'Butuh minimal 2 catatan'}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Biaya Per Kilometer</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `Rp ${Math.round(avgCostKm).toLocaleString('id-ID')}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>/KM</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `Jarak ukur: ${totalDistance.toLocaleString('id-ID')} KM` : 'Butuh minimal 2 catatan'}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pengeluaran</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            Rp {totalCost.toLocaleString('id-ID')}
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total volume: {totalLiters.toFixed(1)} Liter ({chronoLogs.length} kali isi)
          </div>
        </div>
      </div>

      {/* Fuel Log List Table */}
      <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Riwayat Pengisian Bahan Bakar</h3>
        </div>

        {motorLogs.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Belum ada catatan pengisian BBM. Klik tombol "Catat BBM" di atas untuk menambah data.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tanggal</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Odometer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Volume</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total Biaya</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Harga/Liter</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Konsumsi per KM</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {motorLogs.map((log, index) => {
                  // To calculate efficiency, we look for the next chronological log (which is index+1 in chronoLogs, meaning index-1 in sorted motorLogs)
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
                        {formatDate(log.date)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                        {log.odometer.toLocaleString('id-ID')} KM
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {log.liters.toFixed(2)} L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                        Rp {log.price.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Rp {Math.round(pricePerLiter).toLocaleString('id-ID')}/L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {hasTripStats ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                              {tripKmL.toFixed(1)} KM/L
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Rp {Math.round(tripCostKm).toLocaleString('id-ID')}/KM &bull; {tripLitersKm.toFixed(3)} L/KM
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Data awal / Odo turun
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            title="Edit Catatan"
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
                            title="Hapus Catatan"
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
