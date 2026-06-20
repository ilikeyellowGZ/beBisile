import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { HeroSplit } from '../components/Layout/HeroSplit';
import { OptimizedImage } from '../components/UI/OptimizedImage';
import { ProductCard } from '../components/UI/ProductCard';
import { FRAGRANCE_PRODUCTS, HAIR_PRODUCTS } from '../constants';
import { backgroundImages, fragranceImages, hairImages, heroImages } from '../src/assets/images';

const editorialCards = [
  {
    title: 'Gift-ready rituals',
    body: 'Pamper packages and scent pairings prepared for intimate celebrations and thoughtful care.',
    image: backgroundImages.gifting,
    path: '/pamper',
  },
  {
    title: 'Beauty maintenance',
    body: 'Wig wash, treatments, curl activation, plucking, dye, and complete laundry packages.',
    image: hairImages.wigCleansing,
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

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=bisile.+be+luxury&sxsrf=ANbL-n54GGzsThlIBxU3FBgj-ZNKYaaNeA%3A1780783836635&oq=';

const positiveModulo = (value: number, total: number) => ((value % total) + total) % total;

const ReviewCarousel: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [activeReview, setActiveReview] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const getSlideStep = () => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>('[data-review-slide]');
    if (!track || !slide) return 0;

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return slide.getBoundingClientRect().width + gap;
  };

  const updateActiveReview = () => {
    const track = trackRef.current;
    const step = getSlideStep();
    if (!track || !step) return;

    const index = Math.round(track.scrollLeft / step);
    setActiveReview(positiveModulo(index, googleReviews.length));
  };

  const snapToNearestReview = () => {
    const track = trackRef.current;
    const step = getSlideStep();
    if (!track || !step) return;

    track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: 'smooth' });
  };

  const scrollReviews = (direction: -1 | 1) => {
    goToReview(positiveModulo(activeReview + direction, googleReviews.length));
  };

  const goToReview = (index: number) => {
    const track = trackRef.current;
    const step = getSlideStep();
    if (!track || !step) return;

    setActiveReview(index);
    track.scrollTo({ left: step * index, behavior: 'smooth' });
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={() => scrollReviews(-1)} className="inline-flex h-10 w-10 items-center justify-center border border-[#B9AA8B]/50 text-primary transition-colors hover:border-accent hover:text-accent" aria-label="Previous review">
          <ArrowLeft size={16} strokeWidth={1.2} />
        </button>
        <button type="button" onClick={() => scrollReviews(1)} className="inline-flex h-10 w-10 items-center justify-center border border-[#B9AA8B]/50 text-primary transition-colors hover:border-accent hover:text-accent" aria-label="Next review">
          <ArrowRight size={16} strokeWidth={1.2} />
        </button>
      </div>

      <div
        ref={trackRef}
        className={`review-carousel__track hide-scrollbar flex gap-4 overflow-x-auto pb-1 ${isDragging ? 'is-dragging' : ''}`}
        onScroll={updateActiveReview}
        onPointerDown={(event) => {
          const track = trackRef.current;
          if (!track) return;

          startXRef.current = event.clientX;
          startScrollLeftRef.current = track.scrollLeft;
          dragMovedRef.current = false;
          isDraggingRef.current = true;
          setIsDragging(true);
          track.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const track = trackRef.current;
          if (!track || !isDraggingRef.current) return;

          const distance = event.clientX - startXRef.current;
          if (Math.abs(distance) > 5) dragMovedRef.current = true;
          track.scrollLeft = startScrollLeftRef.current - distance;
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          isDraggingRef.current = false;
          setIsDragging(false);
          snapToNearestReview();
        }}
        onPointerCancel={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
          snapToNearestReview();
        }}
        aria-label="Google review carousel"
      >
        {googleReviews.map((review, index) => (
          <a
            key={`${review.name}-${index}`}
            data-review-slide
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="review-carousel__slide flex min-h-[280px] flex-col justify-between border border-[#e5e2dd] bg-[#F7F4EF] p-6 text-left transition-colors hover:border-[#A3915D]/70"
            onClick={(event) => {
              if (!dragMovedRef.current) return;
              event.preventDefault();
              event.stopPropagation();
              window.setTimeout(() => {
                dragMovedRef.current = false;
              }, 0);
            }}
          >
            <div className="flex gap-1 text-accent" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} size={13} fill="currentColor" strokeWidth={1.1} />)}
            </div>
            <p className="mt-8 font-inter text-sm font-light leading-7 text-primary/62">"{review.body}"</p>
            <p className="mt-8 font-inter text-xs font-light uppercase tracking-[0.16em] text-primary/45">{review.name}</p>
          </a>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2" aria-label="Choose review">
        {googleReviews.map((review, index) => (
          <button
            key={review.name}
            type="button"
            onClick={() => goToReview(index)}
            className={`h-1.5 rounded-full transition-all ${activeReview === index ? 'w-7 bg-accent' : 'w-1.5 bg-[#B9AA8B]/58 hover:bg-[#8A6F35]/70'}`}
            aria-label={`Show review from ${review.name}`}
            aria-current={activeReview === index}
          />
        ))}
      </div>
    </div>
  );
};

const luxuryCategories = [
  {
    label: 'Discovery Set',
    body: 'Discover fragrances that capture the essence of women - subtle, earthly, and effortlessly powerful.',
    image: fragranceImages.discoverySet,
    path: '/shop',
    fit: 'cover',
  },
  {
    label: 'Premium Hair',
    body: 'Bhelekazi Wigs, bundles, closures and wig care shaped around polished everyday beauty.',
    image: hairImages.wigShowcase,
    path: '/hair',
    fit: 'cover',
  },
  {
    label: 'Fragrances',
    body: 'The Imvelo Collection, made for quiet presence and memorable finishing rituals.',
    image: fragranceImages.xdoz,
    path: '/fragrances',
    fit: 'cover',
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
                  <OptimizedImage src={item.image} width={900} widths={[360, 540, 720, 900, 1200]} sizes="(min-width: 768px) 33vw, 100vw" alt={item.label} className={item.fit === 'contain' ? 'h-full w-full object-contain p-10 transition-transform duration-500 group-hover:scale-[1.035] sm:p-12' : 'editorial-image'} />
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
              <OptimizedImage src={heroImages.fragrance03} width={1600} widths={[640, 960, 1280, 1600, 1920]} sizes="100vw" alt="BISILE fragrance bottle and packaging" className="editorial-image" />
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
                <OptimizedImage src={item.image} width={1100} widths={[480, 720, 960, 1200]} sizes="(min-width: 768px) 50vw, 100vw" alt={item.title} className="editorial-image" />
              </div>
              <h2 className="mt-4 font-inter text-sm font-normal">{item.title}</h2>
              <p className="mt-1 max-w-xl font-inter text-sm font-light leading-6 text-primary/60">{item.body}</p>
            </Link>
          </FadeIn>
        ))}
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
            <OptimizedImage src={backgroundImages.presence} width={1200} widths={[480, 720, 960, 1200, 1600]} sizes="(min-width: 768px) 56vw, 100vw" alt="BISILE product arrangement" className="editorial-image" />
          </div>
        </FadeIn>
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
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer" className="bisile-link">
                View on Google <ArrowRight size={15} strokeWidth={1.3} />
              </a>
            </div>
          </FadeIn>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_minmax(0,3fr)]">
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
            <FadeIn delay={90}>
              <ReviewCarousel />
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
};
