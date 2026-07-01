'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Auth from '@/components/Auth';
import LandingPage from '@/components/LandingPage';
import Sidebar from '@/components/Sidebar';
import DashboardTab from '@/components/DashboardTab';
import HistoryTab from '@/components/HistoryTab';
import GarageTab from '@/components/GarageTab';
import SettingsTab from '@/components/SettingsTab';
import AddMotorcycleModal from '@/components/AddMotorcycleModal';
import UpdateOdometerModal from '@/components/UpdateOdometerModal';
import AddServiceModal from '@/components/AddServiceModal';
import CustomDialog from '@/components/CustomDialog';
import { DEFAULT_INTERVALS, normalizeMotorType } from '@/lib/constants';

interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  plate: string;
  type: string;
  currentOdo: number;
  intervals: Record<string, number>;
  lastService: Record<string, number>;
}

interface ServiceLog {
  id: string;
  motorcycleId: string;
  date: string;
  odometer: number;
  components: string[];
  cost: number;
  notes: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [activeMotorcycleId, setActiveMotorcycleId] = useState<string>('');
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isAddMotorOpen, setIsAddMotorOpen] = useState(false);
  const [isUpdateOdoOpen, setIsUpdateOdoOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [preselectedCompForService, setPreselectedCompForService] = useState<string | undefined>(undefined);

  // Custom dialogs state
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showCustomAlert = useCallback((title: string, message: string, onOk?: () => void) => {
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if (onOk) onOk();
      },
      onCancel: () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if (onOk) onOk();
      }
    });
  }, []);

  const showCustomConfirm = useCallback((
    title: string, 
    message: string, 
    onOk: () => void, 
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string; isDanger?: boolean }
  ) => {
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        onOk();
      },
      onCancel: () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      },
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      isDanger: options?.isDanger
    });
  }, []);

  // 1. Fetch data from DB (for authenticated users)
  const fetchDataFromDB = useCallback(async () => {
    try {
      const resMotors = await fetch('/api/motorcycles');
      if (resMotors.ok) {
        const motorsData = await resMotors.json();
        setMotorcycles(motorsData);
        
        if (motorsData.length > 0) {
          const cachedActiveId = localStorage.getItem('motoserv_active_motorcycle_id');
          const isCachedValid = motorsData.some((m: Motorcycle) => m.id === cachedActiveId);
          if (cachedActiveId && isCachedValid) {
            setActiveMotorcycleId(cachedActiveId);
          } else {
            setActiveMotorcycleId(motorsData[0].id);
            localStorage.setItem('motoserv_active_motorcycle_id', motorsData[0].id);
          }
        } else {
          setActiveMotorcycleId('');
          localStorage.removeItem('motoserv_active_motorcycle_id');
        }
      }

      const resLogs = await fetch('/api/service-history');
      if (resLogs.ok) {
        const logsData = await resLogs.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Error fetching data from database:', err);
    }
  }, []);

  // 2. Load data from Local Storage (for guest users)
  const loadDataFromLocalStorage = useCallback(() => {
    const cachedMotors = localStorage.getItem('motoserv_guest_motorcycles');
    const cachedLogs = localStorage.getItem('motoserv_guest_logs');
    const cachedActiveId = localStorage.getItem('motoserv_guest_active_motor_id');

    if (cachedMotors && cachedLogs) {
      try {
        const motors = JSON.parse(cachedMotors);
        const serviceLogs = JSON.parse(cachedLogs);
        setMotorcycles(motors);
        setLogs(serviceLogs);
        
        if (motors.length > 0) {
          const isValid = motors.some((m: Motorcycle) => m.id === cachedActiveId);
          const activeId = isValid ? cachedActiveId! : motors[0].id;
          setActiveMotorcycleId(activeId);
          localStorage.setItem('motoserv_guest_active_motor_id', activeId);
        } else {
          setActiveMotorcycleId('');
        }
      } catch (e) {
        console.error('Error parsing guest localStorage cache, resetting...', e);
        initializeEmptyGuest();
      }
    } else {
      initializeEmptyGuest();
    }
  }, []);

  // Helper to initialize empty guest data on first visit
  const initializeEmptyGuest = () => {
    setMotorcycles([]);
    setLogs([]);
    setActiveMotorcycleId('');
    localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify([]));
    localStorage.setItem('motoserv_guest_logs', JSON.stringify([]));
    localStorage.removeItem('motoserv_guest_active_motor_id');
  };

  // 3. Check user authentication session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // 3a. Read theme configuration on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('motoserv_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 3b. Sync theme changes with body class list
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // 4. Fetch database data once user state changes to logged-in
  useEffect(() => {
    if (user) {
      fetchDataFromDB();
    }
  }, [user, fetchDataFromDB]);

  // 5. Auth Success Callback
  const handleAuthSuccess = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);

    // Sync guest data to user account in the cloud
    const cachedMotors = localStorage.getItem('motoserv_guest_motorcycles');
    const cachedLogs = localStorage.getItem('motoserv_guest_logs');
    
    if (cachedMotors && cachedLogs) {
      try {
        const motors = JSON.parse(cachedMotors);
        const serviceLogs = JSON.parse(cachedLogs);
        
        // We sync if there are custom logs/motors
        if (motors.length > 0) {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motorcycles: motors, logs: serviceLogs })
          });
          
          if (syncRes.ok) {
            showCustomAlert('Sinkronisasi Sukses', 'Data lokal Anda berhasil disinkronkan ke database cloud.');
            // Clear guest cache
            localStorage.removeItem('motoserv_guest_motorcycles');
            localStorage.removeItem('motoserv_guest_logs');
            localStorage.removeItem('motoserv_guest_active_motor_id');
          }
        }
      } catch (e) {
        console.error('Error syncing guest local cache:', e);
      }
    }
    
    // Fetch refreshed DB values
    fetchDataFromDB();
  };

  // 6. Logout handler
  const handleLogout = () => {
    showCustomConfirm(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun Anda? Seluruh data yang tersimpan di cloud tetap aman.',
      async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
          showCustomAlert('Sesi Berakhir', 'Anda telah berhasil keluar.');
        } catch (err) {
          console.error('Logout error:', err);
        }
      },
      undefined,
      { confirmText: 'Keluar', cancelText: 'Batal', isDanger: true }
    );
  };

  // 6a. Theme toggler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('motoserv_theme', newTheme);
  };

  // 7. Handle active motorcycle toggle
  const handleSelectMotorcycle = (id: string) => {
    setActiveMotorcycleId(id);
    if (user) {
      localStorage.setItem('motoserv_active_motorcycle_id', id);
    } else {
      localStorage.setItem('motoserv_guest_active_motor_id', id);
    }
  };

  // 8. Add motorcycle handler
  const handleAddMotorcycle = async (motorData: {
    name: string;
    brand: string;
    plate: string;
    type: string;
    currentOdo: number;
  }) => {
    if (user) {
      // Authenticated DB Save
      try {
        const res = await fetch('/api/motorcycles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(motorData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles(prev => {
          const updated = [...prev, data];
          if (updated.length === 1) {
            setActiveMotorcycleId(data.id);
            localStorage.setItem('motoserv_active_motorcycle_id', data.id);
          }
          return updated;
        });
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal menambahkan motor.');
        return false;
      }
    } else {
      // Guest Local Storage Save
      const normType = normalizeMotorType(motorData.type);
      const defaultIntervalsForType = DEFAULT_INTERVALS[normType];
      
      const newMotor: Motorcycle = {
        id: 'motor_' + Math.random().toString(36).substring(2, 9),
        name: motorData.name,
        brand: motorData.brand || '',
        plate: motorData.plate || '',
        type: motorData.type,
        currentOdo: motorData.currentOdo,
        intervals: { ...defaultIntervalsForType },
        lastService: Object.keys(defaultIntervalsForType).reduce((acc, comp) => {
          acc[comp] = 0;
          return acc;
        }, {} as Record<string, number>)
      };

      setMotorcycles(prev => {
        const updated = [...prev, newMotor];
        let nextActiveId = activeMotorcycleId;
        if (updated.length === 1 || !activeMotorcycleId) {
          nextActiveId = newMotor.id;
          setActiveMotorcycleId(newMotor.id);
          localStorage.setItem('motoserv_guest_active_motor_id', newMotor.id);
        }
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });

      return true;
    }
  };

  // 9. Delete motorcycle handler
  const handleDeleteMotorcycle = (id: string) => {
    const motor = motorcycles.find(m => m.id === id);
    if (!motor) return;

    showCustomConfirm(
      'Hapus Sepeda Motor',
      `Apakah Anda yakin ingin menghapus sepeda motor "${motor.name}"? Seluruh data interval kustom dan riwayat servis motor ini akan ikut terhapus permanen.`,
      async () => {
        if (user) {
          // Authenticated DB Delete
          try {
            const res = await fetch(`/api/motorcycles/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMotorcycles(prev => {
              const updated = prev.filter(m => m.id !== id);
              if (activeMotorcycleId === id) {
                const nextActiveId = updated.length > 0 ? updated[0].id : '';
                setActiveMotorcycleId(nextActiveId);
                if (nextActiveId) {
                  localStorage.setItem('motoserv_active_motorcycle_id', nextActiveId);
                } else {
                  localStorage.removeItem('motoserv_active_motorcycle_id');
                }
              }
              return updated;
            });
            setLogs(prev => prev.filter(log => log.motorcycleId !== id));
            showCustomAlert('Sukses', 'Sepeda motor berhasil dihapus.');
          } catch (err: any) {
            showCustomAlert('Error', err.message || 'Gagal menghapus motor.');
          }
        } else {
          // Guest Local Storage Delete
          setMotorcycles(prev => {
            const updated = prev.filter(m => m.id !== id);
            let nextActiveId = activeMotorcycleId;
            if (activeMotorcycleId === id) {
              nextActiveId = updated.length > 0 ? updated[0].id : '';
              setActiveMotorcycleId(nextActiveId);
              if (nextActiveId) {
                localStorage.setItem('motoserv_guest_active_motor_id', nextActiveId);
              } else {
                localStorage.removeItem('motoserv_guest_active_motor_id');
              }
            }
            localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
            return updated;
          });

          setLogs(prev => {
            const updated = prev.filter(log => log.motorcycleId !== id);
            localStorage.setItem('motoserv_guest_logs', JSON.stringify(updated));
            return updated;
          });
          showCustomAlert('Sukses', 'Sepeda motor berhasil dihapus.');
        }
      },
      undefined,
      { isDanger: true }
    );
  };

  // 10. Update Odometer handler
  const handleUpdateOdometer = async (newOdo: number) => {
    if (user) {
      // Authenticated DB Update
      try {
        const res = await fetch(`/api/motorcycles/${activeMotorcycleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentOdo: newOdo })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles(prev =>
          prev.map(m => m.id === activeMotorcycleId ? { ...m, currentOdo: newOdo } : m)
        );
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal memperbarui odometer.');
        return false;
      }
    } else {
      // Guest Local Storage Update
      setMotorcycles(prev => {
        const updated = prev.map(m => m.id === activeMotorcycleId ? { ...m, currentOdo: newOdo } : m);
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  };

  // 11. Update intervals handler
  const handleUpdateIntervals = async (newIntervals: Record<string, number>) => {
    if (user) {
      // Authenticated DB Update
      try {
        const res = await fetch('/api/intervals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motorcycleId: activeMotorcycleId,
            intervals: newIntervals
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles(prev =>
          prev.map(m => m.id === activeMotorcycleId ? { ...m, intervals: newIntervals } : m)
        );
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal memperbarui interval.');
        return false;
      }
    } else {
      // Guest Local Storage Update
      setMotorcycles(prev => {
        const updated = prev.map(m => m.id === activeMotorcycleId ? { ...m, intervals: newIntervals } : m);
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  };

  // 12. Reset intervals handler
  const handleResetIntervals = async () => {
    if (user) {
      // Authenticated DB Reset
      try {
        const res = await fetch('/api/intervals/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motorcycleId: activeMotorcycleId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles(prev =>
          prev.map(m => m.id === activeMotorcycleId ? { ...m, intervals: data.intervals } : m)
        );
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal mereset interval.');
        return false;
      }
    } else {
      // Guest Local Storage Reset
      const activeMotor = motorcycles.find(m => m.id === activeMotorcycleId);
      if (!activeMotor) return false;

      const normType = normalizeMotorType(activeMotor.type);
      const defaults = DEFAULT_INTERVALS[normType];

      setMotorcycles(prev => {
        const updated = prev.map(m => m.id === activeMotorcycleId ? { ...m, intervals: { ...defaults } } : m);
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  };

  // 13. Add Service Log handler
  const handleAddServiceLog = async (logData: {
    date: string;
    odometer: number;
    components: string[];
    cost: number;
    notes: string;
  }) => {
    if (user) {
      // Authenticated DB Save
      try {
        const res = await fetch('/api/service-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motorcycleId: activeMotorcycleId,
            ...logData
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setLogs(prev => [data, ...prev]);
        await fetchDataFromDB();
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal mencatat servis.');
        return false;
      }
    } else {
      // Guest Local Storage Save
      const activeMotor = motorcycles.find(m => m.id === activeMotorcycleId);
      if (!activeMotor) return false;

      const newLog: ServiceLog = {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        motorcycleId: activeMotorcycleId,
        date: logData.date,
        odometer: logData.odometer,
        components: logData.components,
        cost: logData.cost,
        notes: logData.notes
      };

      // Bump motorcycle current odo if service was done at a higher mileage
      const updatedOdometer = Math.max(activeMotor.currentOdo, logData.odometer);
      
      // Update lastService odo for each component selected if higher than currently stored
      const updatedLastService = { ...activeMotor.lastService };
      for (const comp of logData.components) {
        const currentLastVal = updatedLastService[comp] || 0;
        if (logData.odometer > currentLastVal) {
          updatedLastService[comp] = logData.odometer;
        }
      }

      setMotorcycles(prev => {
        const updated = prev.map(m => 
          m.id === activeMotorcycleId 
            ? { ...m, currentOdo: updatedOdometer, lastService: updatedLastService } 
            : m
        );
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });

      setLogs(prev => {
        const updated = [newLog, ...prev];
        localStorage.setItem('motoserv_guest_logs', JSON.stringify(updated));
        return updated;
      });

      return true;
    }
  };

  // 14. Delete Service Log handler
  const handleDeleteLog = (id: string) => {
    showCustomConfirm(
      'Hapus Catatan Servis',
      'Apakah Anda yakin ingin menghapus catatan servis ini? Odometer servis terakhir komponen terkait akan otomatis disesuaikan.',
      async () => {
        if (user) {
          // Authenticated DB Delete
          try {
            const res = await fetch(`/api/service-history/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setLogs(prev => prev.filter(l => l.id !== id));
            await fetchDataFromDB();
            showCustomAlert('Sukses', 'Catatan servis berhasil dihapus.');
          } catch (err: any) {
            showCustomAlert('Error', err.message || 'Gagal menghapus riwayat servis.');
          }
        } else {
          // Guest Local Storage Delete
          const logToDelete = logs.find(l => l.id === id);
          if (!logToDelete) return;

          const activeMotor = motorcycles.find(m => m.id === logToDelete.motorcycleId);
          if (!activeMotor) return;

          // Filter log out
          const remainingLogs = logs.filter(l => l.id !== id);

          // Recalculate component lastService values
          const updatedLastService = { ...activeMotor.lastService };
          for (const comp of logToDelete.components) {
            const matchingLogs = remainingLogs.filter(l => 
              l.motorcycleId === activeMotor.id && 
              l.components.includes(comp)
            );

            if (matchingLogs.length > 0) {
              matchingLogs.sort((a, b) => b.odometer - a.odometer);
              updatedLastService[comp] = matchingLogs[0].odometer;
            } else {
              updatedLastService[comp] = 0;
            }
          }

          setMotorcycles(prev => {
            const updated = prev.map(m => 
              m.id === activeMotor.id 
                ? { ...m, lastService: updatedLastService } 
                : m
            );
            localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
            return updated;
          });

          setLogs(() => {
            localStorage.setItem('motoserv_guest_logs', JSON.stringify(remainingLogs));
            return remainingLogs;
          });

          showCustomAlert('Sukses', 'Catatan servis berhasil dihapus.');
        }
      },
      undefined,
      { isDanger: true }
    );
  };

  // 15. Factory reset data handler
  const handleFactoryResetData = async () => {
    if (user) {
      // Authenticated DB Reset
      try {
        const res = await fetch('/api/auth/reset-data', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles([]);
        setActiveMotorcycleId('');
        setLogs([]);
        setActiveTab('dashboard');
        localStorage.removeItem('motoserv_active_motorcycle_id');

        showCustomAlert('Sukses', 'Seluruh data di cloud berhasil direset!');
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Gagal mereset data cloud.');
        return false;
      }
    } else {
      // Guest Local Storage Reset
      setMotorcycles([]);
      setActiveMotorcycleId('');
      setLogs([]);
      setActiveTab('dashboard');
      localStorage.removeItem('motoserv_guest_motorcycles');
      localStorage.removeItem('motoserv_guest_logs');
      localStorage.removeItem('motoserv_guest_active_motor_id');

      showCustomAlert('Sukses', 'Seluruh data local storage berhasil direset!');
      return true;
    }
  };

  // Render loading state
  if (checkingSession) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-base)', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
        <div className="spinner-small" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memeriksa sesi pengguna...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage theme={theme} onToggleTheme={toggleTheme} onStartAuth={() => setIsAuthOpen(true)} />
        {isAuthOpen && (
          <div className="modal-backdrop open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 110 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <button 
                onClick={() => setIsAuthOpen(false)} 
                style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  zIndex: 10
                }}
                aria-label="Tutup"
              >
                &times;
              </button>
              <Auth onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        )}
        <CustomDialog {...dialogConfig} />
      </>
    );
  }

  const activeMotor = motorcycles.find(m => m.id === activeMotorcycleId);

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        motorcycles={motorcycles}
        activeMotorcycleId={activeMotorcycleId}
        onSelectMotorcycle={handleSelectMotorcycle}
        onOpenAddMotorModal={() => setIsAddMotorOpen(true)}
        onOpenUpdateOdoModal={() => setIsUpdateOdoOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <DashboardTab
            activeMotor={activeMotor}
            onOpenAddMotorModal={() => setIsAddMotorOpen(true)}
            onOpenAddServiceModal={(comp) => {
              setPreselectedCompForService(comp);
              setIsAddServiceOpen(true);
            }}
          />
        )}

        {activeTab === 'riwayat' && (
          <HistoryTab
            activeMotor={activeMotor}
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onOpenAddServiceModal={() => {
              setPreselectedCompForService(undefined);
              setIsAddServiceOpen(true);
            }}
          />
        )}

        {activeTab === 'garasi' && (
          <GarageTab
            motorcycles={motorcycles}
            activeMotorcycleId={activeMotorcycleId}
            onSelectMotorcycle={handleSelectMotorcycle}
            onDeleteMotorcycle={handleDeleteMotorcycle}
            onOpenAddMotorModal={() => setIsAddMotorOpen(true)}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsTab
            activeMotor={activeMotor}
            user={user}
            onUpdateIntervals={handleUpdateIntervals}
            onResetIntervals={handleResetIntervals}
            onFactoryResetData={handleFactoryResetData}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            showAlert={showCustomAlert}
            showConfirm={showCustomConfirm}
          />
        )}

        <footer className="app-footer">
          <p>&copy; 2026 MotoServ. Dibuat oleh <a href="https://www.linkedin.com/in/amujahidakbar/" target="_blank" rel="noopener noreferrer">Mujahid Akbar</a>.</p>
        </footer>
      </main>

      {/* MODALS */}
      {isAddMotorOpen && (
        <AddAddMotorModalWrapper 
          onClose={() => setIsAddMotorOpen(false)}
          onAdd={handleAddMotorcycle}
        />
      )}

      {isUpdateOdoOpen && activeMotor && (
        <UpdateOdometerModal
          activeMotor={activeMotor}
          onClose={() => setIsUpdateOdoOpen(false)}
          onUpdate={handleUpdateOdometer}
        />
      )}

      {isAddServiceOpen && activeMotor && (
        <AddServiceModal
          activeMotor={activeMotor}
          preselectedComponent={preselectedCompForService}
          onClose={() => {
            setIsAddServiceOpen(false);
            setPreselectedCompForService(undefined);
          }}
          onAddLog={handleAddServiceLog}
        />
      )}

      {isAuthOpen && (
        <div className="modal-backdrop open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 110 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
            <button 
              onClick={() => setIsAuthOpen(false)} 
              style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: 'none', 
                color: 'var(--text-muted)', 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.25rem', 
                cursor: 'pointer', 
                zIndex: 120 
              }}
            >
              &times;
            </button>
            <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

      {/* CUSTOM DIALOG */}
      <CustomDialog {...dialogConfig} />
    </div>
  );
}

interface AddMotorcycleModalWrapperProps {
  onClose: () => void;
  onAdd: (motor: {
    name: string;
    brand: string;
    plate: string;
    type: string;
    currentOdo: number;
  }) => Promise<boolean>;
}

function AddAddMotorModalWrapper({ onClose, onAdd }: AddMotorcycleModalWrapperProps) {
  return <AddMotorcycleModal onClose={onClose} onAdd={onAdd} />;
}
