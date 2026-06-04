import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { FRAGRANCE_PRODUCTS, getWhatsAppUrl } from '../constants';

const enquiryItems = [
  { name: 'Discovery Set', image: '/media/bisile/perfume-picnic.jpg', body: 'Sample the BISILE fragrance wardrobe before choosing your full-size scent.' },
  { name: 'Diffuser', image: '/media/bisile/perfume-basket.jpg', body: 'Home fragrance for a softer atmosphere and a more considered room ritual.' },
  { name: 'Candle', image: '/media/bisile/packaging-black.jpg', body: 'A warm ritual piece for gifting, pamper packages, and everyday luxury.' },
];

export const Shop: React.FC = () => (
  <div className="min-h-screen bg-secondary pb-24 pt-28 text-primary">
    <section className="mx-auto max-w-[1480px] px-6 py-16 md:px-12 md:py-20">
      <FadeIn>
        <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.3em] text-accent">BISILE fragrance</p>
        <h1 className="font-serif text-6xl leading-[0.88] md:text-8xl">The scent <span className="font-subhead italic">wardrobe.</span></h1>
        <p className="mt-6 max-w-xl font-sans text-sm leading-7 text-primary/65">Six signature perfumes with discovery, diffuser, and candle options available by enquiry.</p>
      </FadeIn>
      <div className="mt-14 border-y border-primary/15 py-5 font-sans text-[10px] uppercase tracking-[0.22em] text-primary/55">Perfumes</div>
      <div className="mt-10 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {FRAGRANCE_PRODUCTS.map((product, index) => <FadeIn key={product.id} delay={index * 70}><ProductCard product={product} /></FadeIn>)}
      </div>
    </section>

    <section className="border-y border-black/10 bg-white px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1480px]">
        <FadeIn>
          <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">By enquiry</p>
          <h2 className="font-serif text-5xl md:text-7xl">Discovery and home fragrance.</h2>
        </FadeIn>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {enquiryItems.map((item, index) => (
            <FadeIn key={item.name} delay={index * 80} className="border border-black/10 bg-white">
              <div className="aspect-[4/3] overflow-hidden"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>
              <div className="p-6">
                <h3 className="font-subhead text-2xl">{item.name}</h3>
                <p className="mt-3 font-sans text-xs leading-6 text-primary/60">{item.body}</p>
                <a href={getWhatsAppUrl(`Hello BISILE, I would like to enquire about the ${item.name}.`)} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] hover:text-accent">Enquire <ArrowRight size={14} /></a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  </div>
);
