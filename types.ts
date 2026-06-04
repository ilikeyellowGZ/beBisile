export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  description: string;
  notes: string[];
  image: string;
  secondaryImage: string;
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
  address: string;
  city: string;
  postalCode: string;
  notes: string;
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
