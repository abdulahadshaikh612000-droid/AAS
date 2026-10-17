import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, serviceAreas, showToast, user } = useApp();

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        showToast('Your message has been sent to our customer care team.', 'success');
        setSubject('');
        setMessage('');
      } else {
        showToast('Failed to send message. Please contact via WhatsApp.', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Salam! I have a question about OilCare Services.'
  )}`;

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Dedicated Customer Care</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Contact OilCare Services
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Have questions regarding specialist booking, corporate wellness packages, or service areas? Reach out to our Karachi & Lahore operations teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-stone-900">Direct Contact</h3>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800 block">Phone Helpline</span>
                    <span>{settings.contactPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800 block">Email Support</span>
                    <span>{settings.supportEmail}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800 block">Support Hours</span>
                    <span>08:00 AM - 10:00 PM (Mon - Sun)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on Official WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <h3 className="font-serif font-bold text-sm text-stone-900">Active Service Hubs</h3>
              <p className="text-xs text-stone-500">
                Operating in Sukkur, Karachi, Lahore, Islamabad, Rawalpindi, Multan, and Faisalabad.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Send us an Inquiry
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Fill out this form and an account executive will respond within 2 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Booking inquiry, corporate wellness, or coverage request"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details of your requirement..."
                  rows={4}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
