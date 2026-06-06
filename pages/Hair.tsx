import React, { useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { ALL_HAIR_PRODUCTS, WIG_PRODUCTS } from '../constants';
import { CLOSURE_PRODUCT, BUNDLE_PRODUCTS, HAIR_CATEGORY_LINKS, WIG_LAUNDRY_PRODUCT } from '../data/hairCatalog';

type HairCategory = 'all' | 'wigs' | 'bundles' | 'closures' | 'laundry';

const filters: Array<{ value: HairCategory; label: string }> = [
  { value: 'all', label: 'All Hair' },
  { value: 'wigs', label: 'Wigs' },
  { value: 'bundles', label: 'Bundles' },
  { value: 'closures', label: 'Closures & Frontals' },
  { value: 'laundry', label: 'Wig Laundry' },
];

export const Hair: React.FC = () => {
  const [filter, setFilter] = useState<HairCategory>('all');

  const products = useMemo(() => {
    if (filter === 'wigs') return WIG_PRODUCTS;
    if (filter === 'bundles') return BUNDLE_PRODUCTS;
    if (filter === 'closures') return [CLOSURE_PRODUCT];
    if (filter === 'laundry') return [WIG_LAUNDRY_PRODUCT];
    return ALL_HAIR_PRODUCTS;
  }, [filter]);

  return (
    <div className="min-h-screen bg-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Hair</p>
          <p className="bisile-kicker mb-3">Hair</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">The Hair Collection.</h1>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Premium processed virgin hair, luxury wigs, bundles, closures and wig laundry services by BISILE.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {HAIR_CATEGORY_LINKS.map((item, index) => (
            <FadeIn key={item.label} delay={index * 60}>
              <Link to={item.path} className="group block">
                <div className="bisile-image-frame aspect-[4/5]">
                  <img src={item.image} alt={item.label} className="editorial-image" />
                </div>
                <h2 className="mt-4 font-inter text-sm font-normal">{item.label}</h2>
                <p className="mt-2 font-inter text-sm font-light leading-6 text-primary/58">{item.description}</p>
                <span className="bisile-link mt-4">{item.cta} <ArrowRight size={14} /></span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <FadeIn>
            <p className="bisile-kicker mb-3">Hair</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Shop by category.</h2>
          </FadeIn>
          <label className="flex h-11 w-full items-center gap-2 border border-[#e5e2dd] bg-white px-3 md:w-auto">
            <SlidersHorizontal size={15} strokeWidth={1.25} />
            <span className="sr-only">Filter hair category</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as HairCategory)} className="h-full min-w-52 bg-transparent font-inter text-sm font-light outline-none">
              {filters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {filters.find((option) => option.value === filter)?.label} / {products.length} item{products.length === 1 ? '' : 's'}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 45}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
};
