import React, { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { BUNDLE_PRICE_GROUPS, CLOSURE_PRICE_GROUPS, HAIR_PRODUCTS, SERVICE_PRODUCTS, getWhatsAppUrl } from '../constants';

type HairFilter = 'all' | 'everyday' | 'soft' | 'premium';

const filterProducts = (filter: HairFilter) => {
  if (filter === 'everyday') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Everyday'));
  if (filter === 'soft') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Soft'));
  if (filter === 'premium') return HAIR_PRODUCTS.filter((product) => product.subtitle.includes('Premium'));
  return HAIR_PRODUCTS;
};

const PriceTable: React.FC<{ title: string; rows: string[][] }> = ({ title, rows }) => (
  <div className="border border-black/10 bg-white p-6">
    <h3 className="mb-5 font-subhead text-xl">{title}</h3>
    <div className="space-y-3 font-sans text-xs">
      {rows.map(([length, price]) => (
        <div key={`${title}-${length}`} className="flex justify-between gap-4 border-b border-black/10 pb-2 last:border-b-0">
          <span className="text-primary/55">{length}</span>
          <span>{price}</span>
        </div>
      ))}
    </div>
  </div>
);

export const Hair: React.FC = () => {
  const [filter, setFilter] = useState<HairFilter>('all');
  const products = useMemo(() => filterProducts(filter), [filter]);

  return (
    <div className="min-h-screen bg-secondary pt-24 text-primary">
      <section className="mx-auto grid max-w-[1480px] gap-5 px-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-12">
        <div className="relative min-h-[560px] overflow-hidden bg-white">
          <img src="/media/bisile/wig-straight.jpg" alt="BISILE processed virgin hair" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-8 pt-24 text-white">
            <p className="font-sans text-[10px] uppercase tracking-[0.22em]">BISILE hair collection</p>
            <h1 className="mt-3 max-w-xl font-serif text-6xl leading-[0.9] md:text-8xl">Processed virgin hair.</h1>
          </div>
        </div>
        <div className="grid gap-5">
          <div className="overflow-hidden bg-white"><img src="/media/bisile/bundles-curly.jpg" alt="BISILE curly hair" className="h-full w-full object-cover" /></div>
          <div className="border border-black/10 bg-white p-7">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-accent">Everyday, soft, premium</p>
            <p className="mt-3 font-sans text-xs leading-6 text-primary/60">Wigs, single bundles, three-bundle sets, closures, frontals, and laundry services with delivery options available.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-6 py-16 md:px-12 md:py-20">
        <FadeIn>
          <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Wigs</p>
          <h2 className="font-serif text-5xl md:text-7xl">The collection.</h2>
        </FadeIn>
        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-y border-black/10 py-4">
          {[
            ['all', 'All wigs'],
            ['everyday', 'Everyday Luxury'],
            ['soft', 'Soft Luxurious Quality'],
            ['premium', 'Premium Luxury'],
          ].map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value as HairFilter)} className={`font-sans text-[10px] uppercase tracking-[0.18em] ${filter === value ? 'text-accent' : 'text-primary/55 hover:text-primary'}`}>{label}</button>
          ))}
        </div>
        <div className="mt-9 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => <FadeIn key={product.id} delay={index * 55}><ProductCard product={product} /></FadeIn>)}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1480px]">
          <FadeIn>
            <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Bundles and closures</p>
            <h2 className="font-serif text-5xl md:text-7xl">Price list.</h2>
          </FadeIn>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...BUNDLE_PRICE_GROUPS, ...CLOSURE_PRICE_GROUPS].map((group) => <PriceTable key={group.title} title={group.title} rows={group.rows} />)}
          </div>
          <p className="mt-8 max-w-2xl font-sans text-xs leading-7 text-primary/60">
            Proof of payment is required to confirm and process your order. Without proof of payment, the order may be cancelled.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-6 py-16 md:px-12 md:py-20">
        <FadeIn>
          <Sparkles size={22} strokeWidth={1.1} className="mb-5 text-accent" />
          <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.22em] text-accent">Wig laundry service</p>
          <h2 className="font-serif text-5xl leading-none md:text-7xl">Refresh the shape.</h2>
        </FadeIn>
        <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_PRODUCTS.map((product, index) => <FadeIn key={product.id} delay={index * 45}><ProductCard product={product} /></FadeIn>)}
        </div>
        <a href={getWhatsAppUrl('Hello BISILE, I would like to book or ask about wig laundry services.')} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-accent">Book on WhatsApp <ArrowRight size={14} /></a>
      </section>
    </div>
  );
};
