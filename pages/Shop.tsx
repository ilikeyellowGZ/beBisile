import React, { useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { BisileSelect } from '../components/UI/BisileSelect';
import { ProductCard } from '../components/UI/ProductCard';
import { ALL_HAIR_PRODUCTS, FRAGRANCE_PRODUCTS, getWhatsAppUrl } from '../constants';
import { fragranceImages, packageImages } from '../src/assets/images';
import { SORT_OPTIONS, type CatalogSort, sortProducts } from '../utils/catalog';

type ShopFilter = 'all' | 'fragrance' | 'hair' | 'new' | 'best-seller' | 'under-550' | 'over-550';

const shopProducts = [...FRAGRANCE_PRODUCTS, ...ALL_HAIR_PRODUCTS];

const filterOptions: Array<{ value: ShopFilter; label: string }> = [
  { value: 'all', label: 'All products' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'hair', label: 'Hair' },
  { value: 'new', label: 'New' },
  { value: 'best-seller', label: 'Best sellers' },
  { value: 'under-550', label: 'Under R550' },
  { value: 'over-550', label: 'R550 and over' },
];

const enquiryItems = [
  { name: 'Discovery Set', image: packageImages.product06, body: 'Sample the BISILE fragrance wardrobe before choosing your full-size scent.' },
  { name: 'Diffuser', image: fragranceImages.product06, body: 'Home fragrance for a softer atmosphere and a more considered room ritual.' },
  { name: 'Candle', image: packageImages.product07, body: 'A warm ritual piece for gifting, pamper packages, and everyday luxury.' },
];

const applyFilter = (filter: ShopFilter) => {
  if (filter === 'fragrance') return FRAGRANCE_PRODUCTS;
  if (filter === 'hair') return ALL_HAIR_PRODUCTS;
  if (filter === 'new') return shopProducts.filter((product) => product.isNew);
  if (filter === 'best-seller') return shopProducts.filter((product) => product.isBestSeller);
  if (filter === 'under-550') return shopProducts.filter((product) => product.price < 550);
  if (filter === 'over-550') return shopProducts.filter((product) => product.price >= 550);
  return shopProducts;
};

export const Shop: React.FC = () => {
  const [filter, setFilter] = useState<ShopFilter>('all');
  const [sort, setSort] = useState<CatalogSort>('featured');

  const products = useMemo(() => sortProducts(applyFilter(filter), sort), [filter, sort]);
  const activeFilterLabel = filterOptions.find((option) => option.value === filter)?.label ?? 'Filters';

  return (
    <div className="min-h-screen bg-white pb-24 pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Shop</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Shop BISILE.</h1>
          <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
            Discover BISILE fragrance, luxury hair, wigs, bundles, closures, frontals, and wig laundry services.
          </p>
          <div className="mt-10 flex flex-col gap-5 font-inter text-sm font-light text-primary/55 md:flex-row md:items-center md:justify-between">
            <p>{products.length} of {shopProducts.length} items</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <BisileSelect
                value={filter}
                options={filterOptions}
                onChange={setFilter}
                ariaLabel="Filter shop products"
                icon={<SlidersHorizontal size={15} strokeWidth={1.25} />}
                className="min-w-[13rem]"
              />
              <BisileSelect
                value={sort}
                options={SORT_OPTIONS}
                onChange={setSort}
                ariaLabel="Sort shop products"
                className="min-w-[13rem]"
              />
            </div>
          </div>
        </FadeIn>
        <div className="mt-8 border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {activeFilterLabel} / {SORT_OPTIONS.find((option) => option.value === sort)?.label}
        </div>
        {products.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => <FadeIn key={product.id} delay={index * 45}><ProductCard product={product} /></FadeIn>)}
          </div>
        ) : (
          <div className="mt-10 border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/60">
            No products match this filter.
          </div>
        )}
      </section>

      <section className="bisile-shell bisile-section">
        <div>
          <FadeIn>
            <p className="bisile-kicker mb-3">By enquiry</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Discovery and home fragrance.</h2>
          </FadeIn>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {enquiryItems.map((item, index) => (
              <FadeIn key={item.name} delay={index * 80}>
                <div className="bisile-image-frame aspect-square"><img src={item.image} alt={item.name} className="editorial-image" /></div>
                <div className="p-6">
                  <h3 className="font-inter text-sm font-normal">{item.name}</h3>
                  <p className="mt-2 font-inter text-sm font-light leading-6 text-primary/60">{item.body}</p>
                  <a href={getWhatsAppUrl(`Hello BISILE, I would like to enquire about the ${item.name}.`)} target="_blank" rel="noreferrer" className="bisile-link mt-5">Enquire <ArrowRight size={14} /></a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
