import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { WorkerProfile, Service, Review } from '../types/index.ts';
import {
  Star,
  MapPin,
  CheckCircle,
  Clock,
  Home,
  Building2,
  Calendar,
  Languages,
  Award,
  ShieldCheck,
  ArrowLeft,
  MessageCircle,
  UserCheck,
} from 'lucide-react';

export const WorkerDetail: React.FC = () => {
  const { viewParams, navigateTo, openBookingModal, settings } = useApp();
  const workerId = viewParams.id;

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/workers/${workerId}`);
        if (res.ok) {
          const data = await res.json();
          setWorker(data.worker);
          setReviews(data.reviews || []);
          setServices(data.services || []);
        }
      } catch (err) {
        console.error('Error fetching worker details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [workerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-stone-500">Loading specialist profile...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-800">Specialist profile not found</h2>
        <button
          onClick={() => navigateTo('workers')}
          className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs"
        >
          Back to Specialists
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('workers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Specialists Discovery</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <img
                src={worker.profilePhoto}
                alt={worker.displayName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-stone-100 shadow-md"
              />
              <span
                className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-700 text-white rounded-full shadow-md"
                title="Verified by OilCare Admin"
              >
                <CheckCircle className="w-5 h-5" />
              </span>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {worker.displayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  CNIC & Background Verified
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-amber-900">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-stone-500 font-normal">({worker.reviewCount} reviews)</span>
                </div>

                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <strong className="text-stone-800">{worker.city}</strong> (
                  {worker.serviceAreas.slice(0, 3).join(', ')})
                </span>

                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-stone-400" />
                  <span>{worker.experienceYears} Years Experience</span>
                </span>

                <span className="flex items-center gap-1">
                  <Languages className="w-4 h-4 text-stone-400" />
                  <span>{worker.languages.join(', ')}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {worker.homeVisitAvailable && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                    <Home className="w-3.5 h-3.5 text-emerald-700" />
                    Home Appointments Available
                  </span>
                )}
                {worker.serviceCentreAvailable && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-stone-600" />
                    Wellness Centre Appointment
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
              <button
                onClick={() => openBookingModal(undefined, worker.id)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Specialist</span>
              </button>
            </div>
          </div>

          {/* Bio text */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-2">About & Background</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {worker.bio}
            </p>
          </div>

          {/* Working Schedule & Coverage */}
          <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                Working Schedule & Hours
              </h4>
              <p className="text-stone-600 mt-1">
                <strong>Days:</strong> {worker.workingDays.join(', ')}
              </p>
              <p className="text-stone-600">
                <strong>Hours:</strong> {worker.workingHoursStart} to {worker.workingHoursEnd} (Asia/Karachi)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Coverage & Privacy Assurance
              </h4>
              <p className="text-stone-600 mt-1">
                Servicing active areas: {worker.serviceAreas.join(', ')}
              </p>
              <p className="text-stone-500 text-[11px] mt-1">
                For security and privacy, exact addresses are only shared once an appointment is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Services Offered by this Worker */}
        <div className="mt-10">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-4">
            Services Offered by {worker.displayName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{service.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {service.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="font-bold text-emerald-900 font-serif text-sm">
                      {settings.currency} {service.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{service.description}</p>
                </div>

                <button
                  onClick={() => openBookingModal(service.id, worker.id)}
                  className="shrink-0 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Book Service
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Genuine Customer Reviews Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Verified Customer Reviews
              </h2>
              <p className="text-xs text-stone-500">
                Only customers with completed appointments can submit ratings and feedback.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl font-bold text-amber-900 text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{worker.rating.toFixed(1)}</span>
              <span className="text-xs font-normal text-stone-500">
                ({worker.reviewCount} verified reviews)
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
              No customer reviews recorded yet. Be the first to book and share your feedback!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        {rev.customerName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        Verified Booking #{rev.bookingReference}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed mt-2">{rev.comment}</p>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Service: {rev.serviceName}</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
