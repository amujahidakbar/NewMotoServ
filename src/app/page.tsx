'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Auth from '@/components/Auth';
import LandingPage from '@/components/LandingPage';
import Sidebar from '@/components/Sidebar';
import DashboardTab from '@/components/DashboardTab';
import HistoryTab from '@/components/HistoryTab';
import GarageTab from '@/components/GarageTab';
import SettingsTab from '@/components/SettingsTab';
import FuelTab from '@/components/FuelTab';
import AddFuelModal from '@/components/AddFuelModal';
import AddMotorcycleModal from '@/components/AddMotorcycleModal';
import UpdateOdometerModal from '@/components/UpdateOdometerModal';
import AddServiceModal from '@/components/AddServiceModal';
import AddCustomComponentModal from '@/components/AddCustomComponentModal';
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

interface FuelLog {
  id: string;
  motorcycleId: string;
  date: string;
  odometer: number;
  liters: number;
  price: number;
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
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null);

  // Modals state
  const [isAddMotorOpen, setIsAddMotorOpen] = useState(false);
  const [isUpdateOdoOpen, setIsUpdateOdoOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [preselectedCompForService, setPreselectedCompForService] = useState<string | undefined>(undefined);
  const [isAddCustomCompOpen, setIsAddCustomCompOpen] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

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

      const resFuel = await fetch('/api/fuel-logs');
      if (resFuel.ok) {
        const fuelData = await resFuel.json();
        setFuelLogs(fuelData);
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
        const cachedFuel = localStorage.getItem('motoserv_guest_fuel_logs');
        const fuelData = cachedFuel ? JSON.parse(cachedFuel) : [];
        
        setMotorcycles(motors);
        setLogs(serviceLogs);
        setFuelLogs(fuelData);
        
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
    setFuelLogs([]);
    setActiveMotorcycleId('');
    localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify([]));
    localStorage.setItem('motoserv_guest_logs', JSON.stringify([]));
    localStorage.setItem('motoserv_guest_fuel_logs', JSON.stringify([]));
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

  // 3d. Read language configuration on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('motoserv_lang') as 'en' | 'id';
    if (savedLang) {
      setLang(savedLang);
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

  // 3c. Read notification subscription state on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsPushEnabled(true);
    }
  }, []);

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
            showCustomAlert('Sync Success', 'Your local data has been successfully synchronized to the cloud database.');
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
      lang === 'en' ? 'Confirm Logout' : 'Konfirmasi Keluar',
      lang === 'en'
        ? 'Are you sure you want to log out of your account? Your cloud data will remain secure.'
        : 'Apakah Anda yakin ingin keluar dari akun Anda? Seluruh data yang tersimpan di cloud tetap aman.',
      async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
          showCustomAlert(
            lang === 'en' ? 'Logged Out' : 'Sesi Berakhir',
            lang === 'en' ? 'You have been successfully logged out.' : 'Anda telah berhasil keluar.'
          );
        } catch (err) {
          console.error('Logout error:', err);
        }
      },
      undefined,
      {
        confirmText: lang === 'en' ? 'Log Out' : 'Keluar',
        cancelText: lang === 'en' ? 'Cancel' : 'Batal',
        isDanger: true
      }
    );
  };

  // 6a. Theme toggler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('motoserv_theme', newTheme);
  };

  // 6b. Language toggler
  const toggleLang = () => {
    const newLang = lang === 'en' ? 'id' : 'en';
    setLang(newLang);
    localStorage.setItem('motoserv_lang', newLang);
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
        showCustomAlert('Error', err.message || 'Failed to add motorcycle.');
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
      'Delete Motorcycle',
      `Are you sure you want to delete the motorcycle "${motor.name}"? All custom intervals and service history will be permanently deleted.`,
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
            showCustomAlert('Success', 'Motorcycle successfully deleted.');
          } catch (err: any) {
            showCustomAlert('Error', err.message || 'Failed to delete motorcycle.');
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
          showCustomAlert('Success', 'Motorcycle successfully deleted.');
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
        showCustomAlert('Error', err.message || 'Failed to update odometer.');
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

  // 10.b Add custom component handler
  const handleAddCustomComponent = async (componentName: string, intervalKm: number, lastServiceKm: number) => {
    if (user) {
      try {
        const res = await fetch('/api/intervals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            motorcycleId: activeMotorcycleId,
            componentName,
            intervalKm,
            lastServiceKm
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMotorcycles(prev =>
          prev.map(m => {
            if (m.id === activeMotorcycleId) {
              return {
                ...m,
                intervals: {
                  ...m.intervals,
                  [componentName]: intervalKm
                },
                lastService: {
                  ...m.lastService,
                  [componentName]: lastServiceKm
                }
              };
            }
            return m;
          })
        );
        showCustomAlert('Success', 'New component successfully added!');
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Failed to add new component.');
        return false;
      }
    } else {
      // Guest local storage update
      setMotorcycles(prev => {
        const updated = prev.map(m => {
          if (m.id === activeMotorcycleId) {
            return {
              ...m,
              intervals: {
                ...m.intervals,
                [componentName]: intervalKm
              },
              lastService: {
                ...m.lastService,
                [componentName]: lastServiceKm
              }
            };
          }
          return m;
        });
        localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updated));
        return updated;
      });
      showCustomAlert('Success', 'New component successfully added locally!');
      return true;
    }
  };

  // 10.c Subscribe push notifications handler
  const handleSubscribeNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      showCustomAlert('Info', 'Your browser or device does not support push notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showCustomAlert('Failed', 'Notification permission was denied.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        showCustomAlert('Error', 'VAPID keys are not configured.');
        return;
      }

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      const subJson = subscription.toJSON();
      
      if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
        throw new Error('Invalid subscription format.');
      }

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys.p256dh,
              auth: subJson.keys.auth
            }
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showCustomAlert('Success', 'Push notifications successfully enabled!');
      setIsPushEnabled(true);
    } catch (err: any) {
      console.error(err);
      showCustomAlert('Error', err.message || 'Failed to enable push notifications.');
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
        showCustomAlert('Error', err.message || 'Failed to reset intervals.');
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
        showCustomAlert('Error', err.message || 'Failed to record service.');
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
      'Delete Service Log',
      'Are you sure you want to delete this service log? The last service odometer for the affected components will automatically revert.',
      async () => {
        if (user) {
          // Authenticated DB Delete
          try {
            const res = await fetch(`/api/service-history/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setLogs(prev => prev.filter(l => l.id !== id));
            await fetchDataFromDB();
            showCustomAlert('Success', 'Service log successfully deleted.');
          } catch (err: any) {
            showCustomAlert('Error', err.message || 'Failed to delete service history.');
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

          showCustomAlert('Success', 'Service log successfully deleted.');
        }
      },
      undefined,
      { isDanger: true }
    );
  };

  // 14a. Add/Edit fuel log handler
  const handleAddFuelLog = async (fuelData: {
    date: string;
    odometer: number;
    liters: number;
    price: number;
  }) => {
    try {
      if (editingFuelLog) {
        // EDIT MODE
        if (user) {
          // Logged in: Sync with API (PUT)
          const res = await fetch(`/api/fuel-logs/${editingFuelLog.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fuelData)
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to update fuel log.');
          }

          await fetchDataFromDB();
          setEditingFuelLog(null);
          return true;
        } else {
          // Guest user: Save to local storage
          const updatedLogs = fuelLogs.map(log => {
            if (log.id === editingFuelLog.id) {
              return { ...log, ...fuelData };
            }
            return log;
          });
          setFuelLogs(updatedLogs);
          localStorage.setItem('motoserv_guest_fuel_logs', JSON.stringify(updatedLogs));

          // Automatically update the motorcycle's current odometer if the fuel log's odo is higher
          const updatedMotors = motorcycles.map(m => {
            if (m.id === activeMotorcycleId && fuelData.odometer > m.currentOdo) {
              return { ...m, currentOdo: fuelData.odometer };
            }
            return m;
          });

          setMotorcycles(updatedMotors);
          localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updatedMotors));
          setEditingFuelLog(null);
          return true;
        }
      } else {
        // ADD MODE
        if (user) {
          const res = await fetch('/api/fuel-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              motorcycleId: activeMotorcycleId,
              ...fuelData
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save fuel log.');
          }

          await fetchDataFromDB();
          return true;
        } else {
          const newLog: FuelLog = {
            id: 'fuel_' + Math.random().toString(36).substring(2, 9),
            motorcycleId: activeMotorcycleId,
            ...fuelData
          };

          const updatedLogs = [newLog, ...fuelLogs];
          setFuelLogs(updatedLogs);
          localStorage.setItem('motoserv_guest_fuel_logs', JSON.stringify(updatedLogs));

          const updatedMotors = motorcycles.map(m => {
            if (m.id === activeMotorcycleId && fuelData.odometer > m.currentOdo) {
              return { ...m, currentOdo: fuelData.odometer };
            }
            return m;
          });

          setMotorcycles(updatedMotors);
          localStorage.setItem('motoserv_guest_motorcycles', JSON.stringify(updatedMotors));
          return true;
        }
      }
    } catch (err: any) {
      console.error('Save fuel log error:', err);
      showCustomAlert('Error', err.message || 'Failed to save fuel log.');
      return false;
    }
  };

  // 14b. Delete fuel log handler
  const handleDeleteFuelLog = async (id: string) => {
    try {
      if (user) {
        const res = await fetch(`/api/fuel-logs/${id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete fuel log.');
        }

        await fetchDataFromDB();
        return true;
      } else {
        const updatedLogs = fuelLogs.filter(log => log.id !== id);
        setFuelLogs(updatedLogs);
        localStorage.setItem('motoserv_guest_fuel_logs', JSON.stringify(updatedLogs));
        return true;
      }
    } catch (err: any) {
      console.error('Delete fuel log error:', err);
      showCustomAlert('Error', err.message || 'Failed to delete fuel log.');
      return false;
    }
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

        showCustomAlert('Success', 'All cloud data has been successfully reset!');
        return true;
      } catch (err: any) {
        showCustomAlert('Error', err.message || 'Failed to reset cloud data.');
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

      showCustomAlert('Success', 'All local storage data has been successfully reset!');
      return true;
    }
  };

  // Render loading state
  if (checkingSession) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-base)', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
        <div className="spinner-small" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verifying session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage
          theme={theme}
          onToggleTheme={toggleTheme}
          lang={lang}
          onToggleLang={toggleLang}
          onStartAuth={() => setIsAuthOpen(true)}
        />
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
                aria-label={lang === 'en' ? 'Close' : 'Tutup'}
              >
                &times;
              </button>
              <Auth onAuthSuccess={handleAuthSuccess} lang={lang} />
            </div>
          </div>
        )}
        <CustomDialog {...dialogConfig} lang={lang} />
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
        lang={lang}
        onToggleLang={toggleLang}
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
            lang={lang}
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
            lang={lang}
          />
        )}

        {activeTab === 'garasi' && (
          <GarageTab
            motorcycles={motorcycles}
            activeMotorcycleId={activeMotorcycleId}
            onSelectMotorcycle={handleSelectMotorcycle}
            onDeleteMotorcycle={handleDeleteMotorcycle}
            onOpenAddMotorModal={() => setIsAddMotorOpen(true)}
            lang={lang}
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
            onOpenAddCustomComponentModal={() => setIsAddCustomCompOpen(true)}
            isPushEnabled={isPushEnabled}
            onSubscribeNotifications={handleSubscribeNotifications}
            showAlert={showCustomAlert}
            showConfirm={showCustomConfirm}
            lang={lang}
          />
        )}

        {activeTab === 'bbm' && (
          <FuelTab
            activeMotor={activeMotor}
            fuelLogs={fuelLogs}
            onOpenAddFuelModal={() => setIsAddFuelOpen(true)}
            onOpenEditFuelModal={(log) => {
              setEditingFuelLog(log);
              setIsAddFuelOpen(true);
            }}
            onDeleteFuelLog={handleDeleteFuelLog}
            showConfirm={showCustomConfirm}
            lang={lang}
          />
        )}

        <footer className="app-footer">
          <p>&copy; 2026 MotoServ. {lang === 'en' ? 'Developed by' : 'Dibuat oleh'} <a href="https://www.linkedin.com/in/amujahidakbar/" target="_blank" rel="noopener noreferrer">Mujahid Akbar</a>.</p>
        </footer>
      </main>

      {/* MODALS */}
      {isAddMotorOpen && (
        <AddAddMotorModalWrapper 
          onClose={() => setIsAddMotorOpen(false)}
          onAdd={handleAddMotorcycle}
          lang={lang}
        />
      )}

      {isUpdateOdoOpen && activeMotor && (
        <UpdateOdometerModal
          activeMotor={activeMotor}
          onClose={() => setIsUpdateOdoOpen(false)}
          onUpdate={handleUpdateOdometer}
          lang={lang}
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
          lang={lang}
        />
      )}

      {isAddFuelOpen && activeMotor && (
        <AddFuelModal
          activeMotor={activeMotor}
          editingLog={editingFuelLog}
          onClose={() => {
            setIsAddFuelOpen(false);
            setEditingFuelLog(null);
          }}
          onAdd={handleAddFuelLog}
          lang={lang}
        />
      )}

      {isAddCustomCompOpen && activeMotor && (
        <AddCustomComponentModal
          activeMotor={activeMotor}
          onClose={() => setIsAddCustomCompOpen(false)}
          onAdd={handleAddCustomComponent}
          lang={lang}
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
            <Auth onAuthSuccess={handleAuthSuccess} lang={lang} />
          </div>
        </div>
      )}

      {/* MOBILE FLOAT ACTION BUTTON (FAB) */}
      {activeMotor && (
        <div className="mobile-fab-container">
          {/* Floating Speed-Dial Menu Actions */}
          {isFabOpen && (
            <>
              <div className="mobile-fab-backdrop" onClick={() => setIsFabOpen(false)} />
              <div className="mobile-fab-actions">
                <button 
                  className="mobile-fab-action-item" 
                  onClick={() => { setIsFabOpen(false); setIsUpdateOdoOpen(true); }}
                  aria-label="Update Odometer"
                >
                  <span className="mobile-fab-action-label">Update Odo</span>
                  <div className="mobile-fab-action-icon" style={{ backgroundColor: 'var(--color-primary-dark)', color: 'var(--bg-base)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                  </div>
                </button>

                <button 
                  className="mobile-fab-action-item" 
                  onClick={() => { setIsFabOpen(false); setPreselectedCompForService(undefined); setIsAddServiceOpen(true); }}
                  aria-label="Record Service"
                >
                  <span className="mobile-fab-action-label">Record Service</span>
                  <div className="mobile-fab-action-icon" style={{ backgroundColor: 'var(--color-success)', color: 'var(--bg-base)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                  </div>
                </button>

                <button 
                  className="mobile-fab-action-item" 
                  onClick={() => { setIsFabOpen(false); setIsAddFuelOpen(true); }}
                  aria-label="Record Fuel"
                >
                  <span className="mobile-fab-action-label">Record Fuel</span>
                  <div className="mobile-fab-action-icon" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--bg-base)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/>
                    </svg>
                  </div>
                </button>

                <button 
                  className="mobile-fab-action-item" 
                  onClick={() => { setIsFabOpen(false); setIsAddMotorOpen(true); }}
                  aria-label="Add Motorcycle"
                >
                  <span className="mobile-fab-action-label">Add Motorcycle</span>
                  <div className="mobile-fab-action-icon" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-base)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="18" r="3"/>
                      <path d="M6 18h4l2-5h6l3 5"/>
                    </svg>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Main Trigger Button */}
          <button 
            className={`mobile-fab-trigger ${isFabOpen ? 'open' : ''}`} 
            onClick={() => setIsFabOpen(!isFabOpen)}
            aria-label="Quick Actions"
            aria-expanded={isFabOpen}
            style={{ color: 'var(--bg-base)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fab-plus-icon">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      )}

      {/* CUSTOM DIALOG */}
      <CustomDialog {...dialogConfig} lang={lang} />
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
  lang: 'en' | 'id';
}

function AddAddMotorModalWrapper({ onClose, onAdd, lang }: AddMotorcycleModalWrapperProps) {
  return <AddMotorcycleModal onClose={onClose} onAdd={onAdd} lang={lang} />;//;
}
