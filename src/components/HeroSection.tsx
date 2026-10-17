import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  MapPin,
  Search,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const {
    t,
    settings,
    serviceAreas,
    categories,
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    requestBrowserLocation,
    navigateTo,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [locating, setLocating] = useState(false);

  const activeAreas = serviceAreas.find(
    (a) => a.city.toLowerCase() === selectedCity.toLowerCase()
  )?.areas || [];

  const handleLocationClick = async () => {
    setLocating(true);
    await requestBrowserLocation();
    setLocating(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('workers', {
      city: selectedCity === 'All' ? '' : selectedCity,
      area: selectedArea === 'All' ? '' : selectedArea,
      categoryId: selectedCategory === 'all' ? '' : selectedCategory,
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 lg:py-24">
      {/* Background organic wave illustration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,181.3C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-xs font-semibold text-emerald-200 shadow-xs backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{t('verifiedWorkersBadge')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>{settings.currency} Transparent Pricing</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search & Location Bar */}
        <div className="mt-10 max-w-4xl mx-auto bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-stone-100 text-stone-800">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* City Selection */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                {t('selectCity')}
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedArea('All');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="All">All Enabled Cities</option>
                  {serviceAreas
                    .filter((a) => a.enabled)
                    .map((a) => (
                      <option key={a.id} value={a.city}>
                        {a.city} ({a.province})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Area or Neighbourhood */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                {t('selectArea')}
              </label>
              <div className="relative flex items-center">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="All">All Neighbourhoods</option>
                  {activeAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service Category */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                {t('allCategories')}
              </label>
              <div className="relative flex items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="all">Any Wellness Service</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="md:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleLocationClick}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Locating...' : t('useMyLocation')}</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t('searchWorkersBtn')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights beneath Search */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/80 backdrop-blur-xs">
            <ShieldCheck className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">CNIC Verified</p>
              <p className="text-[11px] text-emerald-200">Strict background review</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/80 backdrop-blur-xs">
            <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">Traditional Chatai</p>
              <p className="text-[11px] text-emerald-200">Hygienic herbal setups</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/80 backdrop-blur-xs">
            <Clock className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">Free Cancellation</p>
              <p className="text-[11px] text-emerald-200">Up to 2 hours prior</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/80 backdrop-blur-xs">
            <CheckCircle2 className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">Cash on Delivery</p>
              <p className="text-[11px] text-emerald-200">Pay safely after session</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
