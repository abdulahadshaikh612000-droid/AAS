export type Language = 'en' | 'ur';

export interface Translations {
  [key: string]: {
    en: string;
    ur: string;
  };
}

export const translations: Translations = {
  // Navigation
  navHome: { en: 'Home', ur: 'ہوم' },
  navServices: { en: 'Services', ur: 'خدمات' },
  navWorkers: { en: 'Find a Worker', ur: 'مساج ماہر تلاش کریں' },
  navHowItWorks: { en: 'How It Works', ur: 'طریقہ کار' },
  navSafety: { en: 'Safety Guidelines', ur: 'حفاظتی رہنمائی' },
  navBecomeWorker: { en: 'Become a Worker', ur: 'ماہر بنیں' },
  navContact: { en: 'Contact', ur: 'رابطہ' },
  navLogin: { en: 'Login', ur: 'لاگ اِن' },
  navRegister: { en: 'Register', ur: 'اکاؤنٹ بنائیں' },
  navMyBookings: { en: 'My Bookings', ur: 'میری بکنگز' },
  navWorkerDashboard: { en: 'Worker Portal', ur: 'ماہر کا پورٹل' },
  navAdminDashboard: { en: 'Admin Dashboard', ur: 'ایڈمن ڈیش بورڈ' },
  navLogout: { en: 'Sign Out', ur: 'لاگ آؤٹ' },

  // Hero Section
  heroTitle: {
    en: 'Book Trusted Massage & Wellness Services Near You',
    ur: 'اپنے قریبی بااعتماد اور تصدیق شدہ مالش ماہرین بک کریں',
  },
  heroSubtitle: {
    en: 'Discover experienced service professionals, compare prices, and book a convenient appointment in your area.',
    ur: 'تجربہ کار مالش ماہرین دریافت کریں، قیمتوں کا موازنہ کریں اور اپنے علاقے میں آسانی سے وقت بک کریں۔',
  },
  selectCity: { en: 'Select City', ur: 'شہر منتخب کریں' },
  selectArea: { en: 'Select Area', ur: 'علاقہ منتخب کریں' },
  allCategories: { en: 'All Categories', ur: 'تمام کیٹیگریز' },
  searchWorkersBtn: { en: 'Search Available Workers', ur: 'دستیاب ماہرین تلاش کریں' },
  useMyLocation: { en: 'Use Current Location', ur: 'موجودہ لوکیشن استعمال کریں' },

  // Badges & Features
  verifiedWorkersBadge: { en: '100% CNIC Verified Workers', ur: '100٪ تصدیق شدہ شناختی کارڈ' },
  hygienePledge: { en: 'Clean Traditional Chatai & Herbal Oils', ur: 'صاف ستھری روایتی چٹائی اور خالص تیل' },
  transparentPricing: { en: 'Transparent PKR Pricing', ur: 'شفاف قیمتیں (روپے میں)' },
  cashOnDelivery: { en: 'Cash on Service Completion', ur: 'خدمت کے بعد نقد ادائیگی' },

  // Sections
  featuredServices: { en: 'Our Specialized Wellness Services', ur: 'ہماری مخصوص فلاحی خدمات' },
  featuredServicesSub: {
    en: 'Traditional oil massage, relaxing champi, and authentic chatai wellness practiced with highest hygiene standards.',
    ur: 'خالص جڑی بوٹیوں اور تیل سے روایتی چمپی اور چٹائی تھراپی۔',
  },
  featuredWorkers: { en: 'Featured Verified Specialists', ur: 'نمایاں تصدیق شدہ ماہرین' },
  featuredWorkersSub: {
    en: 'Background-checked, experienced, and highly rated traditional service providers ready for home or centre visits.',
    ur: 'پس منظر سے تصدیق شدہ اور بہترین ریٹنگ یافتہ پیشہ ور افراد۔',
  },
  howBookingWorks: { en: 'How Booking Works in 3 Steps', ur: 'بکنگ کا آسان طریقہ (3 مراحل)' },
  step1Title: { en: '1. Select Service & Worker', ur: '۱. سروس اور ماہر کا انتخاب' },
  step1Desc: {
    en: 'Browse certified specialists in your city, check reviews, experience, and transparent prices.',
    ur: 'اپنے شہر میں تصدیق شدہ ماہرین کی پروفائلز اور جائزے دیکھیں۔',
  },
  step2Title: { en: '2. Choose Date & Location', ur: '۲. تاریخ اور وقت طے کریں' },
  step2Desc: {
    en: 'Pick your preferred date, time slot, and choose between a home visit or visiting the worker’s wellness centre.',
    ur: 'اپنی سہولت کے مطابق وقت اور گھر پر سروس یا سینٹر کا انتخاب کریں۔',
  },
  step3Title: { en: '3. Relax & Pay on Completion', ur: '۳. سروس کے بعد آرام سے ادائیگی' },
  step3Desc: {
    en: 'Your specialist arrives promptly with equipment. Enjoy your therapy and pay cash directly after service.',
    ur: 'ماہر وقت پر پہنچ کر سروس فراہم کرے گا اور بعد میں نقد ادائیگی کریں۔',
  },

  // Trust section
  whyChooseUs: { en: 'Why Choose Our Platform', ur: 'ہماری خدمات کا انتخاب کیوں کریں؟' },
  why1Title: { en: 'Rigorous Verification', ur: 'سخت شناختی تصدیق' },
  why1Desc: {
    en: 'Every worker undergoes identity checks, background verification, and adherence to professional ethics.',
    ur: 'ہر ماہر کی نادرا شناختی کارڈ اور پس منظر کی تصدیق کی جاتی ہے۔',
  },
  why2Title: { en: 'Strict Personal Safety', ur: 'ذاتی تحفظ کی ضمانت' },
  why2Desc: {
    en: 'Zero tolerance for harassment or inappropriate conduct. Boundaries and modesty are strictly maintained.',
    ur: 'نامناسب رویے کی سختی سے ممانعت۔ مکمل پرائیویسی کا احترام۔',
  },
  why3Title: { en: 'Pure & Herbal Oils', ur: 'خالص اور قدرتی ہربل تیل' },
  why3Desc: {
    en: 'Genuine mustard, almond, black seed, and olive oils used for therapeutic wellness without harmful chemicals.',
    ur: 'خالص سرسوں، بادام، کلونجی اور زیتون کا قدرتی تیل استعمال کیا جاتا ہے۔',
  },

  // Reviews
  realCustomerReviews: { en: 'Genuine Customer Reviews', ur: 'صارفین کی حقیقی آراء' },
  realCustomerReviewsSub: {
    en: 'Direct reviews submitted by verified customers only after completed appointments.',
    ur: 'صرف مکمل شدہ سروسز کے بعد صارفین کے حقیقی تبصرے۔',
  },

  // FAQ
  faqTitle: { en: 'Frequently Asked Questions', ur: 'اکثر پوچھے جانے والے سوالات' },

  // Become worker
  becomeWorkerTitle: { en: 'Are You an Experienced Massage Specialist?', ur: 'کیا آپ تجربہ کار مالش ماہر ہیں؟' },
  becomeWorkerSub: {
    en: 'Join Pakistan’s premier verified wellness platform. Grow your earnings, manage your schedule, and get respectful clients.',
    ur: 'ہمارے تصدیق شدہ پلیٹ فارم سے جڑیں اور عزت و وقار کے ساتھ اپنی آمدنی میں اضافہ کریں۔',
  },
  registerAsWorkerBtn: { en: 'Apply to Become a Verified Specialist', ur: 'بطور ماہر رجسٹریشن کروائیں' },

  // Booking & General
  bookNow: { en: 'Book Appointment', ur: 'وقت بک کریں' },
  viewProfile: { en: 'View Full Profile', ur: 'مکمل پروفائل دیکھیں' },
  homeVisitAvailable: { en: 'Home Visit Available', ur: 'گھر پر سروس دستیاب ہے' },
  serviceCentreAvailable: { en: 'Service Centre Available', ur: 'سینٹر پر سروس دستیاب ہے' },
  startingFrom: { en: 'Starting at', ur: 'شروع قیمت' },
  duration: { en: 'Duration', ur: 'دورانیہ' },
  minutes: { en: 'mins', ur: 'منٹ' },
  experience: { en: 'Experience', ur: 'تجربہ' },
  years: { en: 'years', ur: 'سال' },
  reviews: { en: 'reviews', ur: 'جائزے' },
};
