import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PlatformSettings,
  Service,
  ServiceArea,
  ServiceCategory,
  User,
  WorkerProfile,
} from '../types/index.ts';
import { Language, translations } from '../utils/translations.ts';

export type AppView =
  | 'home'
  | 'services'
  | 'workers'
  | 'worker-detail'
  | 'how-it-works'
  | 'safety'
  | 'become-worker'
  | 'contact'
  | 'customer-dashboard'
  | 'worker-dashboard'
  | 'admin-dashboard'
  | 'seo-guide';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface BookingModalData {
  isOpen: boolean;
  serviceId?: string;
  workerId?: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  workerProfile: WorkerProfile | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;

  settings: PlatformSettings;
  refreshSettings: () => Promise<void>;
  updateSettings: (data: Partial<PlatformSettings>) => Promise<boolean>;

  services: Service[];
  categories: ServiceCategory[];
  serviceAreas: ServiceArea[];
  refreshData: () => Promise<void>;

  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;

  currentView: AppView;
  viewParams: Record<string, string>;
  navigateTo: (view: AppView, params?: Record<string, string>) => void;

  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  requestBrowserLocation: () => Promise<{ success: boolean; message: string }>;

  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  bookingModal: BookingModalData;
  openBookingModal: (serviceId?: string, workerId?: string) => void;
  closeBookingModal: () => void;

  authModalOpen: boolean;
  openAuthModal: (initialRole?: 'customer' | 'worker') => void;
  closeAuthModal: () => void;
  authModalRole: 'customer' | 'worker';
}

const defaultSettings: PlatformSettings = {
  brandName: 'OilCare Services',
  brandNameUrdu: 'آئل کیئر سروسز',
  tagLine: 'Book Trusted Massage & Wellness Services Near You',
  logoUrl: '',
  currency: 'PKR',
  contactPhone: '+92 300 1234567',
  whatsappNumber: '923001234567',
  supportEmail: 'support@oilcare.pk',
  platformCommissionPercentage: 10,
  enableCashPayment: true,
  enableUrduLanguage: true,
  emergencyHelpline: '15 (Police) / 1122 (Rescue)',
  freeCancellationWindowHours: 2,
  safetyGuidelinesText:
    'All appointments strictly observe personal boundaries, professional code of conduct, and clear customer consent.',
  homeVisitPolicyText:
    'Please ensure a safe, quiet, well-ventilated room with access to clean water for traditional chatai setup.',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('oilcare_token'));
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);

  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);

  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('oilcare_lang') as Language) || 'en';
  });

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewParams, setViewParams] = useState<Record<string, string>>({});

  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [bookingModal, setBookingModal] = useState<BookingModalData>({ isOpen: false });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'worker'>('customer');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('oilcare_lang', newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  const navigateTo = (view: AppView, params: Record<string, string> = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL query without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('page', view);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    window.history.pushState({}, '', url.toString());
  };

  // Sync initial URL on load and back button
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const page = (url.searchParams.get('page') as AppView) || 'home';
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        if (k !== 'page') params[k] = v;
      });
      setCurrentView(page);
      setViewParams(params);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch settings & metadata
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const refreshData = async () => {
    try {
      const [srvRes, catRes, areaRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/categories'),
        fetch('/api/service-areas'),
      ]);
      if (srvRes.ok) setServices(await srvRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (areaRes.ok) setServiceAreas(await areaRes.json());
    } catch (err) {
      console.error('Error loading platform catalogue:', err);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWorkerProfile(data.workerProfile || null);
      } else {
        // Token invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshData();
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setUser(null);
      setWorkerProfile(null);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setToken(data.token);
      setUser(data.user);
      setWorkerProfile(data.workerProfile || null);
      localStorage.setItem('oilcare_token', data.token);
      setAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (payload: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setToken(data.token);
      setUser(data.user);
      setWorkerProfile(data.workerProfile || null);
      localStorage.setItem('oilcare_token', data.token);
      setAuthModalOpen(false);

      if (data.user.role === 'worker') {
        showToast(
          'Registration submitted! Your profile is pending administrative verification.',
          'info'
        );
        navigateTo('worker-dashboard');
      } else {
        showToast(`Account created successfully! Welcome, ${data.user.fullName}.`, 'success');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
    localStorage.removeItem('oilcare_token');
    showToast('Signed out successfully.', 'info');
    navigateTo('home');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        showToast('Profile updated.', 'success');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const updateSettings = async (data: Partial<PlatformSettings>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setSettings(result.settings);
        showToast('Business settings saved.', 'success');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const requestBrowserLocation = async (): Promise<{ success: boolean; message: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: 'Geolocation is not supported by your browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Approximate closest Pakistan city based on coordinates
          // Sukkur: ~27.7, 68.8 | Karachi: ~24.8, 67.0 | Lahore: ~31.5, 74.3 | Islamabad: ~33.7, 73.0
          let closestCity = 'Karachi';
          let closestDist = Infinity;

          const cityCoords: Record<string, [number, number]> = {
            Sukkur: [27.7052, 68.8574],
            Karachi: [24.8607, 67.0011],
            Lahore: [31.5204, 74.3587],
            Islamabad: [33.6844, 73.0479],
            Rawalpindi: [33.5651, 73.0169],
            Multan: [30.1575, 71.5249],
            Faisalabad: [31.4504, 73.135],
          };

          for (const [cityName, [lat, lng]] of Object.entries(cityCoords)) {
            const dist = Math.hypot(lat - latitude, lng - longitude);
            if (dist < closestDist) {
              closestDist = dist;
              closestCity = cityName;
            }
          }

          setSelectedCity(closestCity);
          showToast(`Location detected: Set city to ${closestCity}`, 'success');
          resolve({ success: true, message: `Detected nearest service hub: ${closestCity}` });
        },
        (error) => {
          resolve({
            success: false,
            message:
              error.code === error.PERMISSION_DENIED
                ? 'Location permission denied. Please select your city manually.'
                : 'Unable to retrieve location.',
          });
        },
        { timeout: 8000 }
      );
    });
  };

  const openBookingModal = (serviceId?: string, workerId?: string) => {
    if (!user) {
      showToast('Please sign in or create an account to book an appointment.', 'info');
      setAuthModalRole('customer');
      setAuthModalOpen(true);
      return;
    }
    setBookingModal({ isOpen: true, serviceId, workerId });
  };

  const closeBookingModal = () => {
    setBookingModal({ isOpen: false });
  };

  const openAuthModal = (initialRole: 'customer' | 'worker' = 'customer') => {
    setAuthModalRole(initialRole);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        workerProfile,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUser,
        settings,
        refreshSettings,
        updateSettings,
        services,
        categories,
        serviceAreas,
        refreshData,
        lang,
        setLang,
        t,
        currentView,
        viewParams,
        navigateTo,
        selectedCity,
        setSelectedCity,
        selectedArea,
        setSelectedArea,
        requestBrowserLocation,
        toasts,
        showToast,
        removeToast,
        bookingModal,
        openBookingModal,
        closeBookingModal,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
