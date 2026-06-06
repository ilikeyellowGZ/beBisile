import React, { useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { BUNDLE_PRICE_GROUPS, CLOSURE_PRICE_GROUPS, HAIR_PRODUCTS, SERVICE_PRODUCTS, getWhatsAppUrl } from '../constants';
import { SORT_OPTIONS, type CatalogSort, sortProducts } from '../utils/catalog';

type HairFilter = 'all' | 'everyday' | 'soft' | 'premium' | 'new' | 'best-seller';
type ServiceFilter = 'all' | 'wash' | 'styling' | 'customisation' | 'package';

const hairFilterOptions: Array<{ value: HairFilter; label: string }> = [
  { value: 'all', label: 'All wigs' },
  { value: 'everyday', label: 'Everyday Luxury' },
  { value: 'soft', label: 'Soft Luxurious Quality' },
  { value: 'premium', label: 'Premium Luxury' },
  { value: 'new', label: 'New' },
  { value: 'best-seller', label: 'Best sellers' },
];

const serviceFilterOptions: Array<{ value: ServiceFilter; label: string }> = [
  { value: 'all', label: 'All services' },
  { value: 'wash', label: 'Wash' },
  { value: 'styling', label: 'Styling' },
  { value: 'customisation', label: 'Customisation' },
  { value: 'package', label: 'Packages' },
];

const filterProducts = (filter: HairFilter) => {
  if (filter === 'everyday') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Everyday'));
  if (filter === 'soft') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Soft'));
  if (filter === 'premium') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Premium'));
  if (filter === 'new') return HAIR_PRODUCTS.filter((product) => product.isNew);
  if (filter === 'best-seller') return HAIR_PRODUCTS.filter((product) => product.isBestSeller);
  return HAIR_PRODUCTS;
};

const filterServices = (filter: ServiceFilter) => {
  if (filter === 'wash') return SERVICE_PRODUCTS.filter((product) => product.eyebrow?.toLowerCase().includes('wash'));
  if (filter === 'styling') return SERVICE_PRODUCTS.filter((product) => product.eyebrow?.toLowerCase().includes('styling'));
  if (filter === 'customisation') return SERVICE_PRODUCTS.filter((product) => product.eyebrow?.toLowerCase().includes('customisation'));
  if (filter === 'package') return SERVICE_PRODUCTS.filter((product) => product.eyebrow?.toLowerCase().includes('package'));
  return SERVICE_PRODUCTS;
};

const PriceTable: React.FC<{ title: string; rows: string[][] }> = ({ title, rows }) => (
  <div className="border border-[#e5e2dd] bg-white p-6">
    <h3 className="mb-5 font-inter text-sm font-normal">{title}</h3>
    <div className="space-y-3 font-inter text-sm font-light">
      {rows.map(([length, price]) => (
        <div key={`${title}-${length}`} className="flex justify-between gap-4 border-b border-[#e5e2dd] pb-2 last:border-b-0">
          <span className="text-primary/55">{length}</span>
          <span>{price}</span>
        </div>
      ))}
    </div>
  </div>
);

export const Hair: React.FC = () => {
  const [filter, setFilter] = useState<HairFilter>('all');
  const [sort, setSort] = useState<CatalogSort>('featured');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [serviceSort, setServiceSort] = useState<CatalogSort>('featured');

  const products = useMemo(() => sortProducts(filterProducts(filter), sort), [filter, sort]);
  const serviceProducts = useMemo(() => sortProducts(filterServices(serviceFilter), serviceSort), [serviceFilter, serviceSort]);

  return (
    <div className="min-h-screen bg-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Hair</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Processed virgin hair</h1>
          <p className="mt-5 max-w-xl font-inter text-sm font-light leading-7 text-primary/60">
            Wigs, single bundles, three-bundle sets, closures, frontals, and laundry services with delivery options available.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <FadeIn><div className="bisile-image-frame aspect-square"><img src="/media/bisile/wig-straight.jpg" alt="BISILE straight processed virgin hair" className="editorial-image" /></div></FadeIn>
          <FadeIn delay={80}><div className="bisile-image-frame aspect-square"><img src="/media/bisile/bundles-curly.jpg" alt="BISILE curly processed virgin hair" className="editorial-image" /></div></FadeIn>
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <FadeIn>
          <p className="bisile-kicker mb-3">Wigs</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">The collection.</h2>
        </FadeIn>
        <div className="mt-9 flex flex-col gap-4 border-y bisile-rule py-4 md:flex-row md:items-center md:justify-between">
          <p className="font-inter text-sm font-light text-primary/50">{products.length} of {HAIR_PRODUCTS.length} items</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex h-11 items-center gap-2 border border-[#e5e2dd] bg-white px-3">
              <SlidersHorizontal size={15} strokeWidth={1.25} />
              <span className="sr-only">Filter wigs</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as HairFilter)} className="h-full min-w-48 bg-transparent font-inter text-sm font-light outline-none">
                {hairFilterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="flex h-11 items-center border border-[#e5e2dd] bg-white px-3">
              <span className="sr-only">Sort wigs</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as CatalogSort)} className="h-full min-w-44 bg-transparent font-inter text-sm font-light outline-none">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        {products.length ? (
          <div className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => <FadeIn key={product.id} delay={index * 45}><ProductCard product={product} /></FadeIn>)}
          </div>
        ) : (
          <div className="mt-9 border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/60">No wigs match this filter.</div>
        )}
      </section>

      <section className="bisile-shell bisile-section border-y bisile-rule">
        <div>
          <FadeIn>
            <p className="bisile-kicker mb-3">Bundles and closures</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Price list.</h2>
          </FadeIn>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...BUNDLE_PRICE_GROUPS, ...CLOSURE_PRICE_GROUPS].map((group) => <PriceTable key={group.title} title={group.title} rows={group.rows} />)}
          </div>
          <p className="mt-8 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Proof of payment is required to confirm and process your order. Without proof of payment, the order may be cancelled.
          </p>
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <FadeIn>
          <Sparkles size={20} strokeWidth={1.1} className="mb-5 text-accent" />
          <p className="bisile-kicker mb-3">Wig laundry service</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Refresh the shape.</h2>
        </FadeIn>
        <div className="mt-9 flex flex-col gap-4 border-y bisile-rule py-4 md:flex-row md:items-center md:justify-between">
          <p className="font-inter text-sm font-light text-primary/50">{serviceProducts.length} of {SERVICE_PRODUCTS.length} services</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex h-11 items-center gap-2 border border-[#e5e2dd] bg-white px-3">
              <SlidersHorizontal size={15} strokeWidth={1.25} />
              <span className="sr-only">Filter services</span>
              <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value as ServiceFilter)} className="h-full min-w-44 bg-transparent font-inter text-sm font-light outline-none">
                {serviceFilterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="flex h-11 items-center border border-[#e5e2dd] bg-white px-3">
              <span className="sr-only">Sort services</span>
              <select value={serviceSort} onChange={(event) => setServiceSort(event.target.value as CatalogSort)} className="h-full min-w-44 bg-transparent font-inter text-sm font-light outline-none">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        {serviceProducts.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {serviceProducts.map((product, index) => <FadeIn key={product.id} delay={index * 35}><ProductCard product={product} /></FadeIn>)}
          </div>
        ) : (
          <div className="mt-9 border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/60">No services match this filter.</div>
        )}
        <a href={getWhatsAppUrl('Hello BISILE, I would like to book or ask about wig laundry services.')} target="_blank" rel="noreferrer" className="bisile-link mt-10">Book on WhatsApp <ArrowRight size={14} /></a>
      </section>
    </div>
  );
};
