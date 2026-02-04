import { Product } from './types';

export const NAV_ITEMS = [
  { label: 'Shop', path: '/shop' },
  { label: 'Discovery Sets', path: '/shop' }, // Simplified routing for demo
  { label: 'Our Story', path: '/story' }, // Simplified routing
  { label: 'Journal', path: '/contact' }, // Simplified routing
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Indoiyamanzi',
    subtitle: 'A Velvety, Rich Wood',
    price: 299,
    description: 'A beautigul young woman with respect, pride and dignity.',
    notes: ['Magnolia', 'Cardamom', 'Cedarwood', 'Guaiac Wood'],
    image: '/public/media/image 25.png',
    secondaryImage: '/public/media/image 48.png',
    category: 'parfum',
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Cyan Nori',
    subtitle: 'A Sweet, Salty Musk',
    price: 145,
    description: 'Inspired by the ocean, Cyan Nori is a modern, salty, and sweet musk. It opens with a burst of tangerine and peach, grounded by the savory depth of nori.',
    notes: ['Tangerine', 'White Peach', 'Nori', 'Musk'],
    image: '/public/media/image 25.png',
    secondaryImage: '/public/media/image 51.png',
    category: 'parfum',
  },
  {
    id: '3',
    name: 'The Apartment',
    subtitle: 'Dark & Sophisticated Gourmand',
    price: 165,
    description: 'A decadent and complex scent, The Apartment captures the essence of a Parisian evening. Cherry, rum, and cacao create an intoxicating opening that settles into a warm, amber base.',
    notes: ['Sour Cherry', 'Rum', 'Cacao', 'Myrrh'],
    image: '/public/media/image 25.png',
    secondaryImage: '/public/media/image 48.png',
    category: 'parfum',
    isNew: true,
  },
  {
    id: '4',
    name: 'Cobalt Amber',
    subtitle: 'Classic Oriental',
    price: 145,
    description: 'A sophisticated oriental fragrance that is both comforting and alluring. Pink pepper and juniper berry give way to a heart of cacao and tonka bean.',
    notes: ['Pink Pepper', 'Juniper Berry', 'Cacao', 'Amber'],
    image: '/public/media/image 49.png',
    secondaryImage: '/public/media/image 25.png',
    category: 'parfum',
  },
  {
    id: '5',
    name: 'Discovery Set',
    subtitle: 'Explore the Collection',
    price: 45,
    description: 'The perfect introduction to L\'Essence. This set contains 2ml samples of our five most beloved fragrances, allowing you to discover your signature scent at your own pace.',
    notes: ['5 x 2ml Vials', 'Organic Cotton Pouch', 'Scent Guide'],
    image: '/public/media/image 43.png',
    secondaryImage: '/public/media/image 45.png',
    category: 'set',
  },
  {
    id: '6',
    name: 'White Vetiver',
    subtitle: 'Cool & Crisp',
    price: 145,
    description: 'A cool, fresh vetiver that opens with a zesty lime and mint accord. The heart reveals a creamy palmarosa note before settling into the dry, woody base of vetiver.',
    notes: ['Lime', 'Mint', 'Palmarosa', 'Vetiver'],
    image: '/public/media/image 25.png',
    secondaryImage: '/public/media/image 44.png',
    category: 'parfum',
  },
];
