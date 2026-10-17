/**
 * Pure booking and pricing domain logic for OilCare Services
 * Standalone, deterministic, unit-tested functions.
 */

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Refunded';

export type ServiceMode = 'home_visit' | 'service_centre';

export interface PriceCalculationParams {
  basePrice: number;
  serviceMode: ServiceMode;
  homeVisitFee?: number;
  commissionPercentage?: number;
}

export interface PriceBreakdown {
  basePrice: number;
  homeVisitFee: number;
  totalPrice: number;
  platformCommission: number;
  workerEarnings: number;
  currency: string;
}

/**
 * Calculates accurate pricing breakdown based on platform and service settings.
 */
export function calculateBookingPrice(
  params: PriceBreakdownInput,
  currency = 'PKR'
): PriceBreakdown {
  const base = Math.max(0, Math.round(params.basePrice));
  const visitFee =
    params.serviceMode === 'home_visit'
      ? Math.max(0, Math.round(params.homeVisitFee || 0))
      : 0;
  const total = base + visitFee;
  const commissionRate = Math.min(100, Math.max(0, params.commissionPercentage ?? 10));
  const commission = Math.round((total * commissionRate) / 100);
  const earnings = total - commission;

  return {
    basePrice: base,
    homeVisitFee: visitFee,
    totalPrice: total,
    platformCommission: commission,
    workerEarnings: earnings,
    currency,
  };
}

export interface PriceBreakdownInput {
  basePrice: number;
  serviceMode: ServiceMode;
  homeVisitFee?: number;
  commissionPercentage?: number;
}

export interface ExistingSlot {
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM" or "14:00"
  status: BookingStatus;
}

/**
 * Validates whether a requested booking slot conflicts with existing active bookings.
 * Cancelled and Rejected bookings do NOT block the slot.
 */
export function hasBookingConflict(
  existingBookings: ExistingSlot[],
  requestedDate: string,
  requestedTimeSlot: string
): boolean {
  const activeStatuses: BookingStatus[] = ['Pending', 'Confirmed', 'In Progress'];
  return existingBookings.some(
    (b) =>
      b.date === requestedDate &&
      b.timeSlot.trim().toLowerCase() === requestedTimeSlot.trim().toLowerCase() &&
      activeStatuses.includes(b.status)
  );
}

/**
 * Validates state transition machine for bookings.
 */
export function isValidStatusTransition(
  current: BookingStatus,
  target: BookingStatus,
  userRole: 'admin' | 'worker' | 'customer'
): boolean {
  if (current === target) return true;

  // Terminal states cannot be changed by non-admins
  const terminalStates: BookingStatus[] = ['Completed', 'Cancelled', 'Rejected'];
  if (terminalStates.includes(current) && userRole !== 'admin') {
    return false;
  }

  // Allowed transitions per role
  switch (userRole) {
    case 'customer':
      // Customers can only cancel pending or confirmed bookings
      if (target === 'Cancelled' && (current === 'Pending' || current === 'Confirmed')) {
        return true;
      }
      return false;

    case 'worker':
      if (current === 'Pending' && (target === 'Confirmed' || target === 'Rejected')) {
        return true;
      }
      if (current === 'Confirmed' && (target === 'In Progress' || target === 'Cancelled')) {
        return true;
      }
      if (current === 'In Progress' && target === 'Completed') {
        return true;
      }
      return false;

    case 'admin':
      // Admins have supervisory override across all states with audit
      return true;

    default:
      return false;
  }
}

/**
 * Evaluates cancellation policy eligibility.
 * Appointments cancelled at least 2 hours prior receive full refund/no-penalty.
 */
export function evaluateCancellationPolicy(
  appointmentDateStr: string,
  timeSlotStr: string,
  currentTimeMs = Date.now()
): { eligibleForFreeCancel: boolean; hoursRemaining: number; noticeMessage: string } {
  // Parse slot start time. E.g. "14:00" or "02:00 PM"
  let hour = 12;
  let minute = 0;

  const match = timeSlotStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    hour = parseInt(match[1], 10);
    minute = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
  }

  const [year, month, day] = appointmentDateStr.split('-').map(Number);
  const apptTime = new Date(year, (month || 1) - 1, day || 1, hour, minute).getTime();
  const diffHours = (apptTime - currentTimeMs) / (1000 * 60 * 60);

  if (diffHours >= 2) {
    return {
      eligibleForFreeCancel: true,
      hoursRemaining: Math.round(diffHours * 10) / 10,
      noticeMessage: 'Eligible for standard free cancellation (more than 2 hours notice).',
    };
  }

  return {
    eligibleForFreeCancel: false,
    hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
    noticeMessage:
      'Late cancellation: less than 2 hours before scheduled start. A fee may apply.',
  };
}
