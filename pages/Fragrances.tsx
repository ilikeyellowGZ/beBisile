import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { BisileSelect } from '../components/UI/BisileSelect';
import { ProductCard } from '../components/UI/ProductCard';
import { FRAGRANCE_PRODUCTS } from '../constants';
import { SORT_OPTIONS, type CatalogSort, sortProducts } from '../utils/catalog';

type FragranceFilter =
  | 'all'
  | 'women'
  | 'best-seller'
  | 'daily'
  | 'evening'
  | 'soft'
  | 'statement'
  | 'under-550'
  | 'over-550';

const imveloProducts = FRAGRANCE_PRODUCTS.filter((product) => product.id !== 'discovery-set');

const filterOptions: Array<{ value: FragranceFilter; label: string }> = [
  { value: 'all', label: 'All fragrances' },
  { value: 'women', label: 'For women' },
  { value: 'best-seller', label: 'Best sellers' },
  { value: 'daily', label: 'Daily wear' },
  { value: 'evening', label: 'Evening scents' },
  { value: 'soft', label: 'Soft scents' },
  { value: 'statement', label: 'Statement scents' },
  { value: 'under-550', label: 'Under R550' },
  { value: 'over-550', label: 'R550 and over' },
];

const applyFilter = (filter: FragranceFilter) => {
  if (filter === 'women') return imveloProducts;
  if (filter === 'best-seller') return imveloProducts.filter((product) => product.isBestSeller);
  if (filter === 'daily') return imveloProducts.filter((product) => ['indoniyamanzi', 'inkanyezi', 'ndalwenhle'].includes(product.id));
  if (filter === 'evening') return imveloProducts.filter((product) => ['sithelo', 'langelihle', 'luyanda'].includes(product.id));
  if (filter === 'soft') return imveloProducts.filter((product) => ['indoniyamanzi', 'inkanyezi', 'ndalwenhle'].includes(product.id));
  if (filter === 'statement') return imveloProducts.filter((product) => ['sithelo', 'langelihle', 'luyanda'].includes(product.id));
  if (filter === 'under-550') return imveloProducts.filter((product) => product.price < 550);
  if (filter === 'over-550') return imveloProducts.filter((product) => product.price >= 550);
  return imveloProducts;
};

export const Fragrances: React.FC = () => {
  const [filter, setFilter] = useState<FragranceFilter>('all');
  const [sort, setSort] = useState<CatalogSort>('featured');

  const products = useMemo(() => sortProducts(applyFilter(filter), sort), [filter, sort]);
  const activeFilterLabel = filterOptions.find((option) => option.value === filter)?.label ?? 'All fragrances';
  const activeSortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Featured';

  return (
    <div className="min-h-screen bg-off-white pb-24 pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Fragrances</p>
          <p className="bisile-kicker mb-3">Fragrances</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Imvelo Collection.</h1>
          <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
            A fragrance journey inspired by nature's ability to nurture, restore, and breathe life into everything it touches. Each scent is crafted to ground your spirit, elevate your mood, and remind you of the beauty found in simplicity.
          </p>
          <div className="mt-10 flex flex-col gap-5 font-inter text-sm font-light text-primary/55 md:flex-row md:items-center md:justify-between">
            <p>{products.length} of {imveloProducts.length} items</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <BisileSelect
                value={filter}
                options={filterOptions}
                onChange={setFilter}
                ariaLabel="Filter fragrance products"
                icon={<SlidersHorizontal size={15} strokeWidth={1.25} />}
                className="min-w-[13rem]"
              />
              <BisileSelect
                value={sort}
                options={SORT_OPTIONS}
                onChange={setSort}
                ariaLabel="Sort fragrance products"
                className="min-w-[13rem]"
              />
            </div>
          </div>
        </FadeIn>

        <div className="mt-8 border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {activeFilterLabel} / {activeSortLabel}
        </div>

        {products.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <FadeIn key={product.id} delay={index * 45}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/60">
            No fragrances match this filter.
          </div>
        )}
      </section>
    </div>
  );
};
