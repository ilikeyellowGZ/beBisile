import type { Product } from '../types';

export type CatalogSort = 'featured' | 'newest' | 'price-low-high' | 'price-high-low' | 'name-a-z' | 'name-z-a';

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low-high', label: 'Price low to high' },
  { value: 'price-high-low', label: 'Price high to low' },
  { value: 'name-a-z', label: 'Name A-Z' },
  { value: 'name-z-a', label: 'Name Z-A' },
];

const featuredScore = (product: Product) => {
  if (product.isBestSeller) return 0;
  if (product.isNew) return 1;
  return 2;
};

export const sortProducts = (products: Product[], sort: CatalogSort) => {
  const indexed = products.map((product, index) => ({ product, index }));

  indexed.sort((a, b) => {
    if (sort === 'newest') {
      const newDelta = Number(Boolean(b.product.isNew)) - Number(Boolean(a.product.isNew));
      return newDelta || b.index - a.index;
    }

    if (sort === 'price-low-high') return a.product.price - b.product.price || a.index - b.index;
    if (sort === 'price-high-low') return b.product.price - a.product.price || a.index - b.index;
    if (sort === 'name-a-z') return a.product.name.localeCompare(b.product.name) || a.index - b.index;
    if (sort === 'name-z-a') return b.product.name.localeCompare(a.product.name) || a.index - b.index;

    return featuredScore(a.product) - featuredScore(b.product) || a.index - b.index;
  });

  return indexed.map(({ product }) => product);
};
