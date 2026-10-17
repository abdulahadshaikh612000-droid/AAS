import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Service } from '../types/index.ts';
import { Clock, MapPin, Sparkles, Check, Home, Building2, ShieldAlert } from 'lucide-react';

export const ServiceCatalog: React.FC<{ limit?: number; showHeading?: boolean }> = ({
  limit,
  showHeading = true,
}) => {
  const { services, categories, settings, openBookingModal, navigateTo, lang, t } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredServices = services
    .filter((s) => s.active)
    .filter((s) => (activeCategory === 'all' ? true : s.categoryId === activeCategory))
    .slice(0, limit || services.length);

  return (
    <section className="py-16 bg-stone-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Traditional & Wellness Catalogue</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t('featuredServices')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600">
              {t('featuredServicesSub')}
            </p>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Services ({services.filter((s) => s.active).length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {lang === 'ur' && c.nameUrdu ? c.nameUrdu : c.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const cat = categories.find((c) => c.id === service.categoryId);
            const title = lang === 'ur' && service.nameUrdu ? service.nameUrdu : service.name;
            const desc =
              lang === 'ur' && service.descriptionUrdu
                ? service.descriptionUrdu
                : service.description;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-52 overflow-hidden bg-stone-100">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {cat && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-amber-200 backdrop-blur-xs">
                      {cat.name}
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      {service.durationMinutes} {t('minutes')}
                    </span>
                    <div className="flex items-center gap-1">
                      {service.homeVisitAllowed && (
                        <span
                          className="p-1 rounded-md bg-emerald-900/80 text-emerald-200"
                          title="Home visits available"
                        >
                          <Home className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {service.serviceCentreAllowed && (
                        <span
                          className="p-1 rounded-md bg-stone-900/80 text-stone-200"
                          title="Service centre available"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>

                    {/* Boundaries disclaimer */}
                    {service.boundariesNotice && (
                      <p className="mt-3 text-[11px] text-stone-500 italic flex items-start gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>{service.boundariesNotice}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block uppercase font-medium">
                        {t('startingFrom')}
                      </span>
                      <span className="text-xl font-bold text-emerald-950 font-serif">
                        {settings.currency} {service.basePrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('workers', { serviceId: service.id })}
                        className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-emerald-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                        title="View workers providing this service"
                      >
                        Specialists
                      </button>

                      <button
                        onClick={() => openBookingModal(service.id)}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        {t('bookNow')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
