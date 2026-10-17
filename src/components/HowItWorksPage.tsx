import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Search,
  Calendar,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { navigateTo, settings } = useApp();

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Simple, Transparent & Reliable</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            How OilCare Services Works
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            From discovering verified practitioners to relaxing with traditional herbal oils on authentic chatai setups — booking wellness has never been easier.
          </p>
        </div>

        {/* 3 Step Process for Customers */}
        <div className="space-y-8">
          <h2 className="font-serif text-2xl font-bold text-stone-900 text-center">
            Booking an Appointment in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4 relative">
              <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Browse Verified Specialists
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Filter by your city (Karachi, Lahore, Sukkur, Islamabad, and more), neighbourhood, and preferred therapy (traditional mustard oil champi, full-body chatai therapy, or head & neck relief).
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4 relative">
              <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Choose Time & Appointment Type
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pick your preferred date and time slot. Decide whether you prefer a comfortable home visit in your residence or booking a private slot at the specialist’s wellness centre.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4 relative">
              <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 font-serif font-bold text-xl flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Relax & Hand Cash on Completion
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your practitioner arrives on time with clean equipment and pure oils. Once your restorative session is complete, hand the exact PKR cash payment directly to the specialist.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigateTo('workers')}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Verified Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6">
          <h2 className="font-serif text-2xl font-bold text-stone-900 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm">
                How does OilCare verify its specialists?
              </h4>
              <p className="text-stone-600 leading-relaxed">
                Each specialist must submit their valid NADRA CNIC, undergo background review, and verify physical address or certificate credentials with our regional inspection team before receiving bookings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm">
                What is the cancellation policy?
              </h4>
              <p className="text-stone-600 leading-relaxed">
                You can cancel free of charge with at least 2 hours prior notice. This protects our working specialists who travel across the city with their equipment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm">
                What oils are used during traditional champi?
              </h4>
              <p className="text-stone-600 leading-relaxed">
                Our specialists utilize pure, unadulterated cold-pressed mustard (sarson), sweet almond (badam), black seed (kalonji), and olive (zaitoon) oils infused with traditional calming herbs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm">
                What should I prepare for a home visit?
              </h4>
              <p className="text-stone-600 leading-relaxed">
                Simply provide a quiet, clean, flat floor space where a traditional reed chatai or mat can be laid, and access to clean water for the specialist to wash up before and after the session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
