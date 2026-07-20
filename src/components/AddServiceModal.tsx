'use client';

import React, { useState, useEffect } from 'react';
import { getComponentsForType, getComponentDisplayName } from '@/lib/constants';

interface Motorcycle {
  id: string;
  name: string;
  currentOdo: number;
  type: string;
  intervals: Record<string, number>;
}

interface AddServiceModalProps {
  activeMotor: Motorcycle;
  preselectedComponent?: string;
  onClose: () => void;
  onAddLog: (log: {
    date: string;
    odometer: number;
    components: string[];
    cost: number;
    notes: string;
  }) => Promise<boolean>;
  lang: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    recordTitle: "Record Part Service",
    errorPositiveOdo: "Odometer must be a positive number!",
    errorSelectComp: "Select at least one component to service!",
    dateLabel: "Service Date",
    odoLabel: "Service Odometer (KM)",
    replacedPartsLabel: "Replaced Parts / Components",
    helpText: "You can select multiple components if they were serviced at the same time.",
    costLabel: "Total Cost (IDR - Optional)",
    notesLabel: "Notes & Details (Optional)",
    notesPlaceholder: "e.g. Changed engine oil with fully synthetic oil and replaced air filter.",
    cancel: "Cancel",
    saving: "Saving...",
    recordBtn: "Record Service"
  },
  id: {
    recordTitle: "Catat Servis Suku Cadang",
    errorPositiveOdo: "Odometer harus berupa angka positif!",
    errorSelectComp: "Pilih minimal satu komponen untuk diservis!",
    dateLabel: "Tanggal Servis",
    odoLabel: "Odometer Servis (KM)",
    replacedPartsLabel: "Suku Cadang / Komponen yang Diganti",
    helpText: "Anda dapat memilih beberapa komponen sekaligus jika diservis secara bersamaan.",
    costLabel: "Total Biaya (Rp - Opsional)",
    notesLabel: "Catatan & Detail (Opsional)",
    notesPlaceholder: "misal: Ganti oli mesin dengan oli sintetis penuh dan ganti filter udara.",
    cancel: "Batal",
    saving: "Menyimpan...",
    recordBtn: "Catat Servis"
  }
};

export default function AddServiceModal({
  activeMotor,
  preselectedComponent,
  onClose,
  onAddLog,
  lang
}: AddServiceModalProps) {
  const [date, setDate] = useState('');
  const [odometer, setOdometer] = useState(activeMotor.currentOdo.toString());
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Initialize dates and pre-selections
  useEffect(() => {
    // Set to local YYYY-MM-DD
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    setDate(localDate.toISOString().split('T')[0]);

    if (preselectedComponent) {
      setSelectedComponents([preselectedComponent]);
    }
  }, [preselectedComponent]);

  const handleCheckboxChange = (comp: string) => {
    setSelectedComponents(prev => 
      prev.includes(comp) 
        ? prev.filter(c => c !== comp) 
        : [...prev, comp]
    );
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedOdo = parseFloat(odometer);

    if (isNaN(parsedOdo) || parsedOdo < 0) {
      setError(t.errorPositiveOdo);
      return;
    }

    if (selectedComponents.length === 0) {
      setError(t.errorSelectComp);
      return;
    }

    setLoading(true);
    const success = await onAddLog({
      date,
      odometer: parsedOdo,
      components: selectedComponents,
      cost: parseInt(cost) || 0,
      notes
    });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  const availableComponents = Object.keys(activeMotor.intervals || {}).length > 0
    ? Object.keys(activeMotor.intervals)
    : (getComponentsForType(activeMotor.type || 'kopling') as string[]);

  return (
    <div className="modal-backdrop open" id="modal-add-service-log" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '500px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.recordTitle}</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.dateLabel}</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.odoLabel}</label>
                <input
                  type="number"
                  className="form-control"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  min="0"
                  step="any"
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>

            {/* Checkboxes grid for components */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.replacedPartsLabel}</label>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '0.5rem', 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--border-color)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.05)'
                }}
              >
                {availableComponents.map(comp => (
                  <label 
                    key={comp} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.2rem 0'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(comp)}
                      onChange={() => handleCheckboxChange(comp)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <span>{getComponentDisplayName(comp, lang)}</span>
                  </label>
                ))}
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.helpText}</small>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.costLabel}</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 150000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.notesLabel}</label>
              <textarea
                className="form-control"
                placeholder={t.notesPlaceholder}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t.saving : t.recordBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
