import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { getWhatsAppUrl } from '../constants';

const packages = [
  { name: 'The Essential', subtitle: 'A thoughtful gesture', price: 'By consultation', image: '/media/bisile/perfume-picnic.jpg', includes: ['BISILE fragrance option', 'Beauty ritual add-on', 'Gift-ready presentation'] },
  { name: 'The Indulgence', subtitle: 'A full pause from the noise', price: 'By consultation', image: '/media/bisile/perfume-basket.jpg', includes: ['Full-size BISILE fragrance', 'Hair or beauty care add-on', 'Curated luxury finish'], featured: true },
  { name: 'The Bespoke', subtitle: 'Made personally', price: 'By consultation', image: '/media/bisile/packaging-black.jpg', includes: ['Private consultation', 'Custom product selection', 'Personal gift note', 'Concierge service'] },
];

export const CarePackages: React.FC = () => (
  <div className="min-h-screen bg-secondary pt-20">
    <section className="mx-auto grid max-w-[1480px] gap-5 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-12">
      <div className="relative min-h-[560px] overflow-hidden"><img src="/media/bisile/perfume-basket.jpg" alt="BISILE pamper packages" className="editorial-image absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-8 pt-28 text-white"><p className="text-[10px] uppercase tracking-[0.22em]">The gifting edit</p><h1 className="mt-3 max-w-2xl font-serif text-6xl leading-[0.9] md:text-8xl">Curated care.</h1></div></div>
      <div className="flex items-end bg-secondary p-8"><div><p className="text-[10px] uppercase tracking-[0.2em] text-accent">Three ways to show care</p><p className="mt-4 text-sm leading-7 text-primary/60">For celebration, restoration, and the gentle reminder that somebody is thinking of you.</p></div></div>
    </section>
    <section className="mx-auto max-w-[1480px] px-6 py-16 md:px-12 md:py-20">
      <h2 className="mb-10 font-serif text-5xl md:text-7xl">Choose the moment.</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {packages.map((item, index) => <FadeIn key={item.name} delay={index * 80} className="flex h-full flex-col border border-black/10 bg-white"><div className="aspect-[4/3] overflow-hidden"><img loading="lazy" src={item.image} alt={item.name} className="editorial-image h-full w-full object-cover" /></div><div className="flex flex-1 flex-col p-7"><p className="text-[9px] uppercase tracking-[0.18em] text-accent">{item.subtitle}</p><h3 className="mt-3 font-subhead text-3xl">{item.name}</h3><p className="mt-2 text-xs text-primary/55">{item.price}</p><ul className="mt-6 flex-1 space-y-3 border-t border-black/10 pt-5 text-xs leading-6 text-primary/60">{item.includes.map((line) => <li key={line} className="flex gap-3"><Check size={13} className="mt-1 shrink-0 text-accent" />{line}</li>)}</ul><a href={getWhatsAppUrl(`Hello BISILE, I would like to order ${item.name}.`)} target="_blank" rel="noreferrer" className="mt-7 flex items-center justify-between border border-primary px-5 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">Select package <ArrowRight size={14} /></a></div></FadeIn>)}
      </div>
    </section>
  </div>
);
