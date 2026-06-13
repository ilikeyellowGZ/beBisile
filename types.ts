export interface Product {
  id: string;
  name: string;
  subtitle: string;
  tagline?: string;
  price: number;
  description: string;
  notes: string[];
  image: string;
  secondaryImage: string;
  tertiaryImage?: string;
  galleryImages?: string[];
  specs?: Record<string, string>;
  pricePrefix?: string;
  selectedOptions?: Record<string, string>;
  imageFit?: 'cover' | 'contain';
  category: 'parfum' | 'wig' | 'bundle' | 'closure' | 'laundry' | 'care' | 'service';
  collection: 'fragrance' | 'hair' | 'service';
  eyebrow?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface NavItem {
  label: string;
  path: string;
  scrollTo?: string;
}

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  alternativePhone: string;
  instagramHandle: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
  notes: string;
  shippingPartner: string;
}

export interface DashboardOrder {
  _id: string;
  customer: CheckoutDetails;
  items: Array<{ id: string; name: string; quantity: number; unitPrice: number }>;
  total: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
}
