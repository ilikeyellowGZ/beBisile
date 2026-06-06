import React, { useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { FRAGRANCE_PRODUCTS, getWhatsAppUrl } from '../constants';
import { SORT_OPTIONS, type CatalogSort, sortProducts } from '../utils/catalog';

type FragranceFilter = 'all' | 'new' | 'best-seller' | 'under-550' | 'over-550';

const filterOptions: Array<{ value: FragranceFilter; label: string }> = [
  { value: 'all', label: 'All fragrance' },
  { value: 'new', label: 'New' },
  { value: 'best-seller', label: 'Best sellers' },
  { value: 'under-550', label: 'Under R550' },
  { value: 'over-550', label: 'R550 and over' },
];

const enquiryItems = [
  { name: 'Discovery Set', image: '/media/bisile/perfume-picnic.jpg', body: 'Sample the BISILE fragrance wardrobe before choosing your full-size scent.' },
  { name: 'Diffuser', image: '/media/bisile/perfume-basket.jpg', body: 'Home fragrance for a softer atmosphere and a more considered room ritual.' },
  { name: 'Candle', image: '/media/bisile/packaging-black.jpg', body: 'A warm ritual piece for gifting, pamper packages, and everyday luxury.' },
];

const applyFilter = (filter: FragranceFilter) => {
  if (filter === 'new') return FRAGRANCE_PRODUCTS.filter((product) => product.isNew);
  if (filter === 'best-seller') return FRAGRANCE_PRODUCTS.filter((product) => product.isBestSeller);
  if (filter === 'under-550') return FRAGRANCE_PRODUCTS.filter((product) => product.price < 550);
  if (filter === 'over-550') return FRAGRANCE_PRODUCTS.filter((product) => product.price >= 550);
  return FRAGRANCE_PRODUCTS;
};

export const Shop: React.FC = () => {
  const [filter, setFilter] = useState<FragranceFilter>('all');
  const [sort, setSort] = useState<CatalogSort>('featured');

  const products = useMemo(() => sortProducts(applyFilter(filter), sort), [filter, sort]);
  const activeFilterLabel = filterOptions.find((option) => option.value === filter)?.label ?? 'Filters';

  return (
    <div className="min-h-screen bg-white pb-24 pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Fragrance</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Fragrance</h1>
          <div className="mt-10 flex flex-col gap-5 font-inter text-sm font-light text-primary/55 md:flex-row md:items-center md:justify-between">
            <p>{products.length} of {FRAGRANCE_PRODUCTS.length} items</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex h-11 items-center gap-2 border border-[#e5e2dd] bg-white px-3">
                <SlidersHorizontal size={15} strokeWidth={1.25} />
                <span className="sr-only">Filter fragrance</span>
                <select value={filter} onChange={(event) => setFilter(event.target.value as FragranceFilter)} className="h-full min-w-40 bg-transparent text-sm font-light outline-none">
                  {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="flex h-11 items-center border border-[#e5e2dd] bg-white px-3">
                <span className="sr-only">Sort fragrance</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as CatalogSort)} className="h-full min-w-44 bg-transparent text-sm font-light outline-none">
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
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
            No fragrance products match this filter.
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
