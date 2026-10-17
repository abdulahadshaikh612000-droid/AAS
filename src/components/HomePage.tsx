import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { HeroSection } from './HeroSection.tsx';
import { ServiceCatalog } from './ServiceCatalog.tsx';
import { WorkerProfile, Review } from '../types/index.ts';
import {
  Star,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  DollarSign,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, navigateTo, openBookingModal, lang, t } = useApp();

  const [featuredWorkers, setFeaturedWorkers] = useState<WorkerProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    // Fetch verified workers
    fetch('/api/workers')
      .then((r) => r.json())
      .then((data) => setFeaturedWorkers(data.slice(0, 4)))
      .catch((err) => console.error(err));

    // Fetch sample worker to retrieve genuine reviews
    fetch('/api/workers/wp_2')
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch((err) => console.error(err));
  }, []);

  const faqs = [
    {
      q: 'What is traditional oil champi and chatai massage?',
      a: 'Traditional champi is an authentic South Asian therapeutic scalp, neck, and body massage using warm, cold-pressed natural oils (such as mustard, sweet almond, or olive oil). Authentic chatai services are performed on a clean, hygienic woven reed mat providing grounded firm support for muscle relaxation and stretching.',
    },
    {
      q: 'Are workers verified before visiting homes?',
      a: 'Yes, 100%. Every worker on our platform undergoes government NADRA CNIC identity verification, physical inspection of credentials, and must abide by our strict zero-harassment and professional conduct code.',
    },
    {
      q: 'How does payment work?',
      a: 'We operate primarily on cash payment upon service completion. The price you see during booking in PKR is fixed and guaranteed. You hand the exact cash amount directly to the specialist after your session.',
    },
    {
      q: 'Can I cancel or reschedule if my plans change?',
      a: 'Yes. You can cancel your appointment free of penalty at any time up to 2 hours before the scheduled appointment time directly from your customer dashboard.',
    },
    {
      q: 'Are these medical treatments?',
      a: 'No. All services offered on our platform are non-clinical, therapeutic relaxation and wellness therapies. If you suffer from acute spinal disc herniation, fractures, or clinical conditions, please consult a licensed medical doctor.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Service Catalogue Section */}
      <ServiceCatalog limit={6} showHeading={true} />

      {/* 3. Featured Verified Workers Section */}
      <section className="py-16 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>CNIC & Background Checked</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {t('featuredWorkers')}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
                {t('featuredWorkersSub')}
              </p>
            </div>

            <button
              onClick={() => navigateTo('workers')}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline shrink-0"
            >
              <span>View All Specialists ({featuredWorkers.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-stone-50/60 rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative mb-4">
                    <img
                      src={worker.profilePhoto}
                      alt={worker.displayName}
                      className="w-full h-44 rounded-xl object-cover border border-stone-200 group-hover:scale-102 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-emerald-950/80 text-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{worker.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-serif font-bold text-base text-stone-900 truncate">
                      {worker.displayName}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      {worker.city}
                    </span>
                    <span>•</span>
                    <span>{worker.experienceYears} Years Exp</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {worker.bio}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => navigateTo('worker-detail', { id: worker.id })}
                    className="text-xs font-bold text-stone-700 hover:text-emerald-900"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => openBookingModal(undefined, worker.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-16 bg-stone-50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Effortless Process</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t('howBookingWorks')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative">
              <span className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">{t('step1Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative">
              <span className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">{t('step2Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3 relative">
              <span className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">{t('step3Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Our Platform Section */}
      <section className="py-16 bg-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t('whyChooseUs')}
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Upholding traditional healing traditions with contemporary security and dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-emerald-900/60 border border-emerald-800 space-y-3">
              <ShieldCheck className="w-8 h-8 text-amber-300" />
              <h3 className="font-serif font-bold text-lg text-white">{t('why1Title')}</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">{t('why1Desc')}</p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-900/60 border border-emerald-800 space-y-3">
              <HeartHandshake className="w-8 h-8 text-amber-300" />
              <h3 className="font-serif font-bold text-lg text-white">{t('why2Title')}</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">{t('why2Desc')}</p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-900/60 border border-emerald-800 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-300" />
              <h3 className="font-serif font-bold text-lg text-white">{t('why3Title')}</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">{t('why3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews from completed bookings only */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Verified Experiences</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {t('realCustomerReviews')}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{t('realCustomerReviewsSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-stone-50 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold text-xs flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-stone-900">{rev.customerName}</p>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-sm font-semibold">
                        Verified Booking #{rev.bookingReference}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-400 flex justify-between">
                  <span>{rev.serviceName}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      <section className="py-16 bg-stone-50 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              {t('faqTitle')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-stone-900 hover:text-emerald-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Become a Worker Banner CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-900 to-amber-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            {t('becomeWorkerTitle')}
          </h2>
          <p className="text-sm sm:text-base text-amber-100 max-w-2xl mx-auto">
            {t('becomeWorkerSub')}
          </p>
          <div>
            <button
              onClick={() => navigateTo('become-worker')}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t('registerAsWorkerBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
