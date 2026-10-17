import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Booking } from '../types/index.ts';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Home,
  Building2,
  FileText,
  MessageCircle,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, token, settings, showToast, navigateTo } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation modal state
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchBookings = async () => {
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
    fetchBookings();
  }, [token]);

  const activeBookings = bookings.filter((b) =>
    ['Pending', 'Confirmed', 'In Progress'].includes(b.status)
  );

  const historyBookings = bookings.filter((b) =>
    ['Completed', 'Cancelled', 'Rejected'].includes(b.status)
  );

  const handleCancelSubmit = async () => {
    if (!cancelBooking || !token) return;
    setSubmittingCancel(true);
    try {
      const res = await fetch(`/api/bookings/${cancelBooking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Cancelled', reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Booking ${cancelBooking.bookingReference} cancelled.`, 'info');
        setCancelBooking(null);
        setCancelReason('');
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to cancel booking', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !token) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reviewBooking.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Thank you! Your verified review has been published.', 'success');
        setReviewBooking(null);
        setReviewComment('');
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'Completed':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-amber-200 flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-inner">
              {user?.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-stone-900">{user?.fullName}</h1>
                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  Customer
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {user?.email} • {user?.phone || 'No phone set'} • {user?.city || 'Karachi'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('workers')}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Book New Specialist
          </button>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Your Appointments</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'active'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Active ({activeBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'history'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Past & Cancelled ({historyBookings.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading your bookings...
            </div>
          ) : (activeTab === 'active' ? activeBookings : historyBookings).length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No appointments in this view.
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'active' ? activeBookings : historyBookings).map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-medium capitalize">
                        {booking.serviceMode.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900">{booking.serviceName}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {booking.timeSlot}
                      </span>
                      <span>Specialist: <strong className="text-stone-700">{booking.workerName}</strong></span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {booking.city} ({booking.area})
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      Address: <span className="font-medium text-stone-800">{booking.addressDetails}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-stone-400 block uppercase font-medium">
                        Amount Due
                      </span>
                      <span className="font-serif font-bold text-lg text-emerald-950">
                        {settings.currency} {booking.priceSnapshot.totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        Payment: {booking.paymentStatus} (Cash)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Customer can cancel Pending or Confirmed */}
                      {['Pending', 'Confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => setCancelBooking(booking)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel Appointment
                        </button>
                      )}

                      {/* Review option after Completed */}
                      {booking.status === 'Completed' && !booking.reviewed && (
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate & Review</span>
                        </button>
                      )}

                      {booking.status === 'Completed' && booking.reviewed && (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl relative">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              Rate Your Experience
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Booking #{reviewBooking.bookingReference} with {reviewBooking.workerName}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Review & Feedback *
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the oil quality, cleanliness, punctuality, and therapeutic relief..."
                  rows={4}
                  className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl relative">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              Cancel Appointment #{cancelBooking.bookingReference}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Please note our cancellation policy: cancellations made more than 2 hours before the
              appointment time receive standard zero-penalty cancellation.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you need to cancel..."
                  rows={3}
                  className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-700"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={submittingCancel}
                  className="px-5 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-xl shadow-xs"
                >
                  {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
