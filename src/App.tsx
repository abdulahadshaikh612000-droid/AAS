import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './components/HomePage.tsx';
import { ServiceCatalog } from './components/ServiceCatalog.tsx';
import { WorkerDiscovery } from './components/WorkerDiscovery.tsx';
import { WorkerDetail } from './components/WorkerDetail.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { WorkerDashboard } from './components/WorkerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { BecomeWorkerPage } from './components/BecomeWorkerPage.tsx';
import { SafetyPage } from './components/SafetyPage.tsx';
import { HowItWorksPage } from './components/HowItWorksPage.tsx';
import { ContactPage } from './components/ContactPage.tsx';
import { SeoGuidePage } from './components/SeoGuidePage.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { currentView, toasts, removeToast } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'services':
        return (
          <div className="py-12 bg-stone-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ServiceCatalog showHeading={true} />
            </div>
          </div>
        );
      case 'workers':
        return <WorkerDiscovery />;
      case 'worker-detail':
        return <WorkerDetail />;
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'worker-dashboard':
        return <WorkerDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'become-worker':
        return <BecomeWorkerPage />;
      case 'safety':
        return <SafetyPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'contact':
        return <ContactPage />;
      case 'seo-guide':
        return <SeoGuidePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-900 selection:text-amber-200">
      <Navbar />

      {/* Global Toasts */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-right text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-white border-emerald-800'
                : toast.type === 'error'
                ? 'bg-red-950 text-white border-red-800'
                : 'bg-stone-900 text-white border-stone-800'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <main className="flex-1">{renderView()}</main>

      <Footer />

      {/* Global Modals */}
      <BookingModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
