import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Briefcase, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, authModalRole, login, register, serviceAreas } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'worker'>(authModalRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [bio, setBio] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) setError(res.error || 'Login failed');
      } else {
        const payload: any = {
          email,
          password,
          fullName,
          role,
          phone,
          city,
          area,
        };
        if (role === 'worker') {
          payload.displayName = displayName || fullName;
          payload.experienceYears = Number(experienceYears);
          payload.bio = bio;
          payload.serviceAreas = area ? [area] : ['City Center'];
          payload.verificationDocType = 'NADRA CNIC Submitted';
        }
        const res = await register(payload);
        if (!res.success) setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative my-8">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-200 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {mode === 'login' ? 'Sign In to OilCare' : 'Create an Account'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login'
              ? 'Access your appointments, saved areas, or provider dashboard.'
              : 'Join as a customer or register as a verified specialist.'}
          </p>
        </div>

        {/* Quick Demo Logins for fast testing */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-900 block mb-1.5 text-center">
            One-Click Test Credentials
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => fillDemo('admin@oilcare.pk', 'admin123')}
              className="py-1 px-2 rounded-lg bg-emerald-900 text-white hover:bg-emerald-950 text-center cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('tariq@oilcare.pk', 'worker123')}
              className="py-1 px-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-center cursor-pointer"
            >
              Worker
            </button>
            <button
              type="button"
              onClick={() => fillDemo('ahmed@gmail.com', 'customer123')}
              className="py-1 px-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-center cursor-pointer"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">I want to register as:</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    role === 'customer'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    role === 'worker'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  Massage Specialist
                </button>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              {role === 'worker' && (
                <>
                  <div className="mt-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Public Display Name *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ustad Tariq Specialist"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Years of Exp *</label>
                      <input
                        type="number"
                        min="1"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">City *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                      >
                        {serviceAreas.map((a) => (
                          <option key={a.id} value={a.city}>
                            {a.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-2">
                <label className="block font-bold text-stone-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-stone-500">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
