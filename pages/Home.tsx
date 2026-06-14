import React, { useEffect } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { HeroSplit } from '../components/Layout/HeroSplit';
import { ProductCard } from '../components/UI/ProductCard';
import { FRAGRANCE_PRODUCTS, HAIR_PRODUCTS } from '../constants';
import { backgroundImages, fragranceImages, hairImages, heroImages, packageImages } from '../src/assets/images';

const editorialCards = [
  {
    title: 'Gift-ready rituals',
    body: 'Pamper packages and scent pairings prepared for intimate celebrations and thoughtful care.',
    image: packageImages.product04,
    path: '/pamper',
  },
  {
    title: 'Beauty maintenance',
    body: 'Wig wash, treatments, curl activation, plucking, dye, and complete laundry packages.',
    image: hairImages.straightWig07,
    path: '/hair/laundry',
  },
];

const googleReviews = [
  {
    name: 'Mandisa Pearl Mzizi',
    body: 'I love the BISILE perfumes. My favorite is Indoniyamanzi, and their curly hair is stunning. Service, packaging and delivery are top tier.',
  },
  {
    name: 'Phindile Mndau',
    body: 'The best service ever. From placing my order to delivery, everything was professional. Indoniyamanzi smells divine.',
  },
  {
    name: 'Nokukhanya Hlanguza',
    body: 'The fragrance smells amazing and BISILE packaging screams luxury. I highly recommend the product.',
  },
  {
    name: 'Noxolo Nxele',
    body: 'The hair is top notch quality. It comes in impressive boxing with everything you need for the installation.',
  },
  {
    name: 'Mumsy Zungu',
    body: 'Indoniyamanzi smells really classy and exquisite. It gave me confidence in public and in the workplace.',
  },
  {
    name: 'Widadh Klein',
    body: 'Stunning packaging, excellent service, and the perfume smells absolutely amazing.',
  },
];

const luxuryCategories = [
  {
    label: 'Discovery Set',
    body: 'Discover fragrances that capture the essence of women - subtle, earthly, and effortlessly powerful.',
    image: packageImages.product01,
    path: '/shop',
    fit: 'cover',
  },
  {
    label: 'Premium Hair',
    body: 'BhelekWigs, bundles, closures and wig care shaped around polished everyday beauty.',
    image: hairImages.straightWig01,
    path: '/hair',
    fit: 'cover',
  },
  {
    label: 'Fragrances',
    body: 'The Imvelo Collection, made for quiet presence and memorable finishing rituals.',
    image: fragranceImages.indoniyamanzi,
    path: '/fragrances',
    fit: 'contain',
  },
];

export const Home: React.FC = () => {
  const location = useLocation();
  const state = location.state as { scrollTo?: string } | null;

  useEffect(() => {
    if (state?.scrollTo) window.setTimeout(() => document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [state?.scrollTo]);

  return (
    <div className="overflow-x-hidden bg-[#F7F4EF] text-primary">
      <h1 className="sr-only">BISILE Be Luxury</h1>

      <HeroSplit />

      <section id="bisile-discovery" className="bisile-shell bisile-section border-b bisile-rule" data-navbar-theme="discovery">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <FadeIn>
            <p className="bisile-kicker mb-3">BISILE worlds</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Our luxury categories.</h2>
          </FadeIn>
          <Link to="/shop" className="bisile-link md:mb-1">Shop all <ArrowRight size={15} strokeWidth={1.3} /></Link>
        </div>

        <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {luxuryCategories.map((item, index) => (
            <FadeIn key={item.label} delay={index * 70}>
              <Link to={item.path} className="group block">
                <div className="bisile-image-frame aspect-[4/5]">
                  <img loading="lazy" src={item.image} alt={item.label} className={item.fit === 'contain' ? 'h-full w-full object-contain p-10 transition-transform duration-500 group-hover:scale-[1.035] sm:p-12' : 'editorial-image'} />
                </div>
                <div className="mt-4 flex items-start justify-between gap-6">
                  <div>
                    <p className="mb-2 font-inter text-xs font-light text-primary/35">{String(index + 1).padStart(2, '0')}</p>
                    <h3 className="font-inter text-sm font-normal text-primary">{item.label}</h3>
                    <p className="mt-1 max-w-sm font-inter text-sm font-light leading-6 text-primary/60">{item.body}</p>
                  </div>
                  <ArrowRight size={18} strokeWidth={1.2} className="mt-7 shrink-0 text-primary/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <FadeIn>
          <Link to="/shop" className="group block">
            <div className="bisile-image-frame aspect-[16/9] md:aspect-[16/7]">
              <img loading="lazy" src={heroImages.fragrance03} alt="BISILE fragrance bottle and packaging" className="editorial-image" />
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

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex items-end justify-between gap-6">
          <FadeIn>
            <p className="bisile-kicker mb-3">BISILE fragrance</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">A quiet scent wardrobe.</h2>
          </FadeIn>
          <Link to="/fragrances" className="bisile-link hidden md:inline-flex">Shop fragrance <ArrowRight size={15} strokeWidth={1.3} /></Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FRAGRANCE_PRODUCTS.slice(0, 4).map((product, index) => <FadeIn key={product.id} delay={index * 60}><ProductCard product={product} /></FadeIn>)}
        </div>
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
          <h2 className="max-w-md font-inter text-3xl font-light leading-tight md:text-5xl">Beauty that elevates your presence.</h2>
          <p className="mt-6 max-w-xl font-inter text-sm font-light leading-7 text-primary/62">
            BISILE is a luxury beauty house built around the moments that make a woman feel finished: fragrance, hair, gifting, and care. The brand has grown from personal beauty service into a fuller world of refined products and rituals.
          </p>
          <p className="mt-6 font-inter text-sm text-primary">Be Luxury.</p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="bisile-image-frame aspect-[4/3]">
            <img loading="lazy" src={backgroundImages.gifting} alt="BISILE product arrangement" className="editorial-image" />
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
        <div className="border-y bisile-rule py-10 md:py-12">
          <FadeIn>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="bisile-kicker mb-3">Google reviews</p>
                <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Loved by the BISILE circle.</h2>
                <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
                  Customer notes from BISILE fragrance and hair clients, with owner replies kept out of the testimonial cards.
                </p>
              </div>
              <a href="https://www.google.com/search?q=bisile.+be+luxury&sxsrf=ANbL-n54GGzsThlIBxU3FBgj-ZNKYaaNeA%3A1780783836635&oq=" target="_blank" rel="noreferrer" className="bisile-link">
                View on Google <ArrowRight size={15} strokeWidth={1.3} />
              </a>
            </div>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1fr_1fr]">
            <FadeIn>
              <div className="flex h-full flex-col justify-between bg-[#f7f5f1] p-6">
                <div>
                  <p className="font-inter text-5xl font-light leading-none">4.9</p>
                  <div className="mt-4 flex gap-1 text-accent" aria-label="Five star rating">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} fill="currentColor" strokeWidth={1.1} />)}
                  </div>
                </div>
                <p className="mt-8 font-inter text-sm font-light leading-6 text-primary/55">
                  Based on 14 Google reviews, highlighting fragrance, packaging, service, delivery, and premium hair quality.
                </p>
              </div>
            </FadeIn>
            {googleReviews.map((review, index) => (
              <FadeIn key={review.name} delay={(index + 1) * 70}>
                <article className="flex h-full flex-col justify-between border border-[#e5e2dd] p-6">
                  <div className="flex gap-1 text-accent" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} size={13} fill="currentColor" strokeWidth={1.1} />)}
                  </div>
                  <p className="mt-8 font-inter text-sm font-light leading-7 text-primary/62">"{review.body}"</p>
                  <p className="mt-8 font-inter text-xs font-light uppercase tracking-[0.16em] text-primary/45">{review.name}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
