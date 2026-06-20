import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { OptimizedImage } from '../components/UI/OptimizedImage';
import { backgroundImages, fragranceImages, hairImages } from '../src/assets/images';
import { getImageUrl, getVideoUrl } from '../utils/images';

const storyVideo = getVideoUrl('/videos/IMG_1892.mov', 1600);
const storyPoster = getImageUrl('/media/image 33.png', { width: 1200 });

const values = ['Luxury with restraint', 'Beauty with care', 'Hair with confidence', 'Service with intention'];

export const About: React.FC = () => (
  <div className="overflow-x-hidden bg-off-white pt-16 text-primary">
    <section className="bisile-shell grid gap-8 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-end md:py-14">
      <FadeIn>
        <p className="bisile-kicker mb-4">About BISILE</p>
        <h1 className="font-inter text-4xl font-light leading-tight md:text-6xl lg:text-7xl">The story of Be Luxury.</h1>
        <p className="mt-6 max-w-xl font-inter text-sm font-light leading-7 text-primary/62">
          BISILE is a luxury beauty house built around the moments that make a woman feel finished: fragrance, hair, gifting, and care. The brand has grown from personal beauty service into a fuller world of refined products and rituals.
        </p>
      </FadeIn>
      <FadeIn delay={100}>
        <div className="bisile-image-frame aspect-[4/3] md:aspect-[5/4]">
          <OptimizedImage src={backgroundImages.gifting} width={1200} widths={[480, 720, 960, 1200, 1600]} sizes="(min-width: 768px) 50vw, 100vw" alt="BISILE product arrangement" className="editorial-image" />
        </div>
      </FadeIn>
    </section>

    <section className="bisile-shell bisile-section border-y bisile-rule" aria-label="BISILE brand video">
      <div className="bisile-image-frame aspect-[4/5] bg-[#111111] sm:aspect-[16/10] lg:aspect-[16/8]">
        <video
          className="h-full w-full scale-[0.94] object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={storyPoster}
        >
          <source src={storyVideo} />
        </video>
      </div>
    </section>

    <section className="bisile-shell bisile-section grid gap-6 md:grid-cols-3">
      <FadeIn>
        <div className="bisile-image-frame aspect-[3/4]">
          <OptimizedImage src={fragranceImages.indoniyamanzi} width={900} widths={[360, 540, 720, 900]} sizes="(min-width: 768px) 50vw, 100vw" alt="BISILE Indoniyamanzi perfume" className="h-full w-full object-contain p-12" />
        </div>
      </FadeIn>
      <FadeIn delay={90}>
        <div className="flex h-full flex-col justify-center border-y bisile-rule py-8 md:px-4">
          <p className="bisile-kicker mb-3">The BISILE world</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Fragrance, hair, care, and gifting.</h2>
          <p className="mt-6 font-inter text-sm font-light leading-7 text-primary/62">
            Each category has its own purpose, but the feeling is shared: polished, feminine, intimate, and quietly luxurious.
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={160}>
        <div className="bisile-image-frame aspect-[3/4]">
          <OptimizedImage src={hairImages.wigShowcase} width={1200} widths={[480, 720, 960, 1200, 1600]} sizes="(min-width: 768px) 50vw, 100vw" alt="BISILE hair collection" className="editorial-image" />
        </div>
      </FadeIn>
    </section>

    <section className="bisile-shell bisile-section border-t bisile-rule">
      <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end">
        <FadeIn>
          <p className="bisile-kicker mb-3">What guides us</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Beauty that elevates your presence.</h2>
        </FadeIn>
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((value, index) => (
            <FadeIn key={value} delay={index * 55}>
              <div className="border border-[#e5e2dd] px-5 py-5 font-inter text-sm font-light text-primary/68">{value}</div>
            </FadeIn>
          ))}
        </div>
      </div>
      <FadeIn delay={120}>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link to="/shop" className="bisile-link">Shop BISILE <ArrowRight size={15} strokeWidth={1.3} /></Link>
          <Link to="/hair" className="bisile-link">Explore hair <ArrowRight size={15} strokeWidth={1.3} /></Link>
        </div>
      </FadeIn>
    </section>
  </div>
);
