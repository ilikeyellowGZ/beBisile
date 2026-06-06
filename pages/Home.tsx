import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { DELIVERY_OPTIONS, FRAGRANCE_PRODUCTS, HAIR_PRODUCTS, getWhatsAppUrl } from '../constants';

const featureCards = [
  {
    title: 'Signature fragrance',
    body: 'A considered scent wardrobe for daily ritual, soft presence, and memorable finishing moments.',
    images: [
      '/media/bisile/perfume-bottles.jpg',
      '/media/bisile/hero-perfume.jpg',
      '/media/bisile/perfume-basket.jpg',
      '/media/bisile/perfume-picnic.jpg',
      '/media/bisile/packaging-black.jpg',
    ],
    path: '/shop',
  },
  {
    title: 'Processed virgin hair',
    body: 'Polished wigs, bundles, closures, and laundry care selected for an effortless luxury finish.',
    images: [
      '/media/bisile/wig-straight.jpg',
      '/media/bisile/bundles-curly.jpg',
      '/media/bisile/laundry.png',
      '/media/bisile/perfume-picnic.jpg',
      '/media/bisile/packaging-black.jpg',
    ],
    path: '/hair',
  },
];

const editorialCards = [
  {
    title: 'Gift-ready rituals',
    body: 'Pamper packages and scent pairings prepared for intimate celebrations and thoughtful care.',
    image: '/media/bisile/perfume-picnic.jpg',
    path: '/pamper',
  },
  {
    title: 'Beauty maintenance',
    body: 'Wig wash, treatments, curl activation, plucking, dye, and complete laundry packages.',
    image: '/media/bisile/laundry.png',
    path: '/hair',
  },
];

const CyclingFeatureCard: React.FC<{
  title: string;
  body: string;
  images: string[];
  path: string;
  delay?: number;
}> = ({ title, body, images, path, delay = 0 }) => {
  const [activeImage, setActiveImage] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        setActiveImage((current) => (current + 1) % images.length);
      }, 4300);
    }, delay);

    return () => {
      window.clearTimeout(start);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [delay, images.length]);

  useEffect(() => {
    if (!imageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      imageRef.current,
      { autoAlpha: 0, scale: 1.035 },
      { autoAlpha: 1, scale: 1, duration: 1.15, ease: 'power2.out' }
    );
  }, [activeImage]);

  useEffect(() => {
    if (!frameRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      frameRef.current,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.9, delay: delay / 1000, ease: 'power3.out' }
    );
  }, [delay]);

  return (
    <Link to={path} className="group block">
      <div ref={frameRef} className="bisile-image-frame relative aspect-square bg-[#f7f5f1]">
        <img
          ref={imageRef}
          src={images[activeImage]}
          alt={`${title} editorial ${activeImage + 1}`}
          className="editorial-image"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {images.map((image, index) => (
            <span
              key={image}
              className={`h-[2px] w-7 transition-colors duration-300 ${index === activeImage ? 'bg-white' : 'bg-white/35'}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h2 className="font-inter text-sm font-normal">{title}</h2>
          <p className="mt-1 max-w-md font-inter text-sm font-light leading-6 text-primary/60">{body}</p>
        </div>
        <ArrowRight size={18} strokeWidth={1.2} className="mt-1 shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

export const Home: React.FC = () => {
  const location = useLocation();
  const state = location.state as { scrollTo?: string } | null;

  useEffect(() => {
    if (state?.scrollTo) window.setTimeout(() => document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [state?.scrollTo]);

  return (
    <div className="overflow-x-hidden bg-white pt-16 text-primary">
      <h1 className="sr-only">BISILE Be Luxury</h1>

      <section className="bisile-landing-hero">
        <div className="bisile-shell grid gap-6 py-6 md:grid-cols-2 md:pb-16">
          {featureCards.map((item, index) => (
            <FadeIn key={item.title} delay={index * 80}>
              <CyclingFeatureCard {...item} delay={index * 700} />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex items-end justify-between gap-6">
          <FadeIn>
            <p className="bisile-kicker mb-3">BISILE fragrance</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">A quiet scent wardrobe.</h2>
          </FadeIn>
          <Link to="/shop" className="bisile-link hidden md:inline-flex">Shop fragrance <ArrowRight size={15} strokeWidth={1.3} /></Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FRAGRANCE_PRODUCTS.slice(0, 4).map((product, index) => <FadeIn key={product.id} delay={index * 60}><ProductCard product={product} /></FadeIn>)}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <FadeIn>
          <Link to="/shop" className="group block">
            <div className="bisile-image-frame aspect-[16/9] md:aspect-[16/7]">
              <img loading="lazy" src="/media/bisile/hero-perfume.jpg" alt="BISILE fragrance bottle and packaging" className="editorial-image" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-6">
              <div>
                <h2 className="font-inter text-sm font-normal">Be Luxury</h2>
                <p className="mt-1 max-w-2xl font-inter text-sm font-light leading-6 text-primary/60">
                  Fragrance, hair, gifting, and care shaped around the small rituals that make beauty feel personal.
                </p>
              </div>
              <ArrowRight size={18} strokeWidth={1.2} className="mt-1 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section grid gap-6 md:grid-cols-[1fr_2fr]">
        {editorialCards.map((item, index) => (
          <FadeIn key={item.title} delay={index * 90}>
            <Link to={item.path} className="group block">
              <div className={`bisile-image-frame ${index === 0 ? 'aspect-square' : 'aspect-square md:aspect-[2/1]'}`}>
                <img loading="lazy" src={item.image} alt={item.title} className="editorial-image" />
              </div>
              <h2 className="mt-4 font-inter text-sm font-normal">{item.title}</h2>
              <p className="mt-1 max-w-xl font-inter text-sm font-light leading-6 text-primary/60">{item.body}</p>
            </Link>
          </FadeIn>
        ))}
      </section>

      <section id="our-story" className="bisile-shell bisile-section grid gap-10 border-y bisile-rule md:grid-cols-[0.88fr_1.12fr] md:items-center">
        <FadeIn>
          <p className="bisile-kicker mb-4">About BISILE</p>
          <h2 className="max-w-md font-inter text-3xl font-light leading-tight md:text-5xl">Beauty that feels considered.</h2>
          <p className="mt-6 max-w-xl font-inter text-sm font-light leading-7 text-primary/62">
            BISILE is a luxury beauty destination built around fragrance, processed virgin hair, wig care, and gifting rituals. Every product is selected to make self-care feel polished, personal, and easy to love.
          </p>
          <p className="mt-6 font-inter text-sm text-primary">Be Luxury.</p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="bisile-image-frame aspect-[4/3]">
            <img loading="lazy" src="/media/bisile/perfume-basket.jpg" alt="BISILE product arrangement" className="editorial-image" />
          </div>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex items-end justify-between gap-6">
          <FadeIn>
            <p className="bisile-kicker mb-3">Hair collection</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Processed virgin hair.</h2>
          </FadeIn>
          <Link to="/hair" className="bisile-link hidden md:inline-flex">View hair <ArrowRight size={15} strokeWidth={1.3} /></Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {HAIR_PRODUCTS.slice(0, 4).map((product, index) => <FadeIn key={product.id} delay={index * 60}><ProductCard product={product} /></FadeIn>)}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="border-y bisile-rule py-8">
          <FadeIn>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="bisile-kicker mb-3">Delivery</p>
                <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Choose your delivery.</h2>
              </div>
              <a href={getWhatsAppUrl('Hello BISILE, I would like assistance with a product or order concern.')} target="_blank" rel="noreferrer" className="bisile-link">
                <MessageCircle size={16} strokeWidth={1.3} /> WhatsApp support
              </a>
            </div>
          </FadeIn>
          <div className="mt-9 grid gap-6 md:grid-cols-5">
            {DELIVERY_OPTIONS.map((option, index) => (
              <FadeIn key={option.name} delay={index * 50}>
                <div>
                  <h3 className="font-inter text-sm font-normal">{option.name}</h3>
                  <p className="mt-2 font-inter text-sm font-light leading-6 text-primary/55">{option.price}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
