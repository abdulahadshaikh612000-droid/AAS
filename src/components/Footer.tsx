import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, serviceAreas, navigateTo, setSelectedCity, lang } = useApp();

  const brandDisplayName = lang === 'ur' && settings.brandNameUrdu ? settings.brandNameUrdu : settings.brandName;

  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
    navigateTo('workers');
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Salam! I have a question regarding OilCare marketplace services.'
  )}`;

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Verified Credentials</h4>
              <p className="text-xs text-stone-400 mt-1">
                Every worker undergoes physical NADRA CNIC review and background safety vetting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="w-10 h-10 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Transparent Pricing</h4>
              <p className="text-xs text-stone-400 mt-1">
                Guaranteed PKR prices with zero hidden charges. Pay cash only upon service completion.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="w-10 h-10 rounded-lg bg-red-950 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Emergency & Safety Support</h4>
              <p className="text-xs text-stone-400 mt-1">
                Zero harassment tolerance. National helpline: <strong className="text-white">{settings.emergencyHelpline}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-200 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-2xl text-white tracking-tight">
                {brandDisplayName}
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Pakistan’s premier verified marketplace for authentic traditional oil massage (champi), restorative herbal relaxation, and certified chatai wellness. Connecting discerning households with verified practitioners.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Helpline: {settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Support: {settings.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 underline"
                >
                  Official WhatsApp Business Chat
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Service Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('workers')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Find a Verified Worker
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('safety')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Safety & Ethics Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('become-worker')}
                  className="hover:text-emerald-400 transition-colors text-amber-300 font-medium"
                >
                  Become a Service Specialist
                </button>
              </li>
            </ul>
          </div>

          {/* Service Hubs (Cities) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Active Cities</h3>
            <ul className="space-y-2 text-xs">
              {serviceAreas
                .filter((a) => a.enabled)
                .map((area) => (
                  <li key={area.id}>
                    <button
                      onClick={() => handleCityClick(area.city)}
                      className="hover:text-emerald-400 transition-colors text-left"
                    >
                      {area.city} ({area.province})
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Regulatory & Safety Disclaimers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Policies & Terms</h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => navigateTo('safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Strict Cancellation Policy (2-Hour Notice)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Zero-Tolerance Harassment Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Privacy Policy & PII Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('seo-guide')}
                  className="hover:text-emerald-400 transition-colors text-left text-stone-500"
                >
                  SEO & Search Console Guide
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 mt-4 border-t border-stone-800 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} {settings.brandName}. All rights reserved. Timezone: Asia/Karachi.
          </p>
          <p className="max-w-xl text-center md:text-right text-[11px] text-stone-500">
            Notice: All services listed are strictly professional non-medical therapeutic wellness therapies and traditional champi. No clinical curative claims are made. Workers and customers are protected by strict code of conduct.
          </p>
        </div>
      </div>
    </footer>
  );
};
