import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, MessageCircle, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { DELIVERY_OPTIONS, FRAGRANCE_PRODUCTS, HAIR_PRODUCTS, getWhatsAppUrl } from '../constants';

const reviews = [
  { quote: 'The fragrance feels personal and elegant. It settles beautifully and lasts through the day.', name: 'Amara N.', product: 'Indoniyamanzi' },
  { quote: 'My wig arrived beautifully finished and the WhatsApp support made ordering easy.', name: 'Nandi K.', product: 'BISILE Hair Collection' },
  { quote: 'The packaging, the service, and the scent all feel carefully considered.', name: 'Lerato M.', product: 'BISILE Fragrance' },
];

export const Home: React.FC = () => {
  const location = useLocation();
  const state = location.state as { scrollTo?: string } | null;
  const bottleRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (state?.scrollTo) window.setTimeout(() => document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [state?.scrollTo]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !bottleRef.current) return;
    const tween = gsap.to(bottleRef.current, { y: -14, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    return () => tween.kill();
  }, []);

  return (
    <div className="overflow-hidden bg-secondary text-primary">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-primary">
        <img src="/media/bisile/hero-perfume.jpg" alt="BISILE perfume editorial" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10" />
        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1480px] items-center gap-10 px-6 pb-16 pt-28 md:grid-cols-12 md:px-12">
          <div className="md:col-span-7">
            <p className="reveal-up mb-5 font-sans text-[10px] uppercase tracking-[0.34em] text-accent">BISILE / Be luxury</p>
            <h1 className="reveal-up font-serif text-6xl leading-[0.84] text-white md:text-9xl" style={{ animationDelay: '100ms' }}>
              RADICAL
              <span className="block pl-8 font-subhead text-[0.78em] font-light italic md:pl-20">FRAGRANCE</span>
            </h1>
            <p className="reveal-up mt-7 max-w-md border-l border-accent pl-5 font-sans text-xs leading-7 tracking-[0.1em] text-white/80" style={{ animationDelay: '220ms' }}>
              A curated world of fragrance, processed virgin hair, beauty rituals, and everyday luxury.
            </p>
            <div className="reveal-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: '320ms' }}>
              <Link to="/shop" className="border border-white/70 px-7 py-4 font-sans text-[10px] uppercase tracking-[0.22em] text-white transition-colors hover:border-accent hover:text-accent">Discover fragrance</Link>
              <Link to="/hair" className="px-3 py-4 font-sans text-[10px] uppercase tracking-[0.22em] text-white/80 transition-colors hover:text-accent">Explore hair <ArrowRight size={14} className="ml-2 inline" /></Link>
            </div>
          </div>
          <FadeIn delay={350} className="relative hidden h-full items-center justify-end md:col-span-5 md:flex">
            <img ref={bottleRef} src="/media/bisile/perfume-bottles.jpg" alt="BISILE perfumes" className="relative z-10 w-80 object-cover shadow-2xl will-change-transform" />
          </FadeIn>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-12 flex items-end justify-between gap-6">
            <FadeIn>
              <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Fragrance catalog</p>
              <h2 className="font-serif text-5xl md:text-7xl">Signature scents.</h2>
            </FadeIn>
            <Link to="/shop" className="hidden items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-accent md:flex">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {FRAGRANCE_PRODUCTS.slice(0, 4).map((product, index) => <FadeIn key={product.id} delay={index * 80}><ProductCard product={product} /></FadeIn>)}
          </div>
        </div>
      </section>

      <section id="our-story" className="grid border-y border-black/10 bg-white md:grid-cols-2">
        <div className="flex items-center px-7 py-20 md:px-16 md:py-28">
          <FadeIn>
            <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">About BISILE</p>
            <h2 className="max-w-xl font-serif text-5xl leading-[0.94] md:text-7xl">Beauty that feels considered.</h2>
            <p className="mt-7 max-w-lg font-sans text-sm leading-8 text-primary/65">
              BISILE is a luxury beauty destination built around fragrance, processed virgin hair, wig care, and gifting rituals. Every piece is selected to make self-care feel polished, personal, and easy to love.
            </p>
            <p className="mt-6 font-subhead text-xl italic text-accent">Be Luxury.</p>
          </FadeIn>
        </div>
        <div className="min-h-[540px] overflow-hidden"><img loading="lazy" src="/media/bisile/perfume-basket.jpg" alt="BISILE product arrangement" className="h-full w-full object-cover" /></div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1480px]">
          <FadeIn className="mb-12">
            <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Hair collection</p>
            <h2 className="font-serif text-5xl md:text-7xl">Processed virgin hair.</h2>
          </FadeIn>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {HAIR_PRODUCTS.slice(0, 4).map((product, index) => <FadeIn key={product.id} delay={index * 80}><ProductCard product={product} /></FadeIn>)}
          </div>
          <Link to="/hair" className="mt-10 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-accent">View hair catalog <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="grid border-y border-black/10 bg-white md:grid-cols-3">
        {[
          { title: 'Pamper Packages', body: 'Three considered gifting options for beauty rituals and thoughtful care.', image: '/media/bisile/perfume-picnic.jpg', path: '/pamper' },
          { title: 'Creator Community', body: 'Applications for content creators who align with BISILE beauty and luxury.', image: '/media/bisile/packaging-black.jpg', path: '/community' },
          { title: 'Wig Laundry', body: 'Wash, treatment, customisation, and full laundry packages.', image: '/media/bisile/laundry.png', path: '/hair' },
        ].map((item, index) => (
          <FadeIn key={item.title} delay={index * 90}>
            <Link to={item.path} className="group block border-b border-black/10 p-6 md:border-b-0 md:border-r">
              <div className="aspect-[4/5] overflow-hidden bg-secondary"><img loading="lazy" src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
              <h3 className="mt-5 font-subhead text-xl">{item.title}</h3>
              <p className="mt-2 font-sans text-xs leading-6 text-primary/60">{item.body}</p>
            </Link>
          </FadeIn>
        ))}
      </section>

      <section className="px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1260px]">
          <FadeIn>
            <p className="mb-3 text-center font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Delivery</p>
            <h2 className="text-center font-serif text-5xl md:text-7xl">Choose your delivery.</h2>
          </FadeIn>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {DELIVERY_OPTIONS.map((option) => (
              <FadeIn key={option.name} className="border border-black/10 bg-white p-6">
                <h3 className="font-subhead text-lg">{option.name}</h3>
                <p className="mt-3 font-sans text-xs leading-6 text-primary/60">{option.price}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1260px]">
          <FadeIn>
            <p className="mb-3 text-center font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Customer reviews</p>
            <h2 className="text-center font-serif text-5xl md:text-7xl">Loved in the details.</h2>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => (
              <FadeIn key={review.name} delay={index * 80} className="border border-black/10 bg-white p-7">
                <div className="mb-5 flex gap-1 text-accent">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={12} fill="currentColor" />)}</div>
                <p className="font-subhead text-xl italic leading-8">{review.quote}</p>
                <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.16em] text-primary/50">{review.name} / {review.product}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="grid bg-white md:grid-cols-2">
        <div className="px-7 py-16 md:px-16 md:py-20">
          <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.24em] text-accent">Checkout</p>
          <h2 className="font-serif text-5xl">Personal details before payment.</h2>
          <Link to="/cart" className="mt-7 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-accent">Go to cart <ArrowRight size={14} /></Link>
        </div>
        <div className="border-t border-black/10 bg-white px-7 py-16 md:border-l md:border-t-0 md:px-16 md:py-20">
          <MessageCircle size={22} strokeWidth={1.2} className="mb-4 text-accent" />
          <h2 className="font-serif text-5xl">Need support?</h2>
          <a href={getWhatsAppUrl('Hello BISILE, I would like assistance with a product or order concern.')} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-accent">Start a WhatsApp chat <ArrowRight size={14} /></a>
        </div>
      </section>
    </div>
  );
};
