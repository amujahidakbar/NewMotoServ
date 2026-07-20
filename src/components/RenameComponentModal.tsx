'use client';

import React, { useState } from 'react';

interface RenameComponentModalProps {
  oldName: string;
  onClose: () => void;
  onRename: (newName: string) => Promise<boolean>;
  lang: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    title: "Rename Component",
    errorEmpty: "Component name cannot be empty!",
    errorDuplicate: "A component with this name already exists!",
    labelOld: "Current Name",
    labelNew: "New Name",
    cancel: "Cancel",
    saving: "Saving...",
    saveBtn: "Rename"
  },
  id: {
    title: "Ganti Nama Komponen",
    errorEmpty: "Nama komponen tidak boleh kosong!",
    errorDuplicate: "Komponen dengan nama ini sudah terdaftar!",
    labelOld: "Nama Sekarang",
    labelNew: "Nama Baru",
    cancel: "Batal",
    saving: "Menyimpan...",
    saveBtn: "Ubah Nama"
  }
};

export default function RenameComponentModal({
  oldName,
  onClose,
  onRename,
  lang
}: RenameComponentModalProps) {
  const [newName, setNewName] = useState(oldName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedNew = newName.trim();
    if (!trimmedNew) {
      setError(t.errorEmpty);
      return;
    }

    if (trimmedNew.toLowerCase() === oldName.toLowerCase()) {
      onClose();
      return;
    }

    setLoading(true);
    const success = await onRename(trimmedNew);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop open" id="modal-rename-component" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 100 }}>
      <div className="modal-dialog" style={{ maxWidth: '400px', width: '90%', margin: '0 auto', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</h3>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert-banner" style={{ display: 'flex', borderRadius: 'var(--radius-sm)' }}>
                <div className="alert-message" style={{ fontSize: '0.8rem' }}>{error}</div>
              </div>
            )}
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.labelOld}</label>
              <input
                type="text"
                className="form-control"
                value={oldName}
                disabled
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.labelNew}</label>
              <input
                type="text"
                className="form-control"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError(null);
                }}
                required
                autoFocus
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t.saving : t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
