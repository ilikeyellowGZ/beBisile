import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { brandImages } from '../../src/assets/images';

const heroVideo = '/videos/hero/fragrance-hero.mp4';
const heroPoster = '/media/image 33.png';

export const HeroSplit: React.FC = () => {
  return (
    <section className="relative h-[calc(100svh-4rem)] min-h-[640px] w-full overflow-hidden bg-[#2A2114] text-[#F7F4EF]" aria-label="BISILE hero">
      <img src={heroPoster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <video
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        poster={heroPoster}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,33,20,0.50)_0%,rgba(42,33,20,0.34)_42%,rgba(17,17,17,0.60)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,145,93,0.18),transparent_42%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <img src={brandImages.logo} alt="BISILE - Be Luxury" className="absolute top-10 h-16 w-auto object-contain brightness-0 invert sm:h-20 lg:top-12 lg:h-24" />

        <div className="mt-16 max-w-5xl">
          <p className="font-serif text-5xl italic leading-none text-[#F7F4EF] drop-shadow-[0_10px_32px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl">
            Unwrap Confidence!
          </p>
          <p className="mt-5 font-sans text-xs font-medium uppercase tracking-[0.38em] text-[#F7F4EF]/90 sm:text-base md:text-lg">
            Don&apos;t Seek Luxury, BE LUXURY.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 border border-[#D8D0C3]/85 bg-[#8A6F35]/38 px-8 py-4 font-sans text-xs font-medium uppercase tracking-[0.18em] text-[#F7F4EF] backdrop-blur transition-colors hover:border-[#F7F4EF] hover:bg-[#A3915D]/70"
          >
            Shop now <ArrowRight size={16} strokeWidth={1.25} />
          </Link>
        </div>
      </div>
    </section>
  );
};
