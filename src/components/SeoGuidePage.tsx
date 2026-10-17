import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Globe, Search, CheckCircle2, ArrowRight, ExternalLink, Code } from 'lucide-react';

export const SeoGuidePage: React.FC = () => {
  const { settings, serviceAreas, services } = useApp();

  const sampleSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.brandName,
    description: settings.tagLine,
    url: window.location.origin,
    telephone: settings.contactPhone,
    priceRange: 'PKR 1500 - 4500',
    areaServed: serviceAreas.filter((a) => a.enabled).map((a) => a.city),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Traditional Massage & Chatai Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.description,
        },
        price: s.basePrice,
        priceCurrency: 'PKR',
      })),
    },
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>Search Engine Optimization & Indexing Guide</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Google Search Console & Google Business Profile Setup
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
            Step-by-step technical instructions for platform administrators to claim domain ownership, submit the XML sitemap, and verify Google Business Profiles for active cities.
          </p>
        </div>

        {/* Live Technical Assets */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            Active Platform SEO Assets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">Dynamic XML Sitemap</span>
              <p className="text-stone-500 mb-2">
                Dynamically generated XML sitemap incorporating enabled cities and services.
              </p>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>View /sitemap.xml</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">Robots.txt Specification</span>
              <p className="text-stone-500 mb-2">
                Standard crawler instructions permitting public pages while securing admin & user routes.
              </p>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>View /robots.txt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Step 1: Google Search Console Setup */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            1. Google Search Console Verification
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-600 leading-relaxed">
            <li>
              Log in to{' '}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold underline"
              >
                Google Search Console
              </a>{' '}
              with your organization's Google Account.
            </li>
            <li>
              Add a new property using the <strong>URL Prefix</strong> option with your domain URL.
            </li>
            <li>
              Select verification via HTML tag or DNS TXT record.
            </li>
            <li>
              Once verified, navigate to <strong>Sitemaps</strong> in the left sidebar.
            </li>
            <li>
              Submit your sitemap URL: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-emerald-950">sitemap.xml</code>.
            </li>
            <li>
              Confirm status reports <strong>Success</strong>. Google crawlers will discover all enabled city landing pages and service categories.
            </li>
          </ol>
        </div>

        {/* Step 2: Google Business Profile Setup */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            2. Google Business Profile Setup (For Service Areas)
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-600 leading-relaxed">
            <li>
              Open{' '}
              <a
                href="https://business.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold underline"
              >
                Google Business Profile Manager
              </a>.
            </li>
            <li>
              Register your primary business name: <strong>{settings.brandName}</strong>.
            </li>
            <li>
              Select Business Category: <strong>Massage Therapist / Wellness Center</strong>.
            </li>
            <li>
              Under "Do you visit or deliver to your customers?", choose <strong>Yes</strong>.
            </li>
            <li>
              Configure your specific service areas: Sukkur, Karachi, Lahore, Islamabad, Rawalpindi, Multan, and Faisalabad.
            </li>
            <li>
              Add phone number (<strong>{settings.contactPhone}</strong>) and appointment website URL.
            </li>
            <li>
              Complete postal verification or phone code verification as prompted by Google.
            </li>
          </ol>
        </div>

        {/* Structured Data (Schema.org) Output */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-800" />
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Structured Data (Schema.org JSON-LD)
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            This structured data is automatically injected on all public indexable pages for rich snippet discovery:
          </p>

          <pre className="p-4 bg-stone-900 text-amber-200 text-[11px] rounded-2xl overflow-x-auto font-mono max-h-72">
            {JSON.stringify(sampleSchema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
