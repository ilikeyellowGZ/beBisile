export type TrustedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  available: true;
  isActive: true;
  isArchived: false;
};

const slugifyOption = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const trusted = (product: Omit<TrustedProduct, 'slug' | 'available' | 'isActive' | 'isArchived'> & { slug?: string }): TrustedProduct => ({
  ...product,
  slug: product.slug || product.id,
  available: true,
  isActive: true,
  isArchived: false,
});

const baseProducts = [
  trusted({ id: 'indoniyamanzi', name: 'Indoniyamanzi', price: 499.99, stock: 20 }),
  trusted({ id: 'inkanyezi', name: 'Inkanyezi', price: 499.99, stock: 20 }),
  trusted({ id: 'sithelo', name: 'Sithelo', price: 649.99, stock: 20 }),
  trusted({ id: 'langelihle', name: 'Langelihle', price: 629.99, stock: 20 }),
  trusted({ id: 'ndalwenhle', name: 'Ndalwenhle', price: 529.99, stock: 20 }),
  trusted({ id: 'luyanda', name: 'Luyanda', price: 689.99, stock: 20 }),
  trusted({ id: 'discovery-set', name: 'Discovery Set', price: 349.99, stock: 20 }),
  trusted({ id: 'mvelwenhle', name: 'Mvelwenhle', price: 2489.99, stock: 4 }),
  trusted({ id: 'thabitha', name: 'Thabitha', price: 2649.99, stock: 4 }),
  trusted({ id: 'nokhwezi', name: 'Nokhwezi', price: 2799.99, stock: 4 }),
  trusted({ id: 'khwezilokusa', name: 'Khwezilokusa', price: 2799.99, stock: 4 }),
  trusted({ id: 'nobuntu', name: 'Nobuntu', price: 2949.99, stock: 4 }),
  trusted({ id: 'melokuhle', name: 'Melokuhle', price: 3549.99, stock: 4 }),
  trusted({ id: 'ntando', name: 'Ntando', price: 3749.99, stock: 4 }),
  trusted({ id: 'ayabonga', name: 'Ayabonga', price: 3449.99, stock: 4 }),
  trusted({ id: 'ayanda', name: 'Ayanda', price: 3799.99, stock: 4 }),
  trusted({ id: 'bonginhlanhla', name: 'Bonginhlanhla', price: 3789.99, stock: 4 }),
  trusted({ id: 'nobuhle', name: 'Nobuhle', price: 3949.99, stock: 4 }),
  trusted({ id: 'masindi', name: 'Masindi', price: 4649.99, stock: 4 }),
  trusted({ id: 'buhlebendalo', name: 'Buhlebendalo', price: 4549.99, stock: 4 }),
  trusted({ id: 'thabisile', name: 'Thabisile', price: 4249.99, stock: 4 }),
  trusted({ id: 'ntombi-zandile', name: 'Ntombi Zandile', price: 4489.99, stock: 4 }),
  trusted({ id: 'londiwe', name: 'Londiwe', price: 4689.99, stock: 4 }),
  trusted({ id: 'samkelisiwe', name: 'Samkelisiwe', price: 4849.99, stock: 4 }),
  trusted({ id: 'ntombizonke', name: 'Ntombizonke', price: 4889.99, stock: 4 }),
  trusted({ id: 'single-bundle', name: 'Single Bundle', price: 799.99, stock: 10 }),
  trusted({ id: 'three-bundles', name: 'Three Bundles', price: 1799.99, stock: 10 }),
  trusted({ id: 'closures-frontals', name: 'Closures & Frontals', price: 449.99, stock: 10 }),
  trusted({ id: 'wig-laundry', name: 'Wig Laundry', price: 190, stock: 99 }),
];

const bundlePrices = {
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
} as const;

const closurePrices = {
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
} as const;

const laundryPrices = {
  'wig-wash-only': { name: 'Wig Laundry - Wig Wash Only', price: 190 },
  'wig-treatment-straighten': { name: 'Wig Laundry - Wig Treatment (Straighten)', price: 200 },
  'wig-treatment-curls': { name: 'Wig Laundry - Wig Treatment (Curls)', price: 250 },
  'straightening-only': { name: 'Wig Laundry - Straightening Only', price: 100 },
  'curls-activation-only': { name: 'Wig Laundry - Curls Activation Only', price: 180 },
  'frontal-plucking-only': { name: 'Wig Laundry - Frontal Plucking Only', price: 100 },
  'plucking-straightening': { name: 'Wig Laundry - Plucking & Straightening', price: 200 },
  'plucking-curl-activation': { name: 'Wig Laundry - Plucking & Curl Activation', price: 270 },
  'custom-parting': { name: 'Wig Laundry - Custom Parting', price: 100 },
  'straight-to-custom-curls': { name: 'Wig Laundry - Straight to Custom Curls', price: 320 },
  'wig-bundles-dye': { name: 'Wig Laundry - Wig / Bundles dye', price: 300 },
  'full-laundry-straight': { name: 'Wig Laundry - Wig Wash, Plucking, & Straightening', price: 390 },
  'full-laundry-curls': { name: 'Wig Laundry - Wig Wash, Plucking, & Curls Activation', price: 420 },
  'full-laundry-custom-part': { name: 'Wig Laundry - Wig Wash, Plucking, Custom Parting, & Straighten / Curl Activation', price: 590 },
} as const;

const bundleProducts = Object.entries(bundlePrices).flatMap(([packageType, textures]) =>
  Object.entries(textures).flatMap(([texture, lengths]) =>
    Object.entries(lengths).map(([length, price]) => trusted({
      id: `bundle-${slugifyOption(packageType)}-${slugifyOption(texture)}-${slugifyOption(length)}`,
      name: `${packageType} - ${texture} - ${length}`,
      price: Number(price),
      stock: 10,
    }))
  )
);

const closureProducts = Object.entries(closurePrices).flatMap(([laceSize, textures]) =>
  Object.entries(textures).flatMap(([texture, lengths]) =>
    Object.entries(lengths).map(([length, price]) => trusted({
      id: `closure-${slugifyOption(laceSize)}-${slugifyOption(texture)}-${slugifyOption(length)}`,
      name: `${laceSize} - ${texture} - ${length}`,
      price: Number(price),
      stock: 10,
    }))
  )
);

const laundryProducts = Object.entries(laundryPrices).map(([id, product]) => trusted({
  id,
  name: product.name,
  price: product.price,
  stock: 99,
}));

export const trustedProducts = [
  ...baseProducts,
  ...bundleProducts,
  ...closureProducts,
  ...laundryProducts,
];

const trustedProductLookup = new Map<string, TrustedProduct>();
for (const product of trustedProducts) {
  trustedProductLookup.set(product.id, product);
  trustedProductLookup.set(product.slug, product);
}

export const findTrustedProduct = (productId: string) => trustedProductLookup.get(productId);
