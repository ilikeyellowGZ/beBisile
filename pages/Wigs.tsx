import React, { useMemo, useState } from 'react';
import { ArrowRight, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { CONTACT_PHONE, WIG_PRODUCTS, getWhatsAppUrl } from '../constants';

type WigTier = 'all' | 'everyday' | 'soft' | 'premium';

const tierOptions: Array<{ value: WigTier; label: string }> = [
  { value: 'all', label: 'All Wigs' },
  { value: 'everyday', label: 'Everyday Luxury' },
  { value: 'soft', label: 'Soft Luxurious Quality' },
  { value: 'premium', label: 'Premium Luxury' },
];

const getTierProducts = (tier: WigTier) => {
  if (tier === 'everyday') return WIG_PRODUCTS.filter((product) => product.subtitle.includes('Everyday'));
  if (tier === 'soft') return WIG_PRODUCTS.filter((product) => product.subtitle.includes('Soft'));
  if (tier === 'premium') return WIG_PRODUCTS.filter((product) => product.subtitle.includes('Premium'));
  return WIG_PRODUCTS;
};

export const Wigs: React.FC = () => {
  const [tier, setTier] = useState<WigTier>('all');
  const products = useMemo(() => getTierProducts(tier), [tier]);

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Hair / Wigs</p>
          <p className="bisile-kicker mb-3">Bhelekazi Wigs</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Luxury wigs crafted with refined finishes.</h1>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Premium processed virgin hair, lace closures, HD lace details and polished styles made for everyday confidence and luxury.
          </p>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <FadeIn>
            <p className="bisile-kicker mb-3">BISILE Hair Collection</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Bhelekazi Wigs.</h2>
          </FadeIn>
          <label className="field-light flex h-11 items-center gap-2 px-3">
            <SlidersHorizontal size={15} strokeWidth={1.25} className="text-[#8A6F35]" />
            <span className="sr-only">Filter wigs</span>
            <select value={tier} onChange={(event) => setTier(event.target.value as WigTier)} className="h-full min-w-52 bg-transparent font-inter text-sm font-light text-[#2A2114] outline-none">
              {tierOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {tierOptions.find((option) => option.value === tier)?.label} / {products.length} wig{products.length === 1 ? '' : 's'}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 45}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bisile-shell bisile-section border-t bisile-rule">
        <FadeIn>
          <p className="bisile-kicker mb-3">Premium Luxury Note</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Customise with care.</h2>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Our Premium Luxury Hair allows complimentary colour and closure customisation. Length changes incur additional costs. Wig customisations are available through WhatsApp.
          </p>
          <a href={getWhatsAppUrl('Hello BISILE, I would like to enquire about custom Bhelekazi wigs.')} target="_blank" rel="noreferrer" className="bisile-link mt-6">
            <MessageCircle size={15} /> WhatsApp Us {CONTACT_PHONE} <ArrowRight size={14} />
          </a>
        </FadeIn>
      </section>
    </div>
  );
};
