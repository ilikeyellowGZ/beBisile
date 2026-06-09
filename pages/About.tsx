import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';
import { backgroundImages, fragranceImages, hairImages, heroImages, packageImages } from '../src/assets/images';

const storyChapters = [
  {
    label: '01',
    title: 'The beginning',
    body: 'BISILE began with beauty that felt personal: careful service, polished presentation, and a desire to make every client feel seen before they stepped out into the world.',
    image: packageImages.product06,
  },
  {
    label: '02',
    title: 'The ritual expands',
    body: 'From beauty and makeup, the brand grew into fragrance and gifting. Scent became part of the BISILE language: soft, memorable, and made for everyday luxury.',
    image: heroImages.fragrance03,
  },
  {
    label: '03',
    title: 'Hair becomes central',
    body: 'BISILE then shaped a focused hair world: Bhelekazi wigs, processed virgin hair bundles, closures, frontals, and services that help every unit stay beautiful for longer.',
    image: hairImages.straightWig01,
  },
  {
    label: '04',
    title: 'Care after purchase',
    body: 'Wig laundry, styling, plucking, curl activation, dye, and custom finishing became part of the promise. BISILE does not end at checkout; the care continues.',
    image: hairImages.straightWig07,
  },
];

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
          <img src={backgroundImages.gifting} alt="BISILE product arrangement" className="editorial-image" />
        </div>
      </FadeIn>
    </section>

    <section className="bisile-shell bisile-section border-y bisile-rule">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <FadeIn>
          <p className="bisile-kicker mb-3">From start to finish</p>
          <h2 className="max-w-sm font-inter text-3xl font-light leading-tight md:text-5xl">A brand built through ritual.</h2>
        </FadeIn>
        <div className="grid gap-10">
          {storyChapters.map((chapter, index) => (
            <FadeIn key={chapter.title} delay={index * 70}>
              <article className="grid gap-5 border-t border-[#e5e2dd] pt-6 sm:grid-cols-[0.82fr_1.18fr] sm:items-start">
                <div className="bisile-image-frame aspect-[4/3]">
                  <img src={chapter.image} alt={chapter.title} className="editorial-image" loading="lazy" />
                </div>
                <div className="sm:pt-1">
                  <p className="mb-3 font-inter text-[10px] font-light uppercase tracking-[0.18em] text-accent">{chapter.label}</p>
                  <h3 className="font-inter text-2xl font-light md:text-3xl">{chapter.title}</h3>
                  <p className="mt-4 max-w-xl font-inter text-sm font-light leading-7 text-primary/62">{chapter.body}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    <section className="bisile-shell bisile-section grid gap-6 md:grid-cols-3">
      <FadeIn>
        <div className="bisile-image-frame aspect-[3/4]">
          <img src={fragranceImages.indoniyamanzi} alt="BISILE Indoniyamanzi perfume" className="h-full w-full object-contain p-12" loading="lazy" />
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
          <img src={hairImages.kinkyWig01} alt="BISILE hair collection" className="editorial-image" loading="lazy" />
        </div>
      </FadeIn>
    </section>

    <section className="bisile-shell bisile-section border-t bisile-rule">
      <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end">
        <FadeIn>
          <p className="bisile-kicker mb-3">What guides us</p>
          <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Beauty that feels considered.</h2>
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
