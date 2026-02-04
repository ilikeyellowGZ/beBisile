export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  description: string;
  notes: string[];
  image: string;
  secondaryImage: string;
  category: 'parfum' | 'home' | 'set';
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface NavItem {
  label: string;
  path: string;
}