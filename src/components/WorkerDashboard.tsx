import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Booking, BookingStatus, WorkerProfile } from '../types/index.ts';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  DollarSign,
  TrendingUp,
  Star,
  UserCheck,
  ShieldAlert,
  Play,
  Check,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user, token, workerProfile, settings, showToast, refreshUser } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'completed' | 'schedule'>('requests');

  // Edit schedule state
  const [workingDays, setWorkingDays] = useState<string[]>(
    workerProfile?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [hoursStart, setHoursStart] = useState(workerProfile?.workingHoursStart || '09:00');
  const [hoursEnd, setHoursEnd] = useState(workerProfile?.workingHoursEnd || '21:00');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchWorkerBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerBookings();
  }, [token]);

  const updateBookingStatus = async (bookingId: string, targetStatus: BookingStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Booking marked as ${targetStatus}`, 'success');
        fetchWorkerBookings();
        refreshUser();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerProfile || !token) return;
    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/workers/${workerProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workingDays,
          workingHoursStart: hoursStart,
          workingHoursEnd: hoursEnd,
        }),
      });
      if (res.ok) {
        showToast('Schedule & availability saved successfully.', 'success');
        refreshUser();
      } else {
        showToast('Failed to save schedule', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'Pending');
  const upcomingAppointments = bookings.filter((b) =>
    ['Confirmed', 'In Progress'].includes(b.status)
  );
  const completedAppointments = bookings.filter((b) => b.status === 'Completed');

  // Total earnings calculations
  const totalCompletedCount = completedAppointments.length;
  const grossEarnings = completedAppointments.reduce(
    (sum, b) => sum + b.priceSnapshot.workerEarnings,
    0
  );
  const totalVolume = completedAppointments.reduce(
    (sum, b) => sum + b.priceSnapshot.totalPrice,
    0
  );

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Verification Status Banner */}
        {workerProfile?.verificationStatus === 'pending' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Account Pending Administrative Verification</h3>
              <p className="text-xs text-amber-800 mt-1">
                Your specialist profile has been submitted. Platform administrators are reviewing your CNIC details and credentials. Your profile will become discoverable in public search results once approved.
              </p>
            </div>
          </div>
        )}

        {workerProfile?.verificationStatus === 'suspended' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Account Suspended</h3>
              <p className="text-xs text-red-800 mt-1">
                This account has been temporarily suspended. Please reach out to platform support at{' '}
                <strong>{settings.supportEmail}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Worker Profile Header & Earnings KPIs */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <img
                src={workerProfile?.profilePhoto}
                alt={workerProfile?.displayName}
                className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shadow-inner"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    {workerProfile?.displayName}
                  </h1>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      workerProfile?.verificationStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {workerProfile?.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {workerProfile?.city} • {workerProfile?.experienceYears} Years Exp • Rating:{' '}
                  {workerProfile?.rating} ★ ({workerProfile?.reviewCount} reviews)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl font-medium">
                {workerProfile?.serviceAreas.join(', ')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium block">Your Net Earnings</span>
              <p className="text-2xl font-serif font-bold text-emerald-950 mt-1">
                {settings.currency} {grossEarnings.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-700">From completed cash sessions</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-600 font-medium block">Completed Appointments</span>
              <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {totalCompletedCount}
              </p>
              <span className="text-[10px] text-stone-500">Total sessions successfully served</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-600 font-medium block">Pending Requests</span>
              <p className="text-2xl font-serif font-bold text-amber-800 mt-1">
                {pendingRequests.length}
              </p>
              <span className="text-[10px] text-stone-500">Awaiting your confirmation</span>
            </div>
          </div>
        </div>

        {/* Bookings Management & Tabs */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Manage Appointments</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'requests'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Requests ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'completed'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Completed ({completedAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Availability & Hours
              </button>
            </div>
          </div>

          {activeTab === 'schedule' ? (
            /* Availability Management Form */
            <form onSubmit={handleSaveSchedule} className="max-w-xl space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Active Working Days
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => {
                    const active = workingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          setWorkingDays(
                            active ? workingDays.filter((d) => d !== day) : [...workingDays, day]
                          );
                        }}
                        className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Start Hours (Asia/Karachi)
                  </label>
                  <input
                    type="time"
                    value={hoursStart}
                    onChange={(e) => setHoursStart(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    End Hours (Asia/Karachi)
                  </label>
                  <input
                    type="time"
                    value={hoursEnd}
                    onChange={(e) => setHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSchedule}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs"
              >
                {savingSchedule ? 'Saving...' : 'Save Availability'}
              </button>
            </form>
          ) : (
            /* Bookings List */
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-stone-500">Loading bookings...</div>
              ) : (
                (activeTab === 'requests'
                  ? pendingRequests
                  : activeTab === 'upcoming'
                  ? upcomingAppointments
                  : completedAppointments
                ).map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          {b.bookingReference}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800">
                          {b.status}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium capitalize">
                          {b.serviceMode.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-stone-900">{b.serviceName}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                          {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {b.timeSlot}
                        </span>
                        <span>Client: <strong className="text-stone-800">{b.customerName}</strong> ({b.customerPhone})</span>
                      </div>

                      <div className="text-xs text-stone-600">
                        Meeting / Address: <span className="font-medium text-stone-800">{b.addressDetails}</span>
                      </div>

                      {b.specialInstructions && (
                        <p className="text-[11px] text-stone-500 italic">
                          Client Notes: "{b.specialInstructions}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-stone-400 block uppercase font-medium">
                          Your Earnings
                        </span>
                        <span className="font-serif font-bold text-lg text-emerald-950">
                          {settings.currency} {b.priceSnapshot.workerEarnings.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          Collect Cash: {settings.currency} {b.priceSnapshot.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* State Action Buttons */}
                      <div className="flex items-center gap-2">
                        {b.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(b.id, 'Confirmed')}
                              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => updateBookingStatus(b.id, 'Rejected')}
                              className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'In Progress')}
                            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Session</span>
                          </button>
                        )}

                        {b.status === 'In Progress' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'Completed')}
                            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed & Collect Cash</span>
                          </button>
                        )}

                        {b.status === 'Completed' && (
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
