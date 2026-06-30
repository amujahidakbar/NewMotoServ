'use client';

import React from 'react';

interface LandingPageProps {
  onStartAuth: () => void;
}

export default function LandingPage({ onStartAuth }: LandingPageProps) {
  return (
    <div className="landing-page">
      {/* Header section */}
      <header className="landing-header">
        <div className="landing-logo" id="landing-main-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <path d="M8 12l2.5 2.5 5.5-5.5" />
          </svg>
          <h2>Moto<span>Serv</span></h2>
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          id="btn-landing-login" 
          onClick={onStartAuth}
          aria-label="Masuk atau Daftar Akun"
        >
          Masuk / Daftar
        </button>
      </header>

      {/* Hero section */}
      <main style={{ flex: 1 }}>
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div className="landing-hero-left">
            <h1 className="landing-title" id="hero-heading">
              Asisten Cerdas Perawatan Motor & Pengingat Servis Pintar
            </h1>
            <p className="landing-subtitle">
              MotoServ memantau jadwal ganti oli dan penggantian suku cadang sepeda motor secara otomatis berdasarkan kilometer odometer. Tetap aman di jalan dengan status kesehatan motor yang dihitung secara real-time.
            </p>
            <button 
              className="btn btn-primary" 
              id="btn-landing-cta" 
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', alignSelf: 'flex-start' }}
              onClick={onStartAuth}
            >
              Mulai Rawat Motor Anda
            </button>
          </div>

          <div className="landing-hero-right">
            {/* Live CSS Dashboard Mockup */}
            <div className="landing-mockup" aria-hidden="true">
              <div className="mockup-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Honda Vario 160</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>12.450 KM</span>
              </div>

              <div className="mockup-gauge">
                <div className="mockup-gauge-circle">
                  {/* Mock circular gauge using border variables */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '8px solid rgba(255,255,255,0.03)',
                    borderTopColor: 'var(--color-success)',
                    borderRightColor: 'var(--color-success)',
                    transform: 'rotate(45deg)'
                  }}></div>
                  <div className="mockup-gauge-value">92%</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.75rem', fontWeight: 600 }}>Sangat Sehat</span>
              </div>

              <div className="mockup-parts">
                <div className="mockup-part-card">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oli Mesin</span>
                  <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '80%', backgroundColor: 'var(--color-success)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', textAlign: 'right' }}>400 KM lagi</span>
                </div>
                <div className="mockup-part-card">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oli Gardan</span>
                  <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '90%', backgroundColor: 'var(--color-success)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.7rem', textAlign: 'right' }}>1.600 KM lagi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Features Section */}
        <section className="landing-features-section" aria-labelledby="features-heading">
          <h2 className="landing-section-title" id="features-heading">Kenapa Menggunakan MotoServ?</h2>
          
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pemantauan Suku Cadang</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Secara real-time melacak sisa umur pemakaian komponen vital sepeda motor seperti Oli Mesin, Oli Transmisi (Gardan), Drive Belt, hingga Rantai roda.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Adaptasi Transmisi Pintar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Sistem MotoServ mengenali tipe motor Anda. Pelacakan matic memonitor oli transmisi dan belt, sementara motor manual/kopling fokus memantau ketegangan rantai.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pencatatan Riwayat Servis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Simpan semua log penggantian komponen, tanggal servis, biaya perawatan, dan catatan mekanik. Dilengkapi kalkulator pemulihan KM otomatis jika log dihapus.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Kalkulasi Biaya Perawatan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Ketahui total biaya pengeluaran untuk servis motor Anda. Membantu Anda melakukan estimasi anggaran perawatan kendaraan di masa mendatang.
              </p>
            </div>
          </div>
        </section>

        {/* MySQL Callout Banner */}
        <section style={{ maxWidth: '1200px', margin: '4rem auto 8rem auto', padding: '0 2rem' }}>
          <div className="overview-card" style={{ padding: '3rem', flexDirection: 'column', textAlign: 'center', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Sinkronisasi MySQL Cloud Aman</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              Tidak perlu khawatir kehilangan data motor Anda. Dengan mendaftarkan akun, seluruh data odometer, profil kendaraan, dan riwayat servis Anda akan dicadangkan langsung secara real-time ke MySQL server cloud kami.
            </p>
            <button className="btn btn-primary" onClick={onStartAuth} style={{ marginTop: '1rem' }}>
              Daftar Akun Backup Sekarang
            </button>
          </div>
        </section>
      </main>

      {/* Footer section with SEO optimized descriptions */}
      <footer className="landing-footer">
        <div className="landing-seo-text">
          <p>
            <strong>MotoServ</strong> &copy; {new Date().getFullYear()} - Aplikasi Asisten Perawatan Motor dan Pengingat Ganti Oli Terbaik di Indonesia. Dirancang khusus untuk mempermudah pemilik motor matic, bebek, dan kopling dalam memantau kesehatan suku cadang berdasarkan odometer kendaraan secara digital demi perlindungan data maksimal.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Dibuat oleh <a href="https://www.linkedin.com/in/amujahidakbar/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Mujahid Akbar</a>
        </div>
      </footer>
    </div>
  );
}
