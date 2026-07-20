'use client';

import React, { useState, useEffect } from 'react';
import { getComponentsForType, getComponentDisplayName, getMotorTypeDisplayName } from '@/lib/constants';

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
  onOpenAddCustomComponentModal: () => void;
  isPushEnabled: boolean;
  onSubscribeNotifications: () => void;
  showAlert: (title: string, message: string, onOk?: () => void) => void;
  showConfirm: (
    title: string, 
    message: string, 
    onOk: () => void, 
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDanger?: boolean }
  ) => void;
  onRenameComponent: (oldName: string, newName: string) => Promise<boolean>;
  onOpenRenameModal: (componentName: string) => void;
  lang: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    serviceLimitSettings: "Service Limit Settings",
    configureIdealIntervals: "Configure the ideal mileage intervals for replacing your motorcycle parts.",
    noActiveMotor: "No Active Motorcycle",
    noActiveMotorDesc: "Please select or add a motorcycle first to configure service limits.",
    customizeIntervals: "Customize Mileage Intervals (KM)",
    activeBike: "Active Bike",
    changeIntervals: "Change Intervals",
    addComponent: "Add Component",
    resetDefaults: "Reset to Manufacturer Defaults",
    cancel: "Cancel",
    saveSettings: "Save Settings",
    saving: "Saving...",
    cloudBackupTitle: "Cloud Backup (MySQL Database)",
    automaticCloudBackupActive: "Automatic Cloud Backup Active",
    localSessionTitle: "Local Session (Guest Mode)",
    localSessionDesc: "You are currently using a Local Session (Guest Mode). Data is only saved in your current browser. Sign in or register to enable real-time cloud sync.",
    signInRegisterBackupAccount: "Sign In / Register Backup Account",
    mobilePushNotifications: "Mobile Push Notifications",
    pushNotificationsDesc: "Get instant push notifications sent directly to your phone when components require service (e.g. Engine Oil limit exceeded).",
    pleaseSignInFirst: "Please sign in first to register your device for cloud push notifications.",
    deviceRegistered: "Device Registered",
    reRegisterDevice: "Re-register Device",
    enableNotificationsOnMyDevice: "Enable Notifications on My Device",
    submitFeedbackAndSuggestions: "Submit Feedback & Suggestions",
    feedbackDesc: "Have new feature ideas, bug reports, or design suggestions? Send them to help us improve MotoServ!",
    category: "Category",
    yourName: "Your Name",
    yourEmail: "Your Email",
    feedbackMessage: "Feedback Message",
    feedbackPlaceholder: "Write your suggestions, bug details, or feedback here (minimum 10 characters)...",
    sending: "Sending...",
    sendFeedback: "Send Feedback",
    dangerZone: "Danger Zone",
    dangerZoneDesc: "Resetting application data will permanently delete all motorcycles, logs, and configurations.",
    factoryReset: "Factory Reset App Data",
    adminConsole: "Admin Console: Summary & Feedbacks",
    refresh: "Refresh",
    users: "Users",
    bikes: "Bikes",
    serviceLogs: "Service Logs",
    fuelLogs: "Fuel Logs",
    feedbacks: "Feedbacks",
    transmissionDistribution: "Registered Motorcycle Transmission Distribution:",
    noFeedbackReceived: "No feedback received from users yet.",
    delete: "Delete",
    invalidInputTitle: "Invalid Input",
    invalidInputMsg: "Service intervals must be greater than 100 KM!",
    resetConfirmTitle: "Reset Intervals to Default",
    resetConfirmMsg: "Are you sure you want to revert all part intervals of this motorcycle to manufacturer standards?",
    factoryResetTitle: "Factory Reset Data",
    factoryResetMsg: "WARNING: Are you sure you want to delete all motorcycle data, service history, and custom intervals? This action cannot be undone.",
    finalConfirmTitle: "Final Confirmation",
    finalConfirmMsg: "SECOND CONFIRMATION: Are you absolutely sure? All data will be lost forever.",
    feedbackErrorMsg: "Feedback message must be at least 10 characters!",
    feedbackSuccessMsg: "Your feedback has been successfully submitted. Thank you for your contribution!",
    feedbackFailedMsg: "Failed to submit feedback.",
    feedbackSystemErrorMsg: "A system error occurred while sending feedback.",
    deleteFeedbackTitle: "Delete Feedback",
    deleteFeedbackMsg: "Are you sure you want to delete this feedback?",
    feedbackDeletedSuccess: "Feedback successfully deleted.",
    feedbackDeleteFailed: "Failed to delete feedback.",
    systemError: "System error occurred.",
    enabled: "Enabled",
    disabled: "Disabled"
  },
  id: {
    serviceLimitSettings: "Pengaturan Batas Servis",
    configureIdealIntervals: "Konfigurasikan jarak tempuh ideal untuk mengganti suku cadang motor Anda.",
    noActiveMotor: "Tidak Ada Motor Aktif",
    noActiveMotorDesc: "Silakan pilih atau tambahkan sepeda motor terlebih dahulu untuk mengatur batas servis.",
    customizeIntervals: "Sesuaikan Batas Interval KM",
    activeBike: "Motor Aktif",
    changeIntervals: "Ubah Interval",
    addComponent: "Tambah Komponen",
    resetDefaults: "Kembalikan ke Setelan Pabrik",
    cancel: "Batal",
    saveSettings: "Simpan Pengaturan",
    saving: "Menyimpan...",
    cloudBackupTitle: "Sinkronisasi Cloud (Database MySQL)",
    automaticCloudBackupActive: "Pencadangan Cloud Otomatis Aktif",
    localSessionTitle: "Sesi Lokal (Mode Tamu)",
    localSessionDesc: "Anda sedang menggunakan Sesi Lokal (Mode Tamu). Data hanya disimpan di browser ini. Masuk atau daftar untuk mengaktifkan sinkronisasi cloud real-time.",
    signInRegisterBackupAccount: "Masuk / Daftar Akun Cadangan",
    mobilePushNotifications: "Notifikasi HP Pengguna",
    pushNotificationsDesc: "Dapatkan notifikasi push langsung ke ponsel Anda ketika komponen motor memerlukan servis (misal: batas oli mesin terlewati).",
    pleaseSignInFirst: "Silakan masuk terlebih dahulu untuk mendaftarkan perangkat Anda untuk notifikasi push cloud.",
    deviceRegistered: "Perangkat Terdaftar",
    reRegisterDevice: "Daftarkan Ulang Perangkat",
    enableNotificationsOnMyDevice: "Aktifkan Notifikasi HP Saya",
    submitFeedbackAndSuggestions: "Kirim Masukan & Saran",
    feedbackDesc: "Punya ide fitur baru, laporan bug, atau saran desain? Kirim masukan Anda untuk membantu kami mengembangkan MotoServ!",
    category: "Kategori",
    yourName: "Nama Anda",
    yourEmail: "Email Anda",
    feedbackMessage: "Isi Masukan",
    feedbackPlaceholder: "Tulis saran, detail bug, atau masukan Anda di sini (minimal 10 karakter)...",
    sending: "Mengirim...",
    sendFeedback: "Kirim Masukan",
    dangerZone: "Zona Bahaya (Danger Zone)",
    dangerZoneDesc: "Mereset data aplikasi akan menghapus seluruh motor, riwayat servis, log BBM, dan konfigurasi secara permanen.",
    factoryReset: "Factory Reset Seluruh Data",
    adminConsole: "Konsol Admin: Ringkasan & Masukan",
    refresh: "Segarkan",
    users: "Pengguna",
    bikes: "Motor",
    serviceLogs: "Log Servis",
    fuelLogs: "Log BBM",
    feedbacks: "Masukan",
    transmissionDistribution: "Distribusi Jenis Transmisi Motor Terdaftar:",
    noFeedbackReceived: "Belum ada masukan dari pengguna.",
    delete: "Hapus",
    invalidInputTitle: "Input Tidak Valid",
    invalidInputMsg: "Batas interval servis minimal harus lebih besar dari 100 KM!",
    resetConfirmTitle: "Reset Interval ke Setelan Pabrik",
    resetConfirmMsg: "Apakah Anda yakin ingin mengembalikan semua batas interval suku cadang motor ini ke standar rekomendasi pabrikan?",
    factoryResetTitle: "Hapus Seluruh Data",
    factoryResetMsg: "PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data motor, riwayat servis, log bensin, dan batas kustom? Tindakan ini tidak dapat dibatalkan.",
    finalConfirmTitle: "Konfirmasi Akhir",
    finalConfirmMsg: "KONFIRMASI KEDUA: Apakah Anda benar-benar yakin? Seluruh data akan hilang permanen dari server dan browser.",
    feedbackErrorMsg: "Isi masukan minimal harus berupa 10 karakter!",
    feedbackSuccessMsg: "Masukan Anda berhasil dikirim. Terima kasih atas kontribusi Anda!",
    feedbackFailedMsg: "Gagal mengirimkan masukan.",
    feedbackSystemErrorMsg: "Terjadi kesalahan sistem saat mengirim masukan.",
    deleteFeedbackTitle: "Hapus Masukan",
    deleteFeedbackMsg: "Apakah Anda yakin ingin menghapus masukan ini?",
    feedbackDeletedSuccess: "Masukan berhasil dihapus.",
    feedbackDeleteFailed: "Gagal menghapus masukan.",
    systemError: "Terjadi kesalahan sistem.",
    enabled: "Aktif",
    disabled: "Nonaktif"
  }
};

export default function SettingsTab({
  activeMotor,
  user,
  onUpdateIntervals,
  onResetIntervals,
  onFactoryResetData,
  onOpenAuthModal,
  onOpenAddCustomComponentModal,
  isPushEnabled,
  onSubscribeNotifications,
  showAlert,
  showConfirm,
  onRenameComponent,
  onOpenRenameModal,
  lang
}: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Feedback states
  const [feedbackType, setFeedbackType] = useState('Bug / Issue');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  interface AdminStats {
    totalUsers: number;
    totalMotorcycles: number;
    totalServiceLogs: number;
    totalFuelLogs: number;
    totalFeedbacks: number;
    motorcycleTypes: { type: string; count: number }[];
  }

  // Admin Feedback and stats states
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  const isAdmin = user && (
    user.email.toLowerCase() === 'amujahidakbar@gmail.com' ||
    user.email.toLowerCase().includes('amujahidakbar') ||
    user.email.toLowerCase().includes('mujahid') ||
    user.email.toLowerCase() === 'admin@motoserve.web.id'
  );

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch('/api/admin/feedbacks');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error('Error fetching feedbacks:', e);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks();
      fetchAdminStats();
    }
  }, [isAdmin]);

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
          <h2>{t.serviceLimitSettings}</h2>
          <p className="section-desc">{t.configureIdealIntervals}</p>
        </div>
        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <h3>{t.noActiveMotor}</h3>
          <p>{t.noActiveMotorDesc}</p>
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
      showAlert(t.invalidInputTitle, t.invalidInputMsg);
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
      t.resetConfirmTitle,
      t.resetConfirmMsg,
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
      t.factoryResetTitle,
      t.factoryResetMsg,
      () => {
        showConfirm(
          t.finalConfirmTitle,
          t.finalConfirmMsg,
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackMessage.trim().length < 10) {
      showAlert('Error', t.feedbackErrorMsg);
      return;
    }

    setSendingFeedback(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message: feedbackMessage,
          email: user ? user.email : feedbackEmail,
          name: user ? user.name : feedbackName
        })
      });

      if (res.ok) {
        showAlert(lang === 'en' ? 'Success' : 'Sukses', t.feedbackSuccessMsg);
        setFeedbackMessage('');
        if (!user) {
          setFeedbackEmail('');
          setFeedbackName('');
        }
        
        // If logged-in admin submits feedback, sync the list
        if (isAdmin) {
          fetchFeedbacks();
        }
      } else {
        const data = await res.json();
        showAlert(lang === 'en' ? 'Failed' : 'Gagal', data.error || t.feedbackFailedMsg);
      }
    } catch (err) {
      showAlert('Error', t.feedbackSystemErrorMsg);
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    showConfirm(
      t.deleteFeedbackTitle,
      t.deleteFeedbackMsg,
      async () => {
        try {
          const res = await fetch(`/api/admin/feedbacks/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            setFeedbacks(prev => prev.filter(f => f.id !== id));
            showAlert(lang === 'en' ? 'Success' : 'Sukses', t.feedbackDeletedSuccess);
          } else {
            showAlert(lang === 'en' ? 'Failed' : 'Gagal', t.feedbackDeleteFailed);
          }
        } catch (e) {
          showAlert('Error', t.systemError);
        }
      }
    );
  };

  const defaultComponents = getComponentsForType(activeMotor.type || 'kopling') as string[];
  const customComponents = Object.keys(activeMotor.intervals || {}).filter(
    comp => !defaultComponents.includes(comp)
  );
  const components = [...defaultComponents, ...customComponents];

  return (
    <section id="tab-pengaturan" className="tab-content active">
      <div className="section-header">
        <h2>{t.serviceLimitSettings}</h2>
        <p className="section-desc">{t.configureIdealIntervals}</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3>{t.customizeIntervals}</h3>
          <span className="active-motor-tag" id="settings-motor-tag" style={{ textTransform: 'capitalize' }}>{t.activeBike}: {activeMotor.name} ({getMotorTypeDisplayName(activeMotor.type, lang)})</span>
        </div>

        {!isEditing ? (
          <div id="settings-view-container">
            <div className="form-grid" id="settings-intervals-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {components.map(comp => {
                const isCustom = customComponents.includes(comp);
                return (
                  <div key={comp} className="form-group" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                        {getComponentDisplayName(comp, lang)}
                      </label>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => onOpenRenameModal(comp)}
                          title={lang === 'en' ? 'Rename Component' : 'Ganti Nama Komponen'}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            padding: '0.1rem 0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {(activeMotor.intervals[comp] || 0).toLocaleString('id-ID')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>KM</span>
                    </strong>
                  </div>
                );
              })}
            </div>
            <div className="settings-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                <span>{t.changeIntervals}</span>
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary btn-icon" 
                onClick={onOpenAddCustomComponentModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>{t.addComponent}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} id="settings-intervals-form" className="settings-form" style={{ display: 'block' }}>
            <div className="form-grid" id="settings-intervals-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {components.map(comp => (
                <div key={comp} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{getComponentDisplayName(comp, lang)}</label>
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
                {t.resetDefaults}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
                style={{ marginLeft: 'auto' }}
              >
                {t.cancel}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? t.saving : t.saveSettings}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cloud Backup Settings */}
      <div className="settings-card" style={{ marginTop: '1.5rem' }}>
        <div className="settings-card-header">
          <h3>{t.cloudBackupTitle}</h3>
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
            {user ? t.enabled : t.disabled}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {user ? (
            <>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                {lang === 'en' 
                  ? <>Your account is connected to: <strong>{user.email}</strong>. Your motorcycle details and service history are automatically synced to our secure cloud database.</>
                  : <>Akun Anda terhubung dengan: <strong>{user.email}</strong>. Seluruh data motor dan riwayat servis Anda otomatis disinkronkan ke database cloud kami yang aman.</>}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  disabled
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                >
                  {t.automaticCloudBackupActive}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t.localSessionDesc}
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={onOpenAuthModal}
                style={{ alignSelf: 'flex-start' }}
              >
                {t.signInRegisterBackupAccount}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Push Notifications Settings */}
      <div className="settings-card" style={{ marginTop: '1.5rem' }}>
        <div className="settings-card-header">
          <h3>{t.mobilePushNotifications}</h3>
          <span 
            className={`sync-badge ${isPushEnabled && user ? 'status-connected' : 'status-disconnected'}`}
            style={{ 
              fontSize: '0.7rem', 
              padding: '0.2rem 0.45rem', 
              borderRadius: 'var(--radius-sm)', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}
          >
            {isPushEnabled && user ? t.enabled : t.disabled}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            {t.pushNotificationsDesc}
          </p>
          {!user ? (
            <div style={{ background: 'rgba(255, 230, 230, 0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t.pleaseSignInFirst}
            </div>
          ) : isPushEnabled ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                disabled
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', opacity: 0.8 }}
              >
                {t.deviceRegistered}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={onSubscribeNotifications}
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              >
                {t.reRegisterDevice}
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={onSubscribeNotifications}
              style={{ alignSelf: 'flex-start' }}
            >
              {t.enableNotificationsOnMyDevice}
            </button>
          )}
        </div>
      </div>

      {/* Kirim Masukan Section */}
      <div className="settings-card" style={{ marginTop: '1.5rem' }}>
        <div className="settings-card-header">
          <h3>{t.submitFeedbackAndSuggestions}</h3>
        </div>
        <form onSubmit={handleFeedbackSubmit} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            {t.feedbackDesc}
          </p>
          
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.category}</label>
              <select
                className="custom-select"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                <option value="Bug / Issue">{lang === 'en' ? 'Bug / Issue' : 'Bug / Masalah'}</option>
                <option value="New Feature">{lang === 'en' ? 'New Feature' : 'Fitur Baru'}</option>
                <option value="Design Suggestion">{lang === 'en' ? 'Design Suggestion' : 'Saran Desain'}</option>
                <option value="Other">{lang === 'en' ? 'Other' : 'Lainnya'}</option>
              </select>
            </div>

            {!user && (
              <>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.yourName}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === 'en' ? "Enter your name" : "Masukkan nama Anda"}
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    required
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.yourEmail}</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@example.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    required
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.feedbackMessage}</label>
            <textarea
              className="form-control"
              placeholder={t.feedbackPlaceholder}
              rows={4}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              required
              style={{ padding: '0.65rem 0.75rem', fontSize: '0.9rem', width: '100%', resize: 'vertical', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={sendingFeedback}
            style={{ alignSelf: 'flex-start' }}
          >
            {sendingFeedback ? t.sending : t.sendFeedback}
          </button>
        </form>
      </div>

      {/* Admin Panel Section */}
      {isAdmin && (
        <div className="settings-card" style={{ marginTop: '1.5rem', border: '1px solid var(--color-primary)' }}>
          <div className="settings-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--color-primary)' }}>{lang === 'en' ? 'Admin Console: Summary & Feedbacks' : 'Konsol Admin: Ringkasan & Masukan'}</h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => { fetchFeedbacks(); fetchAdminStats(); }}
              disabled={loadingFeedbacks}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {loadingFeedbacks ? (lang === 'en' ? 'Loading...' : 'Memuat...') : t.refresh}
            </button>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Admin Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>{lang === 'en' ? 'Users' : 'Pengguna'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {adminStats !== null ? adminStats.totalUsers.toLocaleString('id-ID') : '...'}
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{lang === 'en' ? 'Bikes' : 'Motor'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {adminStats !== null ? adminStats.totalMotorcycles.toLocaleString('id-ID') : '...'}
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{lang === 'en' ? 'Service Logs' : 'Log Servis'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {adminStats !== null ? adminStats.totalServiceLogs.toLocaleString('id-ID') : '...'}
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{lang === 'en' ? 'Fuel Logs' : 'Log BBM'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {adminStats !== null ? adminStats.totalFuelLogs.toLocaleString('id-ID') : '...'}
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{lang === 'en' ? 'Feedbacks' : 'Masukan'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {feedbacks.length}
                </div>
              </div>
            </div>

            {/* Motorcycle Types Breakdown */}
            {adminStats?.motorcycleTypes && adminStats.motorcycleTypes.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.transmissionDistribution}</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {adminStats.motorcycleTypes.map(tData => (
                    <div key={tData.type} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="badge" style={{ textTransform: 'capitalize', padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>{getMotorTypeDisplayName(tData.type, lang)}</span>
                      <strong>{tData.count} {lang === 'en' ? 'unit(s)' : 'unit'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }}></div>
            {feedbacks.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                {t.noFeedbackReceived}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {feedbacks.map(fb => (
                  <div key={fb.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fb.userName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>&lt;{fb.userEmail}&gt;</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.15rem 0.4rem', 
                        borderRadius: '4px', 
                        background: fb.type.includes('Bug') ? 'rgba(239, 68, 68, 0.1)' : fb.type.includes('New') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: fb.type.includes('Bug') ? 'var(--color-danger)' : fb.type.includes('New') ? 'var(--color-success)' : 'var(--text-secondary)',
                      }}>
                        {fb.type === 'Bug / Issue' 
                          ? (lang === 'en' ? 'Bug / Issue' : 'Bug / Masalah')
                          : fb.type === 'New Feature'
                          ? (lang === 'en' ? 'New Feature' : 'Fitur Baru')
                          : fb.type === 'Design Suggestion'
                          ? (lang === 'en' ? 'Design Suggestion' : 'Saran Desain')
                          : fb.type === 'Other'
                          ? (lang === 'en' ? 'Other' : 'Lainnya')
                          : fb.type}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: '0.5rem 0 0.75rem 0', lineHeight: '1.4' }}>
                      {fb.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(fb.createdAt).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteFeedback(fb.id)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="danger-zone-card" style={{ marginTop: '1.5rem' }}>
        <h3>{t.dangerZone}</h3>
        <p>{t.dangerZoneDesc}</p>
        <button 
          className="btn btn-danger" 
          id="btn-factory-reset"
          disabled={loading}
          onClick={handleFactoryResetClick}
        >
          {t.factoryReset}
        </button>
      </div>
    </section>
  );
}
