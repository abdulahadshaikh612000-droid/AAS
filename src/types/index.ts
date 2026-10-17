export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  area?: string;
  preferredAreas?: string[];
  isSuspended?: boolean;
  createdAt: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface WorkerProfile {
  id: string;
  userId: string;
  displayName: string;
  fullName: string;
  phone: string;
  email: string;
  bio: string;
  experienceYears: number;
  languages: string[];
  profilePhoto: string;
  city: string;
  serviceAreas: string[];
  approvedServices: string[]; // Service IDs
  customPrices?: Record<string, number>; // ServiceId -> price
  homeVisitAvailable: boolean;
  serviceCentreAvailable: boolean;
  serviceCentreAddress?: string;
  verificationStatus: VerificationStatus;
  verificationDocType?: string;
  verificationNotes?: string;
  rating: number;
  reviewCount: number;
  completedBookingsCount: number;
  workingDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "21:00"
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameUrdu: string;
  slug: string;
  description: string;
  iconName: string;
  displayOrder: number;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  nameUrdu: string;
  categoryId: string;
  description: string;
  descriptionUrdu: string;
  durationMinutes: number;
  basePrice: number;
  homeVisitFee: number;
  homeVisitAllowed: boolean;
  serviceCentreAllowed: boolean;
  imageUrl: string;
  active: boolean;
  boundariesNotice?: string;
  createdAt: string;
}

export interface ServiceArea {
  id: string;
  country: string;
  province: string;
  city: string;
  cityUrdu: string;
  areas: string[];
  enabled: boolean;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Refunded';

export interface PriceSnapshot {
  basePrice: number;
  homeVisitFee: number;
  totalPrice: number;
  platformCommission: number;
  workerEarnings: number;
  currency: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  workerId: string;
  workerName: string;
  workerPhone?: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 11:00 AM"
  serviceMode: 'home_visit' | 'service_centre';
  city: string;
  area: string;
  addressDetails: string;
  specialInstructions?: string;
  priceSnapshot: PriceSnapshot;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'cash_on_delivery' | 'manual_confirmation';
  cancellationReason?: string;
  cancellationFee?: number;
  cancelledBy?: string;
  reviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  workerId: string;
  serviceId: string;
  serviceName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface PlatformSettings {
  brandName: string;
  brandNameUrdu: string;
  tagLine: string;
  logoUrl: string;
  currency: string;
  contactPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  platformCommissionPercentage: number;
  enableCashPayment: boolean;
  enableUrduLanguage: boolean;
  emergencyHelpline: string;
  freeCancellationWindowHours: number;
  safetyGuidelinesText: string;
  homeVisitPolicyText: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}
