import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Award,
  ShieldCheck,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const BecomeWorkerPage: React.FC = () => {
  const { services, serviceAreas, register, showToast, navigateTo, settings } = useApp();

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [languages, setLanguages] = useState(['Urdu']);
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv_1']);
  const [bio, setBio] = useState('');
  const [homeVisitAvailable, setHomeVisitAvailable] = useState(true);
  const [serviceCentreAvailable, setServiceCentreAvailable] = useState(false);
  const [cnicNumber, setCnicNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cnicNumber) {
      setError('Please provide your valid CNIC number for verification.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName,
        displayName: displayName || fullName,
        email,
        password,
        role: 'worker',
        phone,
        city,
        area,
        experienceYears: Number(experienceYears),
        languages,
        approvedServices: selectedServices,
        bio,
        homeVisitAvailable,
        serviceCentreAvailable,
        serviceAreas: area ? [area] : ['City Center'],
        verificationDocType: `CNIC ${cnicNumber} Submitted for Admin Review`,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (langName: string) => {
    if (languages.includes(langName)) {
      if (languages.length > 1) setLanguages(languages.filter((l) => l !== langName));
    } else {
      setLanguages([...languages, langName]);
    }
  };

  const toggleService = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      if (selectedServices.length > 1)
        setSelectedServices(selectedServices.filter((id) => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Join Pakistan's Premier Wellness Network</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Become a Verified Massage Specialist
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Grow your clientele with respectful households, set your own working hours, and receive direct cash payments at guaranteed transparent rates.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Direct Cash Earnings</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Keep 90% of your service price. Collect cash directly from customers upon completing each session.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Verified Dignity & Safety</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We enforce strict personal safety and code of conduct rules. Customers must respect privacy and boundaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Flexible Scheduling</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Choose your working days, daily hours, and service areas. Accept or decline requests with complete control.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Specialist Application Form
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              All submissions undergo manual administrative verification before being approved.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per NADRA CNIC"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Public Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ustad Rashid Khan"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Phone & CNIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  NADRA CNIC Number * (Private)
                </label>
                <input
                  type="text"
                  value={cnicNumber}
                  onChange={(e) => setCnicNumber(e.target.value)}
                  placeholder="e.g. 42101-1234567-1"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Encrypted. Never displayed publicly on your profile.
                </span>
              </div>
            </div>

            {/* City & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">City Hub *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {serviceAreas.map((a) => (
                    <option key={a.id} value={a.city}>
                      {a.city} ({a.province})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Primary Service Neighbourhood *
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Clifton, DHA, Gulberg, F-7"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Experience & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Languages Spoken</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Urdu', 'Sindhi', 'Punjabi', 'Pashto', 'English', 'Saraiki'].map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => toggleLanguage(l)}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                        languages.includes(l)
                          ? 'bg-emerald-900 text-white border-emerald-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Services offered */}
            <div>
              <label className="block font-bold text-stone-700 mb-2">
                Services You Can Deliver Professionally *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services
                  .filter((s) => s.active)
                  .map((s) => {
                    const isChecked = selectedServices.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isChecked ? 'text-emerald-700' : 'text-stone-300'
                          }`}
                        />
                        <div>
                          <p className="text-xs">{s.name}</p>
                          <span className="text-[10px] text-stone-500 font-normal">
                            Base: {settings.currency} {s.basePrice}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Professional Bio & Traditional Training *
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your training, herbal oil methods, traditional chatai techniques, and client care ethics..."
                rows={3}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
                required
              />
            </div>

            {/* Delivery method checkboxes */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeVisitAvailable}
                  onChange={(e) => setHomeVisitAvailable(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-stone-800">Available for Home Visits</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={serviceCentreAvailable}
                  onChange={(e) => setServiceCentreAvailable(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-semibold text-stone-800">
                  I operate an approved Wellness Centre
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Submitting Application...' : 'Submit Specialist Application'}
              </button>
              <p className="text-center text-[11px] text-stone-400 mt-2">
                By submitting, you pledge adherence to zero harassment, respect for household modesty, and accurate identity disclosure.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
