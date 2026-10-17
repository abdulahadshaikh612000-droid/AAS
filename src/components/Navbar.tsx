import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Sparkles,
  Menu,
  X,
  Phone,
  MessageCircle,
  User as UserIcon,
  Shield,
  Calendar,
  LogOut,
  ChevronDown,
  Globe,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    user,
    workerProfile,
    logout,
    lang,
    setLang,
    t,
    currentView,
    navigateTo,
    openAuthModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const brandDisplayName = lang === 'ur' && settings.brandNameUrdu ? settings.brandNameUrdu : settings.brandName;

  const handleNavClick = (view: any, params?: any) => {
    navigateTo(view, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Salam! I would like to inquire about booking a traditional oil massage service with OilCare.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-900 text-amber-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-emerald-950 tracking-tight block leading-tight">
                {brandDisplayName}
              </span>
              <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-700 block">
                {lang === 'ur' ? 'روایتی مالش اور چٹائی سروسز' : 'Traditional Oil & Chatai Care'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'home'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'services'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navServices')}
            </button>
            <button
              onClick={() => handleNavClick('workers')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'workers'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navWorkers')}
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'how-it-works'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navHowItWorks')}
            </button>
            <button
              onClick={() => handleNavClick('safety')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'safety'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navSafety')}
            </button>
            <button
              onClick={() => handleNavClick('become-worker')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors text-amber-800 hover:text-amber-900 hover:bg-amber-50 ${
                currentView === 'become-worker' ? 'bg-amber-100/70 font-semibold' : ''
              }`}
            >
              {t('navBecomeWorker')}
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'contact'
                  ? 'text-emerald-900 bg-emerald-50/80 font-semibold'
                  : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              {t('navContact')}
            </button>
          </nav>

          {/* Right Controls: Language, WhatsApp, Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-stone-300 text-stone-700 hover:border-emerald-700 hover:text-emerald-800 bg-stone-50 transition-colors cursor-pointer"
              title="Toggle English / Urdu"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'Urdu' : 'English'}</span>
            </button>

            {/* WhatsApp Quick Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 transition-colors"
              title="Official WhatsApp Inquiries"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
              <span>{settings.contactPhone}</span>
            </a>

            {/* Auth Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 text-stone-800 text-sm font-medium transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-100 flex items-center justify-center text-xs font-bold uppercase">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm bg-emerald-100 text-emerald-800">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'customer' && (
                      <button
                        onClick={() => handleNavClick('customer-dashboard')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 text-left"
                      >
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        <span>{t('navMyBookings')}</span>
                      </button>
                    )}

                    {user.role === 'worker' && (
                      <button
                        onClick={() => handleNavClick('worker-dashboard')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 text-left"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-700" />
                        <span>{t('navWorkerDashboard')}</span>
                        {workerProfile?.verificationStatus === 'pending' && (
                          <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                            Pending
                          </span>
                        )}
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin-dashboard')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 text-left"
                      >
                        <Shield className="w-4 h-4 text-emerald-700" />
                        <span>{t('navAdminDashboard')}</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navLogout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('customer')}
                  className="px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-emerald-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => openAuthModal('customer')}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              className="px-2 py-1 text-xs font-semibold rounded-md border border-stone-300 text-stone-700"
            >
              {lang === 'en' ? 'Urdu' : 'English'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navServices')}
          </button>
          <button
            onClick={() => handleNavClick('workers')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navWorkers')}
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navHowItWorks')}
          </button>
          <button
            onClick={() => handleNavClick('safety')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navSafety')}
          </button>
          <button
            onClick={() => handleNavClick('become-worker')}
            className="w-full text-left px-3 py-2 text-base font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg"
          >
            {t('navBecomeWorker')}
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="w-full text-left px-3 py-2 text-base font-medium text-stone-800 hover:bg-emerald-50 rounded-lg"
          >
            {t('navContact')}
          </button>

          <div className="pt-3 border-t border-stone-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-bold text-stone-900">{user.fullName}</p>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
                {user.role === 'customer' && (
                  <button
                    onClick={() => handleNavClick('customer-dashboard')}
                    className="w-full text-left px-3 py-2 text-emerald-800 font-medium bg-emerald-50 rounded-lg"
                  >
                    {t('navMyBookings')}
                  </button>
                )}
                {user.role === 'worker' && (
                  <button
                    onClick={() => handleNavClick('worker-dashboard')}
                    className="w-full text-left px-3 py-2 text-emerald-800 font-medium bg-emerald-50 rounded-lg"
                  >
                    {t('navWorkerDashboard')}
                  </button>
                )}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin-dashboard')}
                    className="w-full text-left px-3 py-2 text-emerald-800 font-medium bg-emerald-50 rounded-lg"
                  >
                    {t('navAdminDashboard')}
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                >
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('customer');
                  }}
                  className="w-full py-2.5 text-center font-semibold rounded-lg bg-emerald-800 text-white"
                >
                  {t('navLogin')} / {t('navRegister')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
