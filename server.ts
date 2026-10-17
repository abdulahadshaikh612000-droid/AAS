import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import {
  Booking,
  BookingStatus,
  PlatformSettings,
  Review,
  Service,
  ServiceArea,
  ServiceCategory,
  SupportTicket,
  User,
  WorkerProfile,
  AdminAuditLog,
} from './src/types/index.ts';
import {
  calculateBookingPrice,
  hasBookingConflict,
  isValidStatusTransition,
  evaluateCancellationPolicy,
} from './src/utils/booking-rules.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hash
  workerProfiles: WorkerProfile[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  serviceAreas: ServiceArea[];
  bookings: Booking[];
  reviews: Review[];
  platformSettings: PlatformSettings;
  adminAuditLogs: AdminAuditLog[];
  supportTickets: SupportTicket[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'oilcare_salt_v1').digest('hex');
}

function generateInitialSeed(): DatabaseSchema {
  const adminId = 'usr_admin_1';
  const worker1Id = 'usr_worker_1';
  const worker2Id = 'usr_worker_2';
  const worker3Id = 'usr_worker_3';
  const worker4Id = 'usr_worker_4';
  const customerId = 'usr_cust_1';

  const defaultSettings: PlatformSettings = {
    brandName: 'OilCare Services',
    brandNameUrdu: 'آئل کیئر سروسز',
    tagLine: 'Book Trusted Traditional Oil Massage & Wellness Specialists Across Pakistan',
    logoUrl: '',
    currency: 'PKR',
    contactPhone: '+92 300 1234567',
    whatsappNumber: '923001234567',
    supportEmail: 'support@oilcare.pk',
    platformCommissionPercentage: 10,
    enableCashPayment: true,
    enableUrduLanguage: true,
    emergencyHelpline: '15 (Police) / 1122 (Rescue / Ambulance)',
    freeCancellationWindowHours: 2,
    safetyGuidelinesText:
      'All appointments strictly observe personal boundaries, professional code of conduct, and clear customer consent. Certified traditional massage only on clean chatai or massage surface.',
    homeVisitPolicyText:
      'For home visits, please ensure a well-ventilated, quiet room with access to clean water and an appropriate flat space for traditional chatai laying. Our workers adhere to zero harassment and respect household privacy.',
  };

  const categories: ServiceCategory[] = [
    {
      id: 'cat_oil_trad',
      name: 'Traditional Oil Massage',
      nameUrdu: 'روایتی تیل مالش (چمپی)',
      slug: 'traditional-oil-massage',
      description: 'Time-tested herbal, mustard & almond oil champi promoting blood circulation and muscle relaxation.',
      iconName: 'Droplet',
      displayOrder: 1,
      active: true,
    },
    {
      id: 'cat_relax',
      name: 'Relaxation Massage',
      nameUrdu: 'پُرسکون اور آرام دہ مساج',
      slug: 'relaxation-massage',
      description: 'Gentle, therapeutic body therapy designed to melt away work fatigue and mental stress.',
      iconName: 'Sparkles',
      displayOrder: 2,
      active: true,
    },
    {
      id: 'cat_full_body',
      name: 'Full-Body Wellness Massage',
      nameUrdu: 'مکمل جسمانی تندرستی مساج',
      slug: 'full-body-wellness-massage',
      description: 'Comprehensive head-to-toe traditional therapy addressing joint stiffness and chronic fatigue.',
      iconName: 'Activity',
      displayOrder: 3,
      active: true,
    },
    {
      id: 'cat_head_shoulder',
      name: 'Head, Neck & Shoulder Champi',
      nameUrdu: 'سر، گردن اور کندھوں کا مساج',
      slug: 'head-neck-shoulder-massage',
      description: 'Targeted pressure point therapy for tension headaches, desk posture strain, and neck stiffness.',
      iconName: 'Smile',
      displayOrder: 4,
      active: true,
    },
    {
      id: 'cat_foot',
      name: 'Foot Massage & Reflexology',
      nameUrdu: 'پاؤں اور پنڈلیوں کی روایتی مالش',
      slug: 'foot-massage',
      description: 'Deep pressure therapy targeting tired arches, heels, and calf muscles with warm herbal oil.',
      iconName: 'Footprints',
      displayOrder: 5,
      active: true,
    },
    {
      id: 'cat_back',
      name: 'Back & Spine Care Massage',
      nameUrdu: 'کمر اور ریڑھ کی ہڈی کی مالش',
      slug: 'back-massage',
      description: 'Focused lower and upper back therapy targeting knots, stiffness, and posture strain.',
      iconName: 'Shield',
      displayOrder: 6,
      active: true,
    },
    {
      id: 'cat_chatai',
      name: 'Traditional Chatai Wellness Service',
      nameUrdu: 'مستند روایتی چٹائی سروس',
      slug: 'chatai-services',
      description: 'Authentic floor chatai setup providing grounded, firm body pressure and limb stretching.',
      iconName: 'Compass',
      displayOrder: 7,
      active: true,
    },
  ];

  const services: Service[] = [
    {
      id: 'srv_1',
      name: 'Authentic Mustard & Herbal Oil Champi',
      nameUrdu: 'روایتی سرسوں اور جڑی بوٹیوں کی چمپی',
      categoryId: 'cat_oil_trad',
      description: 'Classic warm mustard oil massage infused with natural herbs for deep muscle tension release and invigorating scalp circulation.',
      descriptionUrdu: 'خالص سرسوں کے نیم گرم تیل سے روایتی چمپی جو پٹھوں کو طاقت اور سکون بخشتی ہے۔',
      durationMinutes: 60,
      basePrice: 2200,
      homeVisitFee: 400,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'Strictly professional non-medical therapeutic wellness massage.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'srv_2',
      name: 'Complete Full-Body Chatai Therapy',
      nameUrdu: 'مکمل جسمانی روایتی چٹائی تھراپی',
      categoryId: 'cat_full_body',
      description: 'Traditional full body massage performed on a hygienic woven chatai mat with customized almond and black seed (kalonji) oil blend.',
      descriptionUrdu: 'صاف ستھری روایتی چٹائی پر بادام اور کلونجی تیل سے مکمل جسم کی مالش۔',
      durationMinutes: 90,
      basePrice: 3500,
      homeVisitFee: 500,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'Non-clinical relaxation treatment. Safe drape and modesty standards maintained.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'srv_3',
      name: 'Executive Head, Neck & Upper Back Relief',
      nameUrdu: 'سر، گردن اور کندھوں کا فوری ریلیف مساج',
      categoryId: 'cat_head_shoulder',
      description: 'Specialized 45-minute upper torso session targeting digital eye strain, desk worker neck pain, and temple pressure.',
      descriptionUrdu: 'دفتر اور کمپیوٹر کے کام سے پیدا شدہ گردن اور کندھوں کے تناؤ کے لیے خصوصی سیشن۔',
      durationMinutes: 45,
      basePrice: 1800,
      homeVisitFee: 350,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'Therapeutic pressure points only.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'srv_4',
      name: 'Traditional Foot & Calf Reflex Massage',
      nameUrdu: 'پاؤں اور پنڈلیوں کی گہری مالش',
      categoryId: 'cat_foot',
      description: 'Targeted acupressure strokes on soles, ankles, and calf muscles to alleviate standing fatigue and improve lower limb circulation.',
      descriptionUrdu: 'تھکے ہوئے پیروں کے لیے روایتی تیل سے ریفلیکسولوجی مالش۔',
      durationMinutes: 45,
      basePrice: 1600,
      homeVisitFee: 300,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'General wellness relief for tired feet.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'srv_5',
      name: 'Deep Back & Lumbar Wellness Massage',
      nameUrdu: 'کمر کے نچلے حصے اور پٹھوں کا مساج',
      categoryId: 'cat_back',
      description: 'Firm thumb and palm gliding techniques with soothing warm olive oil to soothe spinal muscle spasms and fatigue.',
      descriptionUrdu: 'کمر کے پٹھوں کی سختی دور کرنے کے لیے نیم گرم زیتون کے تیل سے مالش۔',
      durationMinutes: 60,
      basePrice: 2500,
      homeVisitFee: 400,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'Wellness therapy only. Patients with spinal fractures or disc herniation must consult medical doctors.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'srv_6',
      name: 'Traditional Chatai Floor Massage & Stretch',
      nameUrdu: 'مستند روایتی چٹائی مساج اور اسٹریچنگ',
      categoryId: 'cat_chatai',
      description: 'Traditional Punjabi and Sindhi folk chatai session combining warm herbal oil application with gentle rhythmic assisted stretches on reed mat.',
      descriptionUrdu: 'روایتی انداز میں چٹائی پر نیم گرم ہربل تیل اور ہلکی اسٹریچنگ۔',
      durationMinutes: 75,
      basePrice: 3000,
      homeVisitFee: 450,
      homeVisitAllowed: true,
      serviceCentreAllowed: true,
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
      active: true,
      boundariesNotice: 'Safe, moderate flexibility stretches only.',
      createdAt: new Date().toISOString(),
    },
  ];

  const serviceAreas: ServiceArea[] = [
    {
      id: 'area_sukkur',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Sukkur',
      cityUrdu: 'سکھر',
      areas: ['Military Road', 'Minara Road', 'Barrage Colony', 'Shikarpur Road', 'New Pind', 'Bunder Road'],
      enabled: true,
    },
    {
      id: 'area_karachi',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      cityUrdu: 'کراچی',
      areas: ['Clifton', 'DHA Phases 1-8', 'Gulshan-e-Iqbal', 'PECHS', 'North Nazimabad', 'Bahria Town Karachi', 'Gulistan-e-Jauhar', 'Malir Cantt'],
      enabled: true,
    },
    {
      id: 'area_lahore',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Lahore',
      cityUrdu: 'لاہور',
      areas: ['Gulberg', 'DHA Phases 1-6', 'Model Town', 'Johar Town', 'Cantt', 'Bahria Town Lahore', 'Faisal Town', 'Garden Town'],
      enabled: true,
    },
    {
      id: 'area_islamabad',
      country: 'Pakistan',
      province: 'Federal Capital',
      city: 'Islamabad',
      cityUrdu: 'اسلام آباد',
      areas: ['F-6 & F-7', 'F-8 & F-10', 'F-11', 'G-11 & G-13', 'E-7 & E-11', 'Bahria Town Phase 1-8', 'DHA Islamabad'],
      enabled: true,
    },
    {
      id: 'area_rawalpindi',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Rawalpindi',
      cityUrdu: 'راولپنڈی',
      areas: ['Saddar', 'Westridge', 'Chaklala Scheme 3', 'Satellite Town', 'Peshawar Road', 'Askari 14'],
      enabled: true,
    },
    {
      id: 'area_multan',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Multan',
      cityUrdu: 'ملتان',
      areas: ['Cantt', 'Gulgasht Colony', 'Bosan Road', 'Wapda Town', 'Shah Rukn-e-Alam'],
      enabled: true,
    },
    {
      id: 'area_faisalabad',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Faisalabad',
      cityUrdu: 'فیصل آباد',
      areas: ['Madina Town', 'Civil Lines', 'Canal Road', 'D Ground Peoples Colony', 'Kohinoor City'],
      enabled: true,
    },
  ];

  const users: User[] = [
    {
      id: adminId,
      email: 'admin@oilcare.pk',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '+92 300 1234567',
      city: 'Karachi',
      area: 'Clifton',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: worker1Id,
      email: 'rashid@oilcare.pk',
      fullName: 'Rashid Khan',
      role: 'worker',
      phone: '+92 301 9876543',
      city: 'Sukkur',
      area: 'Military Road',
      createdAt: '2026-02-10T00:00:00.000Z',
    },
    {
      id: worker2Id,
      email: 'tariq@oilcare.pk',
      fullName: 'Muhammad Tariq',
      role: 'worker',
      phone: '+92 321 4567890',
      city: 'Karachi',
      area: 'Clifton',
      createdAt: '2026-02-15T00:00:00.000Z',
    },
    {
      id: worker3Id,
      email: 'zahid@oilcare.pk',
      fullName: 'Zahid Mehmood',
      role: 'worker',
      phone: '+92 333 1122334',
      city: 'Lahore',
      area: 'Gulberg',
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: worker4Id,
      email: 'bilal@oilcare.pk',
      fullName: 'Bilal Ahmed',
      role: 'worker',
      phone: '+92 345 5566778',
      city: 'Islamabad',
      area: 'F-7',
      createdAt: '2026-03-05T00:00:00.000Z',
    },
    {
      id: customerId,
      email: 'ahmed@gmail.com',
      fullName: 'Ahmed Waheed',
      role: 'customer',
      phone: '+92 312 9988776',
      city: 'Karachi',
      area: 'DHA Phases 1-8',
      preferredAreas: ['Clifton', 'DHA Phases 1-8'],
      createdAt: '2026-03-10T00:00:00.000Z',
    },
  ];

  const passwords: Record<string, string> = {
    [adminId]: hashPassword('admin123'),
    [worker1Id]: hashPassword('worker123'),
    [worker2Id]: hashPassword('worker123'),
    [worker3Id]: hashPassword('worker123'),
    [worker4Id]: hashPassword('worker123'),
    [customerId]: hashPassword('customer123'),
  };

  const workerProfiles: WorkerProfile[] = [
    {
      id: 'wp_1',
      userId: worker1Id,
      displayName: 'Ustad Rashid Khan',
      fullName: 'Rashid Khan',
      phone: '+92 301 9876543',
      email: 'rashid@oilcare.pk',
      bio: 'Master practitioner with 14 years of mastery in traditional Sindhi & Punjabi mustard oil champi and authentic chatai wellness. Trained in natural herbal pressure therapies.',
      experienceYears: 14,
      languages: ['Urdu', 'Sindhi', 'Punjabi'],
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      city: 'Sukkur',
      serviceAreas: ['Military Road', 'Minara Road', 'Barrage Colony', 'Shikarpur Road', 'New Pind'],
      approvedServices: ['srv_1', 'srv_2', 'srv_3', 'srv_6'],
      homeVisitAvailable: true,
      serviceCentreAvailable: true,
      serviceCentreAddress: 'Shop 12, Wellness Arcade, Near Barrage Colony, Sukkur',
      verificationStatus: 'approved',
      verificationDocType: 'CNIC Verified & Criminal Record Checked',
      verificationNotes: 'Physical identity and certificate verified by regional inspector.',
      rating: 4.9,
      reviewCount: 38,
      completedBookingsCount: 84,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHoursStart: '09:00',
      workingHoursEnd: '21:00',
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
    },
    {
      id: 'wp_2',
      userId: worker2Id,
      displayName: 'Muhammad Tariq Specialist',
      fullName: 'Muhammad Tariq',
      phone: '+92 321 4567890',
      email: 'tariq@oilcare.pk',
      bio: 'Certified wellness therapist specializing in deep tissue head-neck relief, almond oil body recovery, and corporate desk-fatigue rehabilitation.',
      experienceYears: 8,
      languages: ['Urdu', 'English', 'Pashto'],
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      city: 'Karachi',
      serviceAreas: ['Clifton', 'DHA Phases 1-8', 'PECHS', 'Gulshan-e-Iqbal'],
      approvedServices: ['srv_1', 'srv_2', 'srv_3', 'srv_4', 'srv_5'],
      homeVisitAvailable: true,
      serviceCentreAvailable: true,
      serviceCentreAddress: 'Suite 4B, Ocean Wellness Plaza, Clifton Block 4, Karachi',
      verificationStatus: 'approved',
      verificationDocType: 'NADRA CNIC Verified & Health Clearance',
      verificationNotes: 'Background check complete. Highly rated in South Karachi.',
      rating: 4.8,
      reviewCount: 29,
      completedBookingsCount: 62,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      workingHoursStart: '10:00',
      workingHoursEnd: '22:00',
      createdAt: '2026-02-15T00:00:00.000Z',
      updatedAt: '2026-02-15T00:00:00.000Z',
    },
    {
      id: 'wp_3',
      userId: worker3Id,
      displayName: 'Ustad Zahid Mehmood',
      fullName: 'Zahid Mehmood',
      phone: '+92 333 1122334',
      email: 'zahid@oilcare.pk',
      bio: 'Over 12 years bringing authentic herbal chatai massage to homes in Lahore. Renowned for gentle spine care, foot reflexology, and pure olive oil soothing therapy.',
      experienceYears: 12,
      languages: ['Urdu', 'Punjabi'],
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      city: 'Lahore',
      serviceAreas: ['Gulberg', 'DHA Phases 1-6', 'Model Town', 'Johar Town', 'Cantt'],
      approvedServices: ['srv_1', 'srv_2', 'srv_4', 'srv_5', 'srv_6'],
      homeVisitAvailable: true,
      serviceCentreAvailable: false,
      verificationStatus: 'approved',
      verificationDocType: 'CNIC & Character Certificate Verified',
      verificationNotes: 'Dedicated home service specialist with high repeat clientele.',
      rating: 4.9,
      reviewCount: 45,
      completedBookingsCount: 110,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHoursStart: '08:00',
      workingHoursEnd: '20:00',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'wp_4',
      userId: worker4Id,
      displayName: 'Bilal Ahmed Reflexologist',
      fullName: 'Bilal Ahmed',
      phone: '+92 345 5566778',
      email: 'bilal@oilcare.pk',
      bio: 'Professional massage therapist providing soothing relaxation massages, scalp acupressure, and custom oil treatments across the twin cities.',
      experienceYears: 6,
      languages: ['Urdu', 'English', 'Potohari'],
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      city: 'Islamabad',
      serviceAreas: ['F-6 & F-7', 'F-8 & F-10', 'E-7 & E-11', 'Bahria Town Phase 1-8'],
      approvedServices: ['srv_1', 'srv_3', 'srv_4', 'srv_5'],
      homeVisitAvailable: true,
      serviceCentreAvailable: true,
      serviceCentreAddress: 'Blue Area Commercial Centre, Sector F-7, Islamabad',
      verificationStatus: 'approved',
      verificationDocType: 'CNIC & Professional Diploma Verified',
      verificationNotes: 'Twin cities registered provider.',
      rating: 4.7,
      reviewCount: 18,
      completedBookingsCount: 35,
      workingDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      workingHoursStart: '10:00',
      workingHoursEnd: '21:00',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'bkg_1',
      bookingReference: 'OC-92014',
      customerId: customerId,
      customerName: 'Ahmed Waheed',
      customerPhone: '+92 312 9988776',
      customerEmail: 'ahmed@gmail.com',
      workerId: 'wp_2',
      workerName: 'Muhammad Tariq Specialist',
      workerPhone: '+92 321 4567890',
      serviceId: 'srv_1',
      serviceName: 'Authentic Mustard & Herbal Oil Champi',
      date: '2026-10-10',
      timeSlot: '11:00 AM - 12:00 PM',
      serviceMode: 'home_visit',
      city: 'Karachi',
      area: 'DHA Phases 1-8',
      addressDetails: 'House 42, Street 7, Phase 5, DHA, Karachi',
      specialInstructions: 'Please use extra herbal mustard oil for shoulders.',
      priceSnapshot: {
        basePrice: 2200,
        homeVisitFee: 400,
        totalPrice: 2600,
        platformCommission: 260,
        workerEarnings: 2340,
        currency: 'PKR',
      },
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'cash_on_delivery',
      reviewed: true,
      createdAt: '2026-10-09T14:20:00.000Z',
      updatedAt: '2026-10-10T12:15:00.000Z',
    },
    {
      id: 'bkg_2',
      bookingReference: 'OC-92015',
      customerId: customerId,
      customerName: 'Ahmed Waheed',
      customerPhone: '+92 312 9988776',
      customerEmail: 'ahmed@gmail.com',
      workerId: 'wp_2',
      workerName: 'Muhammad Tariq Specialist',
      workerPhone: '+92 321 4567890',
      serviceId: 'srv_3',
      serviceName: 'Executive Head, Neck & Upper Back Relief',
      date: '2026-10-18',
      timeSlot: '04:00 PM - 05:00 PM',
      serviceMode: 'service_centre',
      city: 'Karachi',
      area: 'Clifton',
      addressDetails: 'Suite 4B, Ocean Wellness Plaza, Clifton Block 4, Karachi',
      specialInstructions: 'Desk strain relief.',
      priceSnapshot: {
        basePrice: 1800,
        homeVisitFee: 0,
        totalPrice: 1800,
        platformCommission: 180,
        workerEarnings: 1620,
        currency: 'PKR',
      },
      status: 'Confirmed',
      paymentStatus: 'Unpaid',
      paymentMethod: 'cash_on_delivery',
      reviewed: false,
      createdAt: '2026-10-14T09:00:00.000Z',
      updatedAt: '2026-10-14T09:30:00.000Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      bookingId: 'bkg_1',
      bookingReference: 'OC-92014',
      customerId: customerId,
      customerName: 'Ahmed Waheed',
      workerId: 'wp_2',
      serviceId: 'srv_1',
      serviceName: 'Authentic Mustard & Herbal Oil Champi',
      rating: 5,
      comment:
        'Outstanding traditional champi. Tariq Bhai was punctual, extremely respectful of home boundaries, and the warm herbal oil gave immense relief to my back stiffness. Highly recommended!',
      createdAt: '2026-10-10T13:00:00.000Z',
    },
  ];

  const adminAuditLogs: AdminAuditLog[] = [
    {
      id: 'log_1',
      adminId: adminId,
      adminEmail: 'admin@oilcare.pk',
      action: 'PLATFORM_INITIALIZATION',
      details: 'Platform initialized with verified service catalogue, cities, and initial workers.',
      timestamp: new Date().toISOString(),
    },
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'tkt_1',
      userId: customerId,
      userName: 'Ahmed Waheed',
      userEmail: 'ahmed@gmail.com',
      subject: 'Inquiry regarding corporate wellness booking',
      message: 'Can we book 3 workers simultaneously for a small family gathering?',
      status: 'resolved',
      createdAt: '2026-10-11T10:00:00.000Z',
    },
  ];

  return {
    users,
    passwords,
    workerProfiles,
    services,
    serviceCategories: categories,
    serviceAreas,
    bookings,
    reviews,
    platformSettings: defaultSettings,
    adminAuditLogs,
    supportTickets,
  };
}

// Atomic database file management
let memoryDb: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Validate schema presence
      if (parsed.users && parsed.workerProfiles && parsed.services && parsed.bookings) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse database file, resetting to initial seed:', err);
  }
  const seed = generateInitialSeed();
  saveDatabase(seed);
  return seed;
}

function saveDatabase(db: DatabaseSchema) {
  memoryDb = db;
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

memoryDb = loadDatabase();

// Session / Token Store (In-memory server session tokens)
const sessions = new Map<string, { userId: string; role: string; email: string }>();

function createSession(user: User): string {
  const token = 'token_' + crypto.randomBytes(24).toString('hex');
  sessions.set(token, { userId: user.id, role: user.role, email: user.email });
  return token;
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const token = authHeader.substring(7);
  const session = sessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  (req as any).user = session;
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Platform Settings
app.get('/api/settings', (_req, res) => {
  res.json(memoryDb.platformSettings);
});

app.put('/api/settings', authMiddleware, requireRole(['admin']), (req, res) => {
  const updates = req.body;
  memoryDb.platformSettings = { ...memoryDb.platformSettings, ...updates };

  const log: AdminAuditLog = {
    id: 'log_' + Date.now(),
    adminId: (req as any).user.userId,
    adminEmail: (req as any).user.email,
    action: 'SETTINGS_UPDATE',
    details: `Updated platform business settings: ${Object.keys(updates).join(', ')}`,
    timestamp: new Date().toISOString(),
  };
  memoryDb.adminAuditLogs.unshift(log);
  saveDatabase(memoryDb);
  res.json({ success: true, settings: memoryDb.platformSettings });
});

// 2. Authentication
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, role, phone, city, area } = req.body;
  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: 'Email, password, full name, and role are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (memoryDb.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  const userId = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const newUser: User = {
    id: userId,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: role === 'worker' ? 'worker' : 'customer',
    phone: phone?.trim(),
    city: city?.trim() || 'Karachi',
    area: area?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  memoryDb.users.push(newUser);
  memoryDb.passwords[userId] = hashPassword(password);

  // If worker, register worker profile in Pending status
  if (role === 'worker') {
    const workerProfile: WorkerProfile = {
      id: 'wp_' + Date.now(),
      userId,
      displayName: req.body.displayName?.trim() || fullName.trim(),
      fullName: fullName.trim(),
      phone: phone?.trim() || '',
      email: normalizedEmail,
      bio: req.body.bio?.trim() || 'New traditional massage professional offering high quality service.',
      experienceYears: Number(req.body.experienceYears) || 1,
      languages: req.body.languages || ['Urdu'],
      profilePhoto:
        req.body.profilePhoto ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      city: city?.trim() || 'Karachi',
      serviceAreas: req.body.serviceAreas || (area ? [area] : ['City Center']),
      approvedServices: req.body.approvedServices || ['srv_1'],
      homeVisitAvailable: req.body.homeVisitAvailable !== false,
      serviceCentreAvailable: req.body.serviceCentreAvailable === true,
      serviceCentreAddress: req.body.serviceCentreAddress || '',
      verificationStatus: 'pending',
      verificationDocType: req.body.verificationDocType || 'CNIC Submitted for Review',
      verificationNotes: 'Pending administrative verification review.',
      rating: 5.0,
      reviewCount: 0,
      completedBookingsCount: 0,
      workingDays: req.body.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHoursStart: req.body.workingHoursStart || '09:00',
      workingHoursEnd: req.body.workingHoursEnd || '21:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.workerProfiles.push(workerProfile);
  }

  saveDatabase(memoryDb);
  const token = createSession(newUser);
  res.status(201).json({
    token,
    user: newUser,
    workerProfile:
      role === 'worker'
        ? memoryDb.workerProfiles.find((wp) => wp.userId === userId)
        : undefined,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = memoryDb.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'This account has been suspended by administration.' });
    return;
  }

  const expectedHash = memoryDb.passwords[user.id];
  const inputHash = hashPassword(password);
  if (expectedHash !== inputHash) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = createSession(user);
  const workerProfile =
    user.role === 'worker'
      ? memoryDb.workerProfiles.find((wp) => wp.userId === user.id)
      : undefined;

  res.json({ token, user, workerProfile });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const sessionUser = (req as any).user;
  const user = memoryDb.users.find((u) => u.id === sessionUser.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const workerProfile =
    user.role === 'worker'
      ? memoryDb.workerProfiles.find((wp) => wp.userId === user.id)
      : undefined;
  res.json({ user, workerProfile });
});

app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const sessionUser = (req as any).user;
  const userIndex = memoryDb.users.findIndex((u) => u.id === sessionUser.userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { fullName, phone, city, area, preferredAreas, avatarUrl } = req.body;
  if (fullName) memoryDb.users[userIndex].fullName = fullName.trim();
  if (phone !== undefined) memoryDb.users[userIndex].phone = phone?.trim();
  if (city) memoryDb.users[userIndex].city = city.trim();
  if (area) memoryDb.users[userIndex].area = area.trim();
  if (preferredAreas) memoryDb.users[userIndex].preferredAreas = preferredAreas;
  if (avatarUrl) memoryDb.users[userIndex].avatarUrl = avatarUrl;

  saveDatabase(memoryDb);
  res.json({ success: true, user: memoryDb.users[userIndex] });
});

// 3. Services & Categories
app.get('/api/services', (_req, res) => {
  res.json(memoryDb.services);
});

app.post('/api/services', authMiddleware, requireRole(['admin']), (req, res) => {
  const {
    name,
    nameUrdu,
    categoryId,
    description,
    descriptionUrdu,
    durationMinutes,
    basePrice,
    homeVisitFee,
    homeVisitAllowed,
    serviceCentreAllowed,
    imageUrl,
    boundariesNotice,
  } = req.body;

  if (!name || !categoryId || !basePrice) {
    res.status(400).json({ error: 'Service name, category, and base price are required.' });
    return;
  }

  const newService: Service = {
    id: 'srv_' + Date.now(),
    name: name.trim(),
    nameUrdu: nameUrdu?.trim() || '',
    categoryId,
    description: description?.trim() || '',
    descriptionUrdu: descriptionUrdu?.trim() || '',
    durationMinutes: Number(durationMinutes) || 60,
    basePrice: Number(basePrice),
    homeVisitFee: Number(homeVisitFee) || 0,
    homeVisitAllowed: homeVisitAllowed !== false,
    serviceCentreAllowed: serviceCentreAllowed !== false,
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
    active: true,
    boundariesNotice: boundariesNotice?.trim(),
    createdAt: new Date().toISOString(),
  };

  memoryDb.services.push(newService);
  saveDatabase(memoryDb);
  res.status(201).json(newService);
});

app.put('/api/services/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const serviceIndex = memoryDb.services.findIndex((s) => s.id === req.params.id);
  if (serviceIndex === -1) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }
  memoryDb.services[serviceIndex] = { ...memoryDb.services[serviceIndex], ...req.body };
  saveDatabase(memoryDb);
  res.json(memoryDb.services[serviceIndex]);
});

app.delete('/api/services/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const serviceIndex = memoryDb.services.findIndex((s) => s.id === req.params.id);
  if (serviceIndex === -1) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }
  memoryDb.services.splice(serviceIndex, 1);
  saveDatabase(memoryDb);
  res.json({ success: true, message: 'Service removed successfully.' });
});

app.get('/api/categories', (_req, res) => {
  res.json(memoryDb.serviceCategories);
});

app.post('/api/categories', authMiddleware, requireRole(['admin']), (req, res) => {
  const { name, nameUrdu, slug, description, iconName } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: 'Category name and slug are required.' });
    return;
  }
  const newCat: ServiceCategory = {
    id: 'cat_' + Date.now(),
    name: name.trim(),
    nameUrdu: nameUrdu?.trim() || '',
    slug: slug.trim(),
    description: description?.trim() || '',
    iconName: iconName || 'Droplet',
    displayOrder: memoryDb.serviceCategories.length + 1,
    active: true,
  };
  memoryDb.serviceCategories.push(newCat);
  saveDatabase(memoryDb);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const catIndex = memoryDb.serviceCategories.findIndex((c) => c.id === req.params.id);
  if (catIndex === -1) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  memoryDb.serviceCategories[catIndex] = { ...memoryDb.serviceCategories[catIndex], ...req.body };
  saveDatabase(memoryDb);
  res.json(memoryDb.serviceCategories[catIndex]);
});

// 4. Service Areas
app.get('/api/service-areas', (_req, res) => {
  res.json(memoryDb.serviceAreas);
});

app.put('/api/service-areas', authMiddleware, requireRole(['admin']), (req, res) => {
  if (Array.isArray(req.body.serviceAreas)) {
    memoryDb.serviceAreas = req.body.serviceAreas;
    saveDatabase(memoryDb);
    res.json({ success: true, serviceAreas: memoryDb.serviceAreas });
  } else {
    res.status(400).json({ error: 'serviceAreas array required.' });
  }
});

// 5. Workers Discovery & Profiles
app.get('/api/workers', (req, res) => {
  const { city, area, serviceId, minRating, maxPrice, mode, showAll } = req.query;
  const user = (req as any).user;
  const isAdmin = user && user.role === 'admin';

  let list = memoryDb.workerProfiles;

  // Unless admin viewing with showAll, only return approved non-suspended workers
  if (!isAdmin || showAll !== 'true') {
    list = list.filter((w) => w.verificationStatus === 'approved');
  }

  if (city) {
    list = list.filter((w) => w.city.toLowerCase() === String(city).toLowerCase());
  }

  if (area) {
    const areaStr = String(area).toLowerCase();
    list = list.filter((w) =>
      w.serviceAreas.some((a) => a.toLowerCase().includes(areaStr))
    );
  }

  if (serviceId) {
    list = list.filter((w) => w.approvedServices.includes(String(serviceId)));
  }

  if (minRating) {
    list = list.filter((w) => w.rating >= Number(minRating));
  }

  if (mode === 'home_visit') {
    list = list.filter((w) => w.homeVisitAvailable);
  } else if (mode === 'service_centre') {
    list = list.filter((w) => w.serviceCentreAvailable);
  }

  // Remove private fields for public output
  const publicList = list.map((w) => ({
    id: w.id,
    userId: w.userId,
    displayName: w.displayName,
    experienceYears: w.experienceYears,
    languages: w.languages,
    profilePhoto: w.profilePhoto,
    city: w.city,
    serviceAreas: w.serviceAreas,
    approvedServices: w.approvedServices,
    homeVisitAvailable: w.homeVisitAvailable,
    serviceCentreAvailable: w.serviceCentreAvailable,
    serviceCentreAddress: w.serviceCentreAddress,
    verificationStatus: w.verificationStatus,
    rating: w.rating,
    reviewCount: w.reviewCount,
    completedBookingsCount: w.completedBookingsCount,
    workingDays: w.workingDays,
    workingHoursStart: w.workingHoursStart,
    workingHoursEnd: w.workingHoursEnd,
    bio: w.bio,
    // Admin only fields attached if admin
    ...(isAdmin ? { phone: w.phone, email: w.email, fullName: w.fullName, verificationNotes: w.verificationNotes, verificationDocType: w.verificationDocType } : {}),
  }));

  res.json(publicList);
});

app.get('/api/workers/:id', (req, res) => {
  const worker = memoryDb.workerProfiles.find((w) => w.id === req.params.id);
  if (!worker) {
    res.status(404).json({ error: 'Worker not found.' });
    return;
  }

  const reviews = memoryDb.reviews.filter((r) => r.workerId === worker.id);
  const workerServices = memoryDb.services.filter((s) => worker.approvedServices.includes(s.id));

  // Sanitize private documents/phones for public
  const publicProfile = {
    ...worker,
    phone: undefined, // Hide raw phone from direct scraping
    email: undefined,
  };

  res.json({ worker: publicProfile, reviews, services: workerServices });
});

app.put('/api/workers/:id', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const workerIndex = memoryDb.workerProfiles.findIndex((w) => w.id === req.params.id);
  if (workerIndex === -1) {
    res.status(404).json({ error: 'Worker profile not found.' });
    return;
  }

  const isOwner = memoryDb.workerProfiles[workerIndex].userId === user.userId;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Not authorized to edit this worker profile.' });
    return;
  }

  const incoming = req.body;
  // If worker edits, do NOT allow self-approval
  if (isOwner && !isAdmin) {
    delete incoming.verificationStatus;
    delete incoming.rating;
    delete incoming.reviewCount;
    delete incoming.completedBookingsCount;
  }

  memoryDb.workerProfiles[workerIndex] = {
    ...memoryDb.workerProfiles[workerIndex],
    ...incoming,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(memoryDb);
  res.json({ success: true, worker: memoryDb.workerProfiles[workerIndex] });
});

app.post('/api/workers/:id/status', authMiddleware, requireRole(['admin']), (req, res) => {
  const { status, notes } = req.body;
  const workerIndex = memoryDb.workerProfiles.findIndex((w) => w.id === req.params.id);
  if (workerIndex === -1) {
    res.status(404).json({ error: 'Worker profile not found.' });
    return;
  }

  memoryDb.workerProfiles[workerIndex].verificationStatus = status;
  if (notes) memoryDb.workerProfiles[workerIndex].verificationNotes = notes;
  memoryDb.workerProfiles[workerIndex].updatedAt = new Date().toISOString();

  const log: AdminAuditLog = {
    id: 'log_' + Date.now(),
    adminId: (req as any).user.userId,
    adminEmail: (req as any).user.email,
    action: `WORKER_STATUS_${status.toUpperCase()}`,
    details: `Updated worker ${memoryDb.workerProfiles[workerIndex].displayName} status to ${status}. Notes: ${notes || 'none'}`,
    timestamp: new Date().toISOString(),
  };
  memoryDb.adminAuditLogs.unshift(log);
  saveDatabase(memoryDb);

  res.json({ success: true, worker: memoryDb.workerProfiles[workerIndex] });
});

// 6. Bookings
app.get('/api/bookings', authMiddleware, (req, res) => {
  const user = (req as any).user;
  let list = memoryDb.bookings;

  if (user.role === 'customer') {
    list = list.filter((b) => b.customerId === user.userId);
  } else if (user.role === 'worker') {
    const workerProfile = memoryDb.workerProfiles.find((wp) => wp.userId === user.userId);
    if (!workerProfile) {
      res.json([]);
      return;
    }
    list = list.filter((b) => b.workerId === workerProfile.id);
  }
  // Admins see all

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.get('/api/bookings/:id', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const booking = memoryDb.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  // Access control
  if (user.role === 'customer' && booking.customerId !== user.userId) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }
  if (user.role === 'worker') {
    const wp = memoryDb.workerProfiles.find((w) => w.userId === user.userId);
    if (!wp || wp.id !== booking.workerId) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
  }

  res.json(booking);
});

app.post('/api/bookings', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const {
    serviceId,
    workerId,
    date,
    timeSlot,
    serviceMode,
    customerName,
    customerPhone,
    city,
    area,
    addressDetails,
    specialInstructions,
  } = req.body;

  if (!serviceId || !workerId || !date || !timeSlot || !serviceMode || !customerPhone || !city || !addressDetails) {
    res.status(400).json({ error: 'Missing required booking fields.' });
    return;
  }

  // Verify Worker
  const worker = memoryDb.workerProfiles.find((w) => w.id === workerId);
  if (!worker || worker.verificationStatus !== 'approved') {
    res.status(400).json({ error: 'Selected worker is unavailable or unapproved.' });
    return;
  }

  // Verify Service
  const service = memoryDb.services.find((s) => s.id === serviceId && s.active);
  if (!service) {
    res.status(400).json({ error: 'Selected service is invalid or inactive.' });
    return;
  }

  // Double Booking Prevention
  const existingWorkerBookings = memoryDb.bookings.filter((b) => b.workerId === workerId);
  const conflict = hasBookingConflict(
    existingWorkerBookings.map((b) => ({
      date: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
    })),
    date,
    timeSlot
  );

  if (conflict) {
    res.status(409).json({
      error: 'The selected worker is already booked for this date and time. Please choose another slot.',
    });
    return;
  }

  // Trusted price calculation on server
  const priceSnapshot = calculateBookingPrice(
    {
      basePrice: service.basePrice,
      serviceMode,
      homeVisitFee: service.homeVisitFee,
      commissionPercentage: memoryDb.platformSettings.platformCommissionPercentage,
    },
    memoryDb.platformSettings.currency
  );

  const bookingRef = 'OC-' + Math.floor(10000 + Math.random() * 90000);
  const newBooking: Booking = {
    id: 'bkg_' + Date.now(),
    bookingReference: bookingRef,
    customerId: user.userId,
    customerName: customerName || user.email,
    customerPhone: customerPhone.trim(),
    customerEmail: user.email,
    workerId: worker.id,
    workerName: worker.displayName,
    workerPhone: worker.phone,
    serviceId: service.id,
    serviceName: service.name,
    date,
    timeSlot,
    serviceMode,
    city,
    area: area || '',
    addressDetails: addressDetails.trim(),
    specialInstructions: specialInstructions?.trim() || '',
    priceSnapshot,
    status: 'Pending',
    paymentStatus: 'Unpaid',
    paymentMethod: 'cash_on_delivery',
    reviewed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDb.bookings.push(newBooking);
  saveDatabase(memoryDb);

  res.status(201).json({ success: true, booking: newBooking });
});

app.put('/api/bookings/:id/status', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { status, reason } = req.body as { status: BookingStatus; reason?: string };

  const bookingIndex = memoryDb.bookings.findIndex((b) => b.id === req.params.id);
  if (bookingIndex === -1) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const booking = memoryDb.bookings[bookingIndex];
  const userRole = user.role as 'admin' | 'worker' | 'customer';

  // Authorization check
  if (userRole === 'customer' && booking.customerId !== user.userId) {
    res.status(403).json({ error: 'Not authorized.' });
    return;
  }
  if (userRole === 'worker') {
    const wp = memoryDb.workerProfiles.find((w) => w.userId === user.userId);
    if (!wp || wp.id !== booking.workerId) {
      res.status(403).json({ error: 'Not authorized.' });
      return;
    }
  }

  // Validate state machine
  const valid = isValidStatusTransition(booking.status, status, userRole);
  if (!valid) {
    res.status(400).json({
      error: `Invalid status transition from ${booking.status} to ${status} by ${userRole}.`,
    });
    return;
  }

  // If cancellation, evaluate policy
  if (status === 'Cancelled') {
    const cancelEval = evaluateCancellationPolicy(booking.date, booking.timeSlot);
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledBy = userRole;
    if (!cancelEval.eligibleForFreeCancel && userRole === 'customer') {
      booking.cancellationFee = Math.round(booking.priceSnapshot.totalPrice * 0.2); // 20% late cancel fee
    }
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  // If completed, update worker statistics
  if (status === 'Completed') {
    booking.paymentStatus = 'Paid';
    const wpIndex = memoryDb.workerProfiles.findIndex((w) => w.id === booking.workerId);
    if (wpIndex !== -1) {
      memoryDb.workerProfiles[wpIndex].completedBookingsCount += 1;
    }
  }

  if (userRole === 'admin') {
    memoryDb.adminAuditLogs.unshift({
      id: 'log_' + Date.now(),
      adminId: user.userId,
      adminEmail: user.email,
      action: `BOOKING_STATUS_${status.toUpperCase()}`,
      details: `Admin changed booking ${booking.bookingReference} status to ${status}`,
      timestamp: new Date().toISOString(),
    });
  }

  saveDatabase(memoryDb);
  res.json({ success: true, booking });
});

// 7. Reviews
app.post('/api/reviews', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating || !comment) {
    res.status(400).json({ error: 'Booking ID, rating, and comment are required.' });
    return;
  }

  const booking = memoryDb.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  if (booking.customerId !== user.userId) {
    res.status(403).json({ error: 'You can only review your own bookings.' });
    return;
  }

  if (booking.status !== 'Completed') {
    res.status(400).json({ error: 'Reviews can only be submitted for completed appointments.' });
    return;
  }

  if (booking.reviewed) {
    res.status(400).json({ error: 'This booking has already been reviewed.' });
    return;
  }

  const numRating = Math.min(5, Math.max(1, Number(rating)));

  const review: Review = {
    id: 'rev_' + Date.now(),
    bookingId: booking.id,
    bookingReference: booking.bookingReference,
    customerId: user.userId,
    customerName: booking.customerName,
    workerId: booking.workerId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    rating: numRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  memoryDb.reviews.unshift(review);
  booking.reviewed = true;

  // Recalculate worker rating
  const workerReviews = memoryDb.reviews.filter((r) => r.workerId === booking.workerId);
  const avgRating =
    workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
  const wpIndex = memoryDb.workerProfiles.findIndex((w) => w.id === booking.workerId);
  if (wpIndex !== -1) {
    memoryDb.workerProfiles[wpIndex].rating = Math.round(avgRating * 10) / 10;
    memoryDb.workerProfiles[wpIndex].reviewCount = workerReviews.length;
  }

  saveDatabase(memoryDb);
  res.status(201).json({ success: true, review });
});

// 8. Admin Overview & Reports
app.get('/api/admin/overview', authMiddleware, requireRole(['admin']), (_req, res) => {
  const totalCustomers = memoryDb.users.filter((u) => u.role === 'customer').length;
  const totalWorkers = memoryDb.workerProfiles.length;
  const pendingApprovals = memoryDb.workerProfiles.filter(
    (w) => w.verificationStatus === 'pending'
  ).length;

  const totalBookings = memoryDb.bookings.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = memoryDb.bookings.filter((b) => b.date === todayStr).length;
  const completedBookings = memoryDb.bookings.filter((b) => b.status === 'Completed').length;
  const cancelledBookings = memoryDb.bookings.filter((b) => b.status === 'Cancelled').length;

  const grossBookingValue = memoryDb.bookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + b.priceSnapshot.totalPrice, 0);

  const totalPlatformCommission = memoryDb.bookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + b.priceSnapshot.platformCommission, 0);

  res.json({
    totalCustomers,
    totalWorkers,
    pendingApprovals,
    totalBookings,
    todayBookings,
    completedBookings,
    cancelledBookings,
    grossBookingValue,
    totalPlatformCommission,
    currency: memoryDb.platformSettings.currency,
  });
});

app.get('/api/admin/audit-logs', authMiddleware, requireRole(['admin']), (_req, res) => {
  res.json(memoryDb.adminAuditLogs.slice(0, 100));
});

app.get('/api/admin/reports/csv', authMiddleware, requireRole(['admin']), (_req, res) => {
  const headers = [
    'Booking Reference',
    'Date',
    'Time Slot',
    'Customer',
    'Phone',
    'Worker',
    'Service',
    'Service Mode',
    'City',
    'Total (PKR)',
    'Commission (PKR)',
    'Status',
    'Payment Status',
    'Created At',
  ];

  const rows = memoryDb.bookings.map((b) => [
    b.bookingReference,
    b.date,
    `"${b.timeSlot}"`,
    `"${b.customerName}"`,
    `"${b.customerPhone}"`,
    `"${b.workerName}"`,
    `"${b.serviceName}"`,
    b.serviceMode,
    b.city,
    b.priceSnapshot.totalPrice,
    b.priceSnapshot.platformCommission,
    b.status,
    b.paymentStatus,
    b.createdAt,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="oilcare_bookings_report.csv"');
  res.send(csv);
});

// 9. Support Tickets
app.post('/api/support', (req, res) => {
  const { name, email, subject, message, userId } = req.body;
  if (!email || !subject || !message) {
    res.status(400).json({ error: 'Email, subject, and message are required.' });
    return;
  }
  const ticket: SupportTicket = {
    id: 'tkt_' + Date.now(),
    userId: userId || 'guest',
    userName: name || 'Guest User',
    userEmail: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  memoryDb.supportTickets.unshift(ticket);
  saveDatabase(memoryDb);
  res.status(201).json({ success: true, ticketId: ticket.id });
});

app.get('/api/support', authMiddleware, requireRole(['admin']), (_req, res) => {
  res.json(memoryDb.supportTickets);
});

app.put('/api/support/:id/resolve', authMiddleware, requireRole(['admin']), (req, res) => {
  const ticket = memoryDb.supportTickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }
  ticket.status = 'resolved';
  saveDatabase(memoryDb);
  res.json({ success: true, ticket });
});

// 10. SEO: Robots.txt & Dynamic Sitemap.xml
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /services
Allow: /workers
Allow: /how-it-works
Allow: /safety
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

Sitemap: ${process.env.APP_URL || 'http://localhost:3000'}/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req, res) => {
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const activeServices = memoryDb.services.filter((s) => s.active);
  const enabledCities = memoryDb.serviceAreas.filter((a) => a.enabled);

  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/services`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/workers`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/how-it-works`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/safety`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/become-worker`, priority: '0.8', changefreq: 'weekly' },
    ...activeServices.map((s) => ({
      loc: `${baseUrl}/services/${s.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...enabledCities.map((c) => ({
      loc: `${baseUrl}/locations/${c.city.toLowerCase()}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`OilCare server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
