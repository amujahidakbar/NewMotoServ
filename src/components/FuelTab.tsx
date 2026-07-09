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
    return d.toLocaleDateString('en-US', options);
  }
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default function FuelTab({
  activeMotor,
  fuelLogs,
  onOpenAddFuelModal,
  onOpenEditFuelModal,
  onDeleteFuelLog,
  showConfirm
}: FuelTabProps) {
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!activeMotor) {
    return (
      <section id="tab-bbm" className="tab-content active">
        <div className="section-header">
          <h2>Fuel Efficiency Tracker</h2>
          <p className="section-desc">Monitor fuel economy and gas expense records for your vehicles.</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <h3>No Active Motorcycle</h3>
          <p>Please select or add a motorcycle first to manage fuel logs.</p>
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
    showConfirm(
      'Delete Fuel Log',
      `Are you sure you want to delete the fuel log from ${date} at odometer ${odo.toLocaleString('id-ID')} KM?`,
      () => {
        onDeleteFuelLog(id);
      },
      undefined,
      { confirmText: 'Delete', cancelText: 'Cancel', isDanger: true }
    );
  };

  return (
    <section id="tab-bbm" className="tab-content active">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Fuel Efficiency Tracker</h2>
          <p className="section-desc">Monitor fuel economy and gas expense records for your vehicles.</p>
        </div>
        <button className="btn btn-primary btn-sm btn-icon" onClick={onOpenAddFuelModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Record Fuel</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Consumption</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${avgKmL.toFixed(1)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>KM/L</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `${(avgLitersKm).toFixed(3)} L / KM` : 'Requires at least 2 logs'}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cost Per Kilometer</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `IDR ${Math.round(avgCostKm).toLocaleString('id-ID')}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>/KM</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length >= 2 ? `Tracked distance: ${totalDistance.toLocaleString('id-ID')} KM` : 'Requires at least 2 logs'}
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Fuel Expenses</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            IDR {totalCost.toLocaleString('id-ID')}
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total volume: {totalLiters.toFixed(1)} Liters ({chronoLogs.length} fill-ups)
          </div>
        </div>

        <div className="card overview-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div className="card-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Fuel Consumption</div>
          <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {chronoLogs.length > 0 ? `${dailyLiters.toFixed(2)}` : 'N/A'} <small style={{ fontSize: '0.9rem', fontWeight: 500 }}>L/Day</small>
          </div>
          <div className="card-subtext" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {chronoLogs.length > 0 ? `IDR ${Math.round(dailyCost).toLocaleString('id-ID')} / day (${totalDays} days)` : 'No data available'}
          </div>
        </div>
      </div>

      {/* Fuel Log List Table */}
      <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Fuel Log History</h3>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date Filter:</label>
            <select 
              className="custom-select custom-select-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {timeRange === 'custom' && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>End Date</label>
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
              ? 'No fuel logs recorded yet. Click "Record Fuel" above to log your first fill-up.'
              : 'No fuel logs found for the selected date range.'
            }
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Odometer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Volume</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total Cost</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Price/Liter</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Consumption per KM</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMotorLogs.map((log, index) => {
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
                        {log.odometer.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} KM
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {log.liters.toFixed(2)} L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                        IDR {log.price.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        IDR {Math.round(pricePerLiter).toLocaleString('id-ID')}/L
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {hasTripStats ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                              {tripKmL.toFixed(1)} KM/L
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              IDR {Math.round(tripCostKm).toLocaleString('id-ID')}/KM &bull; {tripLitersKm.toFixed(3)} L/KM
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Initial / Odo correction
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            title="Edit Log"
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
                            title="Delete Log"
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
