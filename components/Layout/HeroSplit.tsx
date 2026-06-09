import React from 'react';

const heroVideo = '/videos/hero/fragrance-hero.mp4';
const heroPoster = '/media/image 33.png';

export const HeroSplit: React.FC = () => {
  return (
    <section id="bisile-hero" className="relative h-screen min-h-[100svh] w-full overflow-hidden bg-[#2A2114] text-[#F7F4EF]" aria-label="BISILE video hero" data-navbar-theme="hero">
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,33,20,0.38)_0%,rgba(42,33,20,0.14)_38%,rgba(17,17,17,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,145,93,0.13),transparent_48%)]" />
    </section>
  );
};
