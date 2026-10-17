import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Send,
} from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const { settings, showToast, user } = useApp();

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('Safety Incident / Conduct Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          userId: user?.id || 'guest',
        }),
      });
      if (res.ok) {
        showToast('Your report has been submitted to the safety compliance team.', 'success');
        setMessage('');
      } else {
        showToast('Failed to send report. Please try WhatsApp support.', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-red-700" />
            <span>Safety, Trust & Ethics Protocol</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Safety, Modesty & Code of Conduct
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Our commitment to professional non-medical therapeutic wellness, personal boundaries, and zero tolerance for harassment across Pakistan.
          </p>
        </div>

        {/* Emergency Alert Box */}
        <div className="p-6 rounded-3xl bg-red-950 text-white border border-red-900 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-900 text-red-200 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Emergency National Helplines</h2>
              <p className="text-xs text-red-200 mt-0.5">
                In case of any urgent danger, safety violation, or medical distress:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-red-900/80 px-3 py-1 rounded-lg border border-red-700 font-bold">
                  Police Helpline: 15
                </span>
                <span className="bg-red-900/80 px-3 py-1 rounded-lg border border-red-700 font-bold">
                  Rescue / Ambulance: 1122
                </span>
                <span className="bg-red-900/80 px-3 py-1 rounded-lg border border-red-700 font-bold">
                  Platform Helpline: {settings.contactPhone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Safety Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              1. Non-Medical Therapeutic Boundaries
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              All services on our platform are strictly therapeutic relaxation, traditional herbal oil champi, and posture soothing. No worker may make medical diagnoses or clinical treatment guarantees. Clients with acute fractures, spine surgery, or infectious skin conditions must seek licensed medical physician care.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              2. Strict Modesty & Respect for Homes
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              During home appointments, specialists must respect family boundaries and modesty. Appropriate draping is mandatory at all times. Service areas in homes should be dedicated, clean spaces with household members aware of the appointment.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              3. Zero Harassment & Coercion Policy
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Any form of inappropriate advance, harassment, illicit request, or coercive behavior from either client or practitioner will result in immediate termination, blacklisting across Pakistan, and forwarding of verified CNIC records to law enforcement.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              4. Traditional Chatai Mat Hygiene
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Authentic chatai reed mats must be sanitized between appointments. Specialists carry hygienic fresh sheets or towels. Pure, unadulterated cold-pressed mustard, almond, black seed (kalonji), and olive oils are used exclusively.
            </p>
          </div>
        </div>

        {/* Incident Reporting Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-5">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Confidential Incident or Conduct Report
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              If you experienced any deviation from our professional conduct standards, please notify our safety compliance desk directly.
            </p>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Report Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Incident Details *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include date, booking reference, specialist or client name, and specific conduct details..."
                rows={4}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Confidential Report'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
