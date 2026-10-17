import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Service, WorkerProfile } from '../types/index.ts';
import { calculateBookingPrice } from '../utils/booking-rules.ts';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Home,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    bookingModal,
    closeBookingModal,
    services,
    serviceAreas,
    settings,
    user,
    token,
    showToast,
    navigateTo,
  } = useApp();

  const [availableWorkers, setAvailableWorkers] = useState<WorkerProfile[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 11:00 AM');
  const [serviceMode, setServiceMode] = useState<'home_visit' | 'service_centre'>('home_visit');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [city, setCity] = useState<string>('Karachi');
  const [area, setArea] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form
  useEffect(() => {
    if (!bookingModal.isOpen) return;

    // Fetch approved workers
    fetch('/api/workers')
      .then((r) => r.json())
      .then((data) => setAvailableWorkers(data))
      .catch((err) => console.error(err));

    if (bookingModal.serviceId) {
      setSelectedServiceId(bookingModal.serviceId);
    } else if (services.length > 0) {
      setSelectedServiceId(services[0].id);
    }

    if (bookingModal.workerId) {
      setSelectedWorkerId(bookingModal.workerId);
    }

    // Default date to tomorrow in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);

    if (user) {
      setCustomerName(user.fullName || '');
      setCustomerPhone(user.phone || '');
      setCity(user.city || 'Karachi');
      setArea(user.area || '');
    }

    setConfirmedBooking(null);
    setErrorMessage(null);
  }, [bookingModal.isOpen, bookingModal.serviceId, bookingModal.workerId, user, services]);

  if (!bookingModal.isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId);
  const currentWorker = availableWorkers.find((w) => w.id === selectedWorkerId);

  // Workers that support this service
  const matchingWorkers = availableWorkers.filter(
    (w) => !selectedServiceId || w.approvedServices.includes(selectedServiceId)
  );

  // If selected worker does not provide this service, auto-adjust
  const effectiveWorkerId =
    selectedWorkerId && matchingWorkers.some((w) => w.id === selectedWorkerId)
      ? selectedWorkerId
      : matchingWorkers[0]?.id || '';

  // Time slots
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM',
  ];

  // Price computation preview
  const pricePreview = currentService
    ? calculateBookingPrice(
        {
          basePrice: currentService.basePrice,
          serviceMode,
          homeVisitFee: currentService.homeVisitFee,
          commissionPercentage: settings.platformCommissionPercentage,
        },
        settings.currency
      )
    : null;

  const activeAreas =
    serviceAreas.find((a) => a.city.toLowerCase() === city.toLowerCase())?.areas || [];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedServiceId || !effectiveWorkerId) {
      setErrorMessage('Please select a valid service and specialist.');
      return;
    }

    if (!customerPhone || !addressDetails || !date || !timeSlot) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (!policyAccepted) {
      setErrorMessage('Please acknowledge the cancellation policy and personal safety code.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          workerId: effectiveWorkerId,
          date,
          timeSlot,
          serviceMode,
          customerName,
          customerPhone,
          city,
          area,
          addressDetails,
          specialInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create booking.');
      } else {
        setConfirmedBooking(data.booking);
        showToast(`Booking ${data.booking.bookingReference} submitted successfully!`, 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={closeBookingModal}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Appointment Requested
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                Booking Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Your booking reference is{' '}
                <strong className="text-emerald-950 font-mono text-base">
                  {confirmedBooking.bookingReference}
                </strong>
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Service:</span>
                <span className="font-bold text-stone-800">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Specialist:</span>
                <span className="font-bold text-stone-800">{confirmedBooking.workerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Date & Slot:</span>
                <span className="font-bold text-stone-800">
                  {confirmedBooking.date} ({confirmedBooking.timeSlot})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Service Method:</span>
                <span className="font-bold capitalize text-stone-800">
                  {confirmedBooking.serviceMode.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Location:</span>
                <span className="font-bold text-stone-800">
                  {confirmedBooking.area ? `${confirmedBooking.area}, ` : ''}
                  {confirmedBooking.city}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-emerald-950">
                <span>Total Due on Completion:</span>
                <span>
                  {settings.currency}{' '}
                  {confirmedBooking.priceSnapshot.totalPrice.toLocaleString()} (Cash)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Salam! I just placed booking ${confirmedBooking.bookingReference} for ${confirmedBooking.serviceName} on ${confirmedBooking.date}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Notification / Update</span>
              </a>

              <button
                onClick={() => {
                  closeBookingModal();
                  navigateTo('customer-dashboard');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
              >
                View in My Bookings
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="border-b border-stone-100 pb-4 mb-5">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                Safe & Verified Booking
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Book a Wellness Appointment
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Select your service, specialist, and preferred time. Pay cash after service completion.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              {/* Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Select Service *</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  >
                    {services
                      .filter((s) => s.active)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({settings.currency} {s.basePrice})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Select Specialist *</label>
                  <select
                    value={effectiveWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  >
                    {matchingWorkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.displayName} - {w.city} ({w.rating} ★)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Mode */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Appointment Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceMode('home_visit')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                      serviceMode === 'home_visit'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Home Visit (+{settings.currency} {currentService?.homeVisitFee || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceMode('service_centre')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                      serviceMode === 'service_centre'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Service Centre Visit</span>
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Available Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact & Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City *</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setArea('');
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    required
                  >
                    {serviceAreas
                      .filter((a) => a.enabled)
                      .map((a) => (
                        <option key={a.id} value={a.city}>
                          {a.city}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Area & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Neighbourhood / Area *</label>
                  {activeAreas.length > 0 ? (
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    >
                      <option value="">Select Area</option>
                      {activeAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. DHA, Gulberg, Sector F-7"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {serviceMode === 'home_visit' ? 'Complete Home Address *' : 'Meeting / Centre Notes *'}
                  </label>
                  <input
                    type="text"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder={
                      serviceMode === 'home_visit'
                        ? 'House / Apt number, street, landmark'
                        : 'Preferred centre meeting details'
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                    required
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Special Wellness Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Focus on lower back stiffness, prefer almond oil, etc."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                />
              </div>

              {/* Price Transparency Breakdown */}
              {pricePreview && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Service Price:</span>
                    <span>
                      {settings.currency} {pricePreview.basePrice.toLocaleString()}
                    </span>
                  </div>
                  {pricePreview.homeVisitFee > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Home Visit Travel Fee:</span>
                      <span>
                        +{settings.currency} {pricePreview.homeVisitFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-emerald-200">
                    <span>Total Amount (Cash on Delivery):</span>
                    <span>
                      {settings.currency} {pricePreview.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Policy Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="policyAgreement"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                  required
                />
                <label htmlFor="policyAgreement" className="text-[11px] text-stone-600 leading-normal">
                  I agree to the <strong>2-Hour Free Cancellation Policy</strong> and confirm that all
                  home visit appointments will strictly observe professional boundaries and modesty
                  standards. Cash payment will be handed directly upon session completion.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <span>Checking availability & locking slot...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
