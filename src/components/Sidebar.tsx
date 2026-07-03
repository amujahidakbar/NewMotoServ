'use client';

import React from 'react';

interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  plate: string;
  type: string;
  currentOdo: number;
}

interface SidebarProps {
  user: { id: number; name: string; email: string } | null;
  motorcycles: Motorcycle[];
  activeMotorcycleId: string;
  onSelectMotorcycle: (id: string) => void;
  onOpenAddMotorOpen?: () => void; // legacy
  onOpenAddMotorModal: () => void;
  onOpenUpdateOdoModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Sidebar({
  user,
  motorcycles,
  activeMotorcycleId,
  onSelectMotorcycle,
  onOpenAddMotorModal,
  onOpenUpdateOdoModal,
  activeTab,
  onSelectTab,
  onLogout,
  onOpenAuthModal,
  theme,
  onToggleTheme
}: SidebarProps) {
  const activeMotor = motorcycles.find(m => m.id === activeMotorcycleId);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const renderProfileMenu = (position: 'desktop' | 'mobile') => {
    const isDesktop = position === 'desktop';
    return (
      <div className="profile-menu-container">
        <button 
          className="avatar-btn" 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: user ? 'var(--color-primary)' : 'var(--text-muted)',
            color: 'var(--bg-base)',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="Menu Profil"
          aria-label="Buka Menu Profil"
          aria-expanded={showProfileMenu}
        >
          {user ? user.name.charAt(0).toUpperCase() : 'G'}
        </button>

        {showProfileMenu && (
          <>
            <div className="profile-menu-backdrop" onClick={() => setShowProfileMenu(false)} />
            <div className="profile-dropdown-menu" style={isDesktop ? { bottom: '50px', top: 'auto', left: '0', right: 'auto' } : undefined}>
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar" style={{ backgroundColor: user ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  {user ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="profile-dropdown-info">
                  <div className="profile-dropdown-name" style={{ color: 'var(--text-primary)' }}>
                    {user ? user.name : 'Sesi Guest (Tamu)'}
                  </div>
                  <div className="profile-dropdown-email">
                    {user ? user.email : 'Data Disimpan Lokal'}
                  </div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <div className="profile-dropdown-body">
                {user ? (
                  <button 
                    className="btn btn-secondary btn-sm profile-dropdown-btn-logout" 
                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    <span>Keluar</span>
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm profile-dropdown-btn-login" 
                    onClick={() => { setShowProfileMenu(false); onOpenAuthModal(); }}
                  >
                    <span>Login / Daftar</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="app-header">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <path d="M8 12l2.5 2.5 5.5-5.5" />
            </svg>
          </div>
          <h1>Moto<span>Serv</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-icon-only theme-toggle-btn" 
            onClick={onToggleTheme}
            title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
            style={{ 
              width: '32px', 
              height: '32px', 
              border: 'none', 
              background: 'var(--border-color)', 
              borderRadius: '50%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '0',
              color: 'var(--text-primary)'
            }}
            aria-label="Toggle tema tampilan"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
          <div className="mobile-profile-only">
            {renderProfileMenu('mobile')}
          </div>
        </div>
      </div>

      {/* Active Motorcycle Selector */}
      <div className="motorcycle-selector-container">
        <label htmlFor="active-motorcycle-select">Motor Aktif</label>
        <div className="selector-row">
          <div className="select-wrapper" style={{ flex: 1 }}>
            <select 
              id="active-motorcycle-select" 
              className="custom-select"
              value={activeMotorcycleId}
              onChange={(e) => onSelectMotorcycle(e.target.value)}
              disabled={motorcycles.length === 0}
            >
              {motorcycles.length === 0 ? (
                <option value="">Tidak ada motor</option>
              ) : (
                motorcycles.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.plate ? `(${m.plate})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
          <button 
            className="btn btn-secondary btn-icon-only" 
            id="btn-quick-add-motor" 
            title="Tambah Motor Baru"
            onClick={onOpenAddMotorModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Current Odometer Widget */}
      {activeMotor && (
        <div className="odometer-widget" id="header-odometer-widget">
          <div className="odo-info">
            <span className="odo-label">Odometer Saat Ini</span>
            <span className="odo-value" id="header-odometer-value">
              {activeMotor.currentOdo.toLocaleString('id-ID')} <small>KM</small>
            </span>
          </div>
          <button 
            className="btn btn-primary btn-sm btn-icon" 
            id="btn-quick-update-odo" 
            title="Perbarui Odometer"
            onClick={onOpenUpdateOdoModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
            <span>Update KM</span>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="main-nav" style={{ flex: 1 }}>
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => onSelectTab('dashboard')}
        >
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'riwayat' ? 'active' : ''}`} 
          onClick={() => onSelectTab('riwayat')}
        >
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Riwayat Servis</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'garasi' ? 'active' : ''}`} 
          onClick={() => onSelectTab('garasi')}
        >
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2M21 17a2 2 0 11-4 0M7 17a2 2 0 11-4 0"/>
            <path d="M13 6h-3M16 10H5"/>
          </svg>
          <span>Garasi</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'bbm' ? 'active' : ''}`} 
          onClick={() => onSelectTab('bbm')}
        >
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22v-4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4M18 5a3 3 0 0 0-3 3v11a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3z"/>
            <line x1="14" y1="9" x2="22" y2="9"/>
            <circle cx="18" cy="14" r="1"/>
            <path d="M10 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          </svg>
          <span>BBM</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'pengaturan' ? 'active' : ''}`} 
          onClick={() => onSelectTab('pengaturan')}
        >
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* User Info Session & Logout */}
      <div className="desktop-profile-only" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        {renderProfileMenu('desktop')}
      </div>
    </header>
  );
}
