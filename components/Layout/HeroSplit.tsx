import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { carouselImages, heroImages } from '../../src/assets/images';

type HeroPanelId = 'hair' | 'fragrance';

type HeroPanel = {
  id: HeroPanelId;
  title: string;
  cta: string;
  href: string;
  poster: string;
  mobileImage: string;
  video?: string;
};

const enableVideoHero = import.meta.env.VITE_ENABLE_VIDEO_HERO !== 'false';

const heroPanels: HeroPanel[] = [
  {
    id: 'hair',
    title: 'Hair & Accessories',
    cta: 'Shop Hair',
    href: '/hair',
    poster: heroImages.hairAccessoriesImg2685,
    mobileImage: heroImages.hairAccessoriesImg2685,
    video: '/videos/hero/hair-hero.mp4',
  },
  {
    id: 'fragrance',
    title: 'Fragrance & Beauty',
    cta: 'Shop Fragrance',
    href: '/shop',
    poster: carouselImages.perfumeDisplay04,
    mobileImage: carouselImages.perfumeDisplay04,
    video: '/videos/hero/fragrance-hero.mp4',
  },
];

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

const HeroPanelView: React.FC<{
  panel: HeroPanel;
  activePanel: HeroPanelId | null;
  isDesktop: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onActivate: (id: HeroPanelId) => void;
  onReset: () => void;
}> = ({ panel, activePanel, isDesktop, videoRef, onActivate, onReset }) => {
  const isActive = activePanel === panel.id;
  const isInactive = activePanel !== null && !isActive;
  const canRenderVideo = isDesktop && enableVideoHero && Boolean(panel.video);
  const imageFitClass = panel.id === 'fragrance'
    ? 'object-contain object-center bg-[#f7f5f1] p-10 sm:p-12 lg:p-16'
    : 'object-cover object-center';
  const videoFitClass = 'object-cover object-center';
  const mediaTone = isActive
    ? 'grayscale-[15%] brightness-[0.8] contrast-[1.05] opacity-100'
    : isInactive
      ? 'grayscale brightness-[0.3] contrast-90 opacity-90'
      : 'grayscale brightness-[0.42] contrast-95 opacity-95';
  const overlayTone = isActive ? 'bg-black/38' : isInactive ? 'bg-black/78' : 'bg-black/62';

  return (
    <Link
      to={panel.href}
      onMouseEnter={() => onActivate(panel.id)}
      onFocus={() => onActivate(panel.id)}
      onMouseLeave={onReset}
      onBlur={onReset}
      className={`group relative flex min-h-[50svh] overflow-hidden bg-black text-white transition-[flex-basis,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:min-h-0 lg:basis-1/2 ${
        isActive ? 'lg:basis-[52%]' : isInactive ? 'lg:basis-[48%]' : ''
      }`}
      aria-label={panel.cta}
    >
      {canRenderVideo ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={panel.poster}
          className={`absolute inset-0 h-full w-full ${videoFitClass} transition-[filter,opacity] duration-700 ease-out ${mediaTone}`}
        >
          <source src={panel.video} />
        </video>
      ) : (
        <img
          src={isDesktop ? panel.poster : panel.mobileImage}
          alt={panel.title}
          loading={isDesktop ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full ${imageFitClass} transition-[filter,opacity] duration-700 ease-out ${mediaTone}`}
        />
      )}

      <div className={`absolute inset-0 transition-colors duration-700 ease-out ${overlayTone}`} />
      <div className="relative z-10 flex min-h-full w-full flex-col justify-end p-7 sm:p-9 lg:p-12">
        <div className={`max-w-xs transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-85 group-hover:translate-y-0 group-hover:opacity-100'}`}>
          <p className="font-inter text-[10px] uppercase tracking-[0.22em] text-white/72">BISILE</p>
          <h2 className="mt-3 font-serif text-4xl leading-none sm:text-5xl lg:text-6xl">{panel.title}</h2>
          <span className={`mt-6 inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-[0.18em] transition-all duration-500 ${isActive ? 'text-white' : 'text-white/72'}`}>
            {panel.cta} <ArrowRight size={14} strokeWidth={1.25} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export const HeroSplit: React.FC = () => {
  const [activePanel, setActivePanel] = useState<HeroPanelId | null>(null);
  const hairVideoRef = useRef<HTMLVideoElement>(null);
  const fragranceVideoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const refs = useMemo(
    () => ({
      hair: hairVideoRef,
      fragrance: fragranceVideoRef,
    }),
    []
  );

  const pauseVideo = (id: HeroPanelId) => {
    const video = refs[id].current;
    if (!video) return;
    video.pause();
  };

  const playVideo = (id: HeroPanelId) => {
    if (!isDesktop) return;
    const video = refs[id].current;
    if (!video) return;
    void video.play().catch(() => undefined);
  };

  const handleActivate = (id: HeroPanelId) => {
    if (!isDesktop) return;
    setActivePanel(id);
    pauseVideo(id === 'hair' ? 'fragrance' : 'hair');
    playVideo(id);
  };

  const handleReset = () => {
    if (!isDesktop) return;
    setActivePanel(null);
    pauseVideo('hair');
    pauseVideo('fragrance');
  };

  return (
    <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-black" aria-label="BISILE hero">
      <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center lg:flex">
        <p className="font-serif text-[clamp(5rem,13vw,15rem)] font-light uppercase leading-none tracking-[0.1em] text-white/88 drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          BISILE
        </p>
      </div>
      <div className="flex h-full flex-col lg:flex-row" onMouseLeave={handleReset}>
        {heroPanels.map((panel) => (
          <HeroPanelView
            key={panel.id}
            panel={panel}
            activePanel={activePanel}
            isDesktop={isDesktop}
            videoRef={refs[panel.id]}
            onActivate={handleActivate}
            onReset={handleReset}
          />
        ))}
      </div>
    </section>
  );
};
