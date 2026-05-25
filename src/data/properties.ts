import type { GroupTypeId } from "@/config/filters";

export interface Property {
  id: string;
  title: string;
  type: 'apartment' | 'villa' | 'commercial' | 'duplex' | 'office' | 'land';
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  images?: string[];
  /** Looping preview on listing cards — demo listings only (v1, v2) */
  demoVideo?: string;
  listingType: 'sale' | 'rent';
  featured: boolean;
  isTopWeek?: boolean;
  groupType?: GroupTypeId;
  features?: string[];
  createdAt: Date;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_location?: string;
}


export const properties: Property[] = [
  {
    id: 'v1',
    title: 'فيلا الأحلام في الساحل الشمالي',
    type: 'villa',
    price: 15000,
    location: 'الساحل الشمالي، مصر',
    bedrooms: 6,
    bathrooms: 5,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    demoVideo: '/demo/villa-demo-1.mp4',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    listingType: 'rent',
    featured: true,
    isTopWeek: true,
    groupType: 'family',
    features: ['pool', 'garden', 'security_24_7', 'air_conditioning'],
    createdAt: new Date('2024-12-20'),
  },
  {
    id: 'v2',
    title: 'فيلا أوشن فيو الفاخرة',
    type: 'villa',
    price: 22000,
    location: 'دبي، الإمارات',
    bedrooms: 5,
    bathrooms: 6,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    demoVideo: '/demo/villa-demo-2.mp4',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    listingType: 'rent',
    featured: true,
    isTopWeek: true,
    groupType: 'family',
    features: ['pool', 'gym', 'modern_kitchen', 'parking'],
    createdAt: new Date('2024-12-22'),
  },
  {
    id: '1',
    title: 'شقة فاخرة بإطلالة على النيل',
    type: 'apartment',
    price: 8500000,
    location: 'الزمالك، القاهرة',
    bedrooms: 3,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-15'),
  },
  {
    id: '2',
    title: 'فيلا عائلية عصرية',
    type: 'villa',
    price: 25000000,
    location: 'التجمع الخامس، القاهرة الجديدة',
    bedrooms: 5,
    bathrooms: 4,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-10'),
  },
  {
    id: '3',
    title: 'مساحة مكتبية متميزة',
    type: 'office',
    price: 15000000,
    location: 'وسط البلد، القاهرة',
    bedrooms: 0,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    listingType: 'rent',
    featured: false,
    createdAt: new Date('2024-12-08'),
  },
  {
    id: '4',
    title: 'دوبلكس بنتهاوس راقي',
    type: 'duplex',
    price: 18000000,
    location: 'المعادي، القاهرة',
    bedrooms: 4,
    bathrooms: 3,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-12'),
  },
  {
    id: '5',
    title: 'استوديو مريح',
    type: 'apartment',
    price: 2500000,
    location: 'مصر الجديدة، القاهرة',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    listingType: 'rent',
    featured: false,
    createdAt: new Date('2024-12-05'),
  },
  {
    id: '6',
    title: 'فيلا فسيحة بحديقة',
    type: 'villa',
    price: 32000000,
    location: 'الشيخ زايد، 6 أكتوبر',
    bedrooms: 6,
    bathrooms: 5,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-14'),
  },
  {
    id: '7',
    title: 'محل تجاري في موقع متميز',
    type: 'commercial',
    price: 8000000,
    location: 'مدينة نصر، القاهرة',
    bedrooms: 0,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80',
    listingType: 'rent',
    featured: false,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '8',
    title: 'دوبلكس فاخر بمسبح خاص',
    type: 'duplex',
    price: 28000000,
    location: 'القطامية، القاهرة الجديدة',
    bedrooms: 5,
    bathrooms: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-16'),
  },
  {
    id: '9',
    title: 'شقة غرفتين عصرية',
    type: 'apartment',
    price: 4500000,
    location: 'المهندسين، القاهرة',
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    listingType: 'rent',
    featured: false,
    createdAt: new Date('2024-12-03'),
  },
  {
    id: '10',
    title: 'قصر تنفيذي فاخر',
    type: 'villa',
    price: 45000000,
    location: 'سوديك ويست، الشيخ زايد',
    bedrooms: 7,
    bathrooms: 6,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    listingType: 'sale',
    featured: true,
    createdAt: new Date('2024-12-17'),
  },
  {
    id: '11',
    title: 'مكتب في موقع استراتيجي',
    type: 'office',
    price: 12000000,
    location: 'القرية الذكية، 6 أكتوبر',
    bedrooms: 0,
    bathrooms: 3,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    listingType: 'rent',
    featured: false,
    createdAt: new Date('2024-11-28'),
  },
  {
    id: '12',
    title: 'دوبلكس ساحر بحديقة',
    type: 'duplex',
    price: 12500000,
    location: 'المعادي دجلة، القاهرة',
    bedrooms: 3,
    bathrooms: 3,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    listingType: 'sale',
    featured: false,
    createdAt: new Date('2024-12-02'),
  },
  {
    id: '13',
    title: 'فيلا أوشن دريمز الفاخرة',
    type: 'villa',
    price: 4500,
    location: 'نخلة جميرا، دبي',
    bedrooms: 5,
    bathrooms: 6,
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    listingType: 'rent',
    featured: true,
    groupType: 'family',
    features: ['pool', 'security_24_7', 'modern_kitchen', 'garden', 'air_conditioning'],
    createdAt: new Date('2024-05-18'),
  },
  {
    id: '14',
    title: 'قصر السحاب المعاصر',
    type: 'villa',
    price: 6800,
    location: 'الساحل الشمالي، مصر',
    bedrooms: 6,
    bathrooms: 7,
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
    listingType: 'rent',
    featured: true,
    groupType: 'youth_male',
    features: ['pool', 'balcony', 'security_system', 'parking'],
    createdAt: new Date('2024-05-20'),
  },
  {
    id: '15',
    title: 'فيلا رويال أواسيس المذهلة',
    type: 'villa',
    price: 3200,
    location: 'الدرعية، الرياض',
    bedrooms: 4,
    bathrooms: 4,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    listingType: 'rent',
    featured: false,
    groupType: 'women_only',
    features: ['air_conditioning', 'gym', 'parking', 'garden'],
    createdAt: new Date('2024-05-22'),
  },
  {
    id: '16',
    title: 'ملاذ الطبيعة الساحر',
    type: 'villa',
    price: 5500,
    location: 'البحر الميت، الأردن',
    bedrooms: 5,
    bathrooms: 5,
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80',
    listingType: 'rent',
    featured: true,
    groupType: 'family',
    features: ['pool', 'balcony', 'garden', 'air_conditioning'],
    createdAt: new Date('2024-05-23'),
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' شيكل';
};

/** Villas for rent only — kept for label lookups */
export const propertyTypes = [{ value: 'villa', label: 'فلل' }] as const;

export const propertyTypeLabels: Record<string, string> = {
  villa: 'فيلا',
};

export const listingTypeLabels: Record<string, string> = {
  rent: 'إيجار',
};

export const locations = [
  'جميع المناطق',
  'القاهرة، مصر',
  'الرياض، السعودية',
  'دبي، الإمارات',
  'أبو ظبي، الإمارات',
  'جدة، السعودية',
  'الدوحة، قطر',
  'الكويت العاصمة، الكويت',
  'مسقط، عمان',
  'المنامة، البحرين',
  'عمان، الأردن',
  'بيروت، لبنان',
  'بغداد، العراق',
  'الدار البيضاء، المغرب',
  'تونس العاصمة، تونس',
  'الجزائر العاصمة، الجزائر',
];

export const featureLabels: Record<string, string> = {
  air_conditioning: 'تكييف هواء',
  modern_kitchen: 'مطبخ عصري',
  parking: 'موقف سيارات',
  security_system: 'نظام أمان',
  security_24_7: 'أمن 24/7',
  balcony: 'شرفة',
  elevator: 'مصعد',
  pool: 'حمام سباحة',
  gym: 'صالة ألعاب رياضية',
  garden: 'حديقة',
};
