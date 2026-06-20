import type { Product } from '../types';
import { hairImages } from '../src/assets/images';

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price).replace('ZAR', 'R');

export const hairGallery = {
  straight: [hairImages.wigShowcase],
  curly: [hairImages.wigShowcase],
  laundry: [hairImages.wigLaundryWash, hairImages.wigLaundryTowel, hairImages.wigLaundryLace, hairImages.wigLaundryBasin],
};

export const HAIR_CATEGORY_LINKS = [
  {
    label: 'Bhelekazi Wigs',
    path: '/hair/wigs',
    description: 'Everyday luxury, soft luxurious quality and premium luxury wigs crafted with refined BISILE finishes.',
    image: hairImages.mvelwenhle,
    cta: 'Shop Wigs',
    options: ['Everyday Luxury', 'Soft Luxurious Quality', 'Premium Luxury'],
  },
  {
    label: 'Closures',
    path: '/hair/closures',
    description: 'Complete your install with premium lace closures and frontals.',
    image: hairImages.straightWig11,
    cta: 'Shop Closures',
    options: ['Waterwave Curl', 'Kinky Curl', 'Straight'],
  },
  {
    label: 'Bundles',
    path: '/hair/bundles',
    description: 'Choose your texture, length and bundle package.',
    image: hairImages.curlyBundle01,
    cta: 'Shop Bundles',
    options: ['Single Bundle', 'Three Bundles'],
  },
  {
    label: 'Wig Laundry',
    path: '/hair/laundry',
    description: "Refresh, revive and restyle your wig with BISILE's premium hair care service.",
    image: hairImages.wigLaundryWash,
    cta: 'Book Wig Laundry',
    options: [] as string[],
  },
] as const;

export type BundlePackageType = 'Single Bundle' | 'Three Bundles';
export type BundleTexture = 'Straight' | 'Kinky Curls' | 'Waterwave Curls';
export type BundleLength = '10 inch' | '12 inch' | '16 inch' | '18 inch' | '20 inch' | '22 inch';

export const BUNDLE_PRICES: Record<BundlePackageType, Record<BundleTexture, Record<BundleLength, number>>> = {
  'Single Bundle': {
    Straight: { '10 inch': 799.99, '12 inch': 999.99, '16 inch': 1199.99, '18 inch': 1399.99, '20 inch': 1599.99, '22 inch': 1799.99 },
    'Kinky Curls': { '10 inch': 899.99, '12 inch': 1099.99, '16 inch': 1399.99, '18 inch': 1699.99, '20 inch': 1999.99, '22 inch': 2299.99 },
    'Waterwave Curls': { '10 inch': 1049.99, '12 inch': 1299.99, '16 inch': 1549.99, '18 inch': 1799.99, '20 inch': 2049.99, '22 inch': 2299.99 },
  },
  'Three Bundles': {
    Straight: { '10 inch': 2099.99, '12 inch': 2399.99, '16 inch': 2699.99, '18 inch': 2999.99, '20 inch': 3299.99, '22 inch': 3599.99 },
    'Kinky Curls': { '10 inch': 1799.99, '12 inch': 2699.99, '16 inch': 3599.99, '18 inch': 4499.99, '20 inch': 5399.99, '22 inch': 6299.99 },
    'Waterwave Curls': { '10 inch': 2249.99, '12 inch': 2899.99, '16 inch': 3449.99, '18 inch': 3799.99, '20 inch': 4349.99, '22 inch': 4899.99 },
  },
};

export const BUNDLE_PRODUCTS: Product[] = [
  {
    id: 'single-bundle',
    name: 'Single Bundle',
    subtitle: 'Processed Virgin Hair',
    eyebrow: 'Bundles',
    pricePrefix: 'From',
    price: 799.99,
    description: 'Choose your texture and length for a single processed virgin hair bundle.',
    notes: ['Processed Virgin Hair', 'Single Bundle', 'Choose Options'],
    image: hairImages.curlyBundle01,
    secondaryImage: hairImages.curlyBundle02,
    galleryImages: hairGallery.curly,
    category: 'bundle',
    collection: 'hair',
    specs: { 'Hair type': 'Processed Virgin Hair', 'Package type': 'Single Bundle' },
  },
  {
    id: 'three-bundles',
    name: 'Three Bundles',
    subtitle: 'Processed Virgin Hair',
    eyebrow: 'Bundles',
    pricePrefix: 'From',
    price: 1799.99,
    description: 'Choose your texture and length for a three-bundle processed virgin hair package.',
    notes: ['Processed Virgin Hair', 'Three Bundles', 'Choose Options'],
    image: hairImages.curlyBundle02,
    secondaryImage: hairImages.curlyBundle01,
    galleryImages: hairGallery.curly,
    category: 'bundle',
    collection: 'hair',
    specs: { 'Hair type': 'Processed Virgin Hair', 'Package type': 'Three Bundles' },
  },
];

export type ClosureLaceSize = '4x4 Closure' | '13x4 Closure';
export type ClosureTexture = 'Kinky Curly' | 'Waterwave' | 'Straight';
export type ClosureLength = '10 inch' | '12 inch';

export const CLOSURE_PRICES: Record<ClosureLaceSize, Record<ClosureTexture, Record<ClosureLength, number>>> = {
  '4x4 Closure': {
    'Kinky Curly': { '10 inch': 549.99, '12 inch': 649.99 },
    Waterwave: { '10 inch': 549.99, '12 inch': 649.99 },
    Straight: { '10 inch': 449.99, '12 inch': 549.99 },
  },
  '13x4 Closure': {
    'Kinky Curly': { '10 inch': 699.99, '12 inch': 749.99 },
    Waterwave: { '10 inch': 699.99, '12 inch': 749.99 },
    Straight: { '10 inch': 599.99, '12 inch': 649.99 },
  },
};

export const CLOSURE_PRODUCT: Product = {
  id: 'closures-frontals',
  name: 'Closures & Frontals',
  subtitle: 'Processed Virgin Hair',
  eyebrow: 'Closures & Frontals',
  pricePrefix: 'From',
  price: 449.99,
  description: 'Complete your install with premium lace closures and frontals in your preferred texture and length.',
  notes: ['Processed Virgin Hair', 'Lace Closure', 'Choose Options'],
  image: hairImages.straightWig11,
  secondaryImage: hairImages.straightWig02,
  galleryImages: hairGallery.straight,
  category: 'closure',
  collection: 'hair',
  specs: { 'Hair type': 'Processed Virgin Hair', 'Lace options': '4x4 Closure or 13x4 Closure' },
};

export type LaundryServiceType =
  | 'Wig Wash Only'
  | 'Wig Treatment (Straighten)'
  | 'Wig Treatment (Curls)'
  | 'Straightening Only'
  | 'Curls Activation Only'
  | 'Frontal Plucking Only'
  | 'Plucking & Straightening'
  | 'Plucking & Curl Activation'
  | 'Custom Parting'
  | 'Straight to Custom Curls'
  | 'Wig / Bundles dye'
  | 'Wig Wash, Plucking, & Straightening'
  | 'Wig Wash, Plucking, & Curls Activation'
  | 'Wig Wash, Plucking, Custom Parting, & Straighten / Curl Activation';
export type LaundryParting = 'Middle Part' | 'Side Part' | 'Free Part' | 'No Part / Natural Fall';
export type LaundryFinish = 'Straightened' | 'Body Curls' | 'Waterwave Refresh' | 'Jerry Curl Refresh' | 'Blunt Bob Finish' | 'Leave Natural';

export const WIG_LAUNDRY_SERVICE_PRICES: Record<LaundryServiceType, number> = {
  'Wig Wash Only': 190,
  'Wig Treatment (Straighten)': 200,
  'Wig Treatment (Curls)': 250,
  'Straightening Only': 100,
  'Curls Activation Only': 180,
  'Frontal Plucking Only': 100,
  'Plucking & Straightening': 200,
  'Plucking & Curl Activation': 270,
  'Custom Parting': 100,
  'Straight to Custom Curls': 320,
  'Wig / Bundles dye': 300,
  'Wig Wash, Plucking, & Straightening': 390,
  'Wig Wash, Plucking, & Curls Activation': 420,
  'Wig Wash, Plucking, Custom Parting, & Straighten / Curl Activation': 590,
};

export const WIG_LAUNDRY_SERVICE_IDS: Record<LaundryServiceType, string> = {
  'Wig Wash Only': 'wig-wash-only',
  'Wig Treatment (Straighten)': 'wig-treatment-straighten',
  'Wig Treatment (Curls)': 'wig-treatment-curls',
  'Straightening Only': 'straightening-only',
  'Curls Activation Only': 'curls-activation-only',
  'Frontal Plucking Only': 'frontal-plucking-only',
  'Plucking & Straightening': 'plucking-straightening',
  'Plucking & Curl Activation': 'plucking-curl-activation',
  'Custom Parting': 'custom-parting',
  'Straight to Custom Curls': 'straight-to-custom-curls',
  'Wig / Bundles dye': 'wig-bundles-dye',
  'Wig Wash, Plucking, & Straightening': 'full-laundry-straight',
  'Wig Wash, Plucking, & Curls Activation': 'full-laundry-curls',
  'Wig Wash, Plucking, Custom Parting, & Straighten / Curl Activation': 'full-laundry-custom-part',
};

export const WIG_LAUNDRY_SERVICE_GROUPS: Array<{ title: string; services: LaundryServiceType[] }> = [
  {
    title: 'Wash Services',
    services: [
      'Wig Wash Only',
      'Wig Treatment (Straighten)',
      'Wig Treatment (Curls)',
      'Straightening Only',
      'Curls Activation Only',
      'Frontal Plucking Only',
    ],
  },
  {
    title: 'Customisation',
    services: [
      'Plucking & Straightening',
      'Plucking & Curl Activation',
      'Custom Parting',
      'Straight to Custom Curls',
      'Wig / Bundles dye',
    ],
  },
  {
    title: 'Full Laundry Package',
    services: [
      'Wig Wash, Plucking, & Straightening',
      'Wig Wash, Plucking, & Curls Activation',
      'Wig Wash, Plucking, Custom Parting, & Straighten / Curl Activation',
    ],
  },
];

export const LAUNDRY_PARTINGS: LaundryParting[] = ['Middle Part', 'Side Part', 'Free Part', 'No Part / Natural Fall'];
export const LAUNDRY_FINISHES: LaundryFinish[] = ['Straightened', 'Body Curls', 'Waterwave Refresh', 'Jerry Curl Refresh', 'Blunt Bob Finish', 'Leave Natural'];

export const WIG_LAUNDRY_PRODUCT: Product = {
  id: 'wig-laundry',
  name: 'Wig Laundry',
  subtitle: 'Premium wig care service',
  eyebrow: 'Wig Laundry',
  pricePrefix: 'From',
  price: WIG_LAUNDRY_SERVICE_PRICES['Wig Wash Only'],
  description: 'Premium wig washing, conditioning and styling service for BISILE hair units and customer-owned wigs.',
  notes: ['Wash', 'Condition', 'Style'],
  image: hairImages.wigLaundryWash,
  secondaryImage: hairImages.wigLaundryTowel,
  tertiaryImage: hairImages.wigLaundryLace,
  galleryImages: hairGallery.laundry,
  category: 'laundry',
  collection: 'service',
  specs: { 'Service type': 'Wig Laundry', 'Turnaround': 'Confirmed after collection or drop-off' },
};

export const getBundlePrice = (packageType: BundlePackageType, texture: BundleTexture, length: BundleLength) =>
  BUNDLE_PRICES[packageType][texture][length];

export const getClosurePrice = (laceSize: ClosureLaceSize, texture: ClosureTexture, length: ClosureLength) =>
  CLOSURE_PRICES[laceSize][texture][length];

export const getLaundryPrice = (serviceType: LaundryServiceType) =>
  WIG_LAUNDRY_SERVICE_PRICES[serviceType];
