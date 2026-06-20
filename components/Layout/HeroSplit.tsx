import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageSrcSet, getImageUrl, getVideoUrl } from '../../utils/images';

const heroVideos = [
  {
    src: getVideoUrl('/videos/IMG_1892.mov', 1600),
    label: 'BISILE hero video one',
  },
  {
    src: getVideoUrl('/videos/IMG_1865.mov', 1600),
    label: 'BISILE hero video two',
  },
];
const heroPoster = getImageUrl('/media/image 33.png', { width: 1600 });
const heroPosterSrcSet = getImageSrcSet('/media/image 33.png', [640, 960, 1280, 1600, 1920]);

export const HeroSplit: React.FC = () => {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [failedVideoIndexes, setFailedVideoIndexes] = useState<number[]>([]);

  const availableVideoIndexes = heroVideos
    .map((_, index) => index)
    .filter((index) => !failedVideoIndexes.includes(index));
  const activeAvailableIndex = availableVideoIndexes.includes(activeVideoIndex)
    ? activeVideoIndex
    : availableVideoIndexes[0] ?? 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateVideoPreference = () => setCanLoadVideo(mediaQuery.matches);

    updateVideoPreference();
    mediaQuery.addEventListener('change', updateVideoPreference);
    return () => mediaQuery.removeEventListener('change', updateVideoPreference);
  }, []);

  useEffect(() => {
    if (!canLoadVideo || availableVideoIndexes.length === 0) return;

    videoRefs.current.forEach((video, index) => {
      if (!video || index === activeAvailableIndex) return;
      video.pause();
    });

    const video = videoRefs.current[activeAvailableIndex];
    if (video) video.currentTime = 0;
    void video?.play().catch((error) => {
      if (import.meta.env.DEV) console.warn('BISILE hero video could not autoplay.', error);
    });
  }, [activeAvailableIndex, availableVideoIndexes.length, canLoadVideo]);

  useEffect(() => {
    if (!canLoadVideo || availableVideoIndexes.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveVideoIndex((current) => {
        const currentPosition = availableVideoIndexes.indexOf(current);
        return availableVideoIndexes[(currentPosition + 1) % availableVideoIndexes.length];
      });
    }, 9000);

    return () => window.clearInterval(timer);
  }, [availableVideoIndexes, canLoadVideo]);

  return (
    <section id="bisile-hero" className="relative h-screen min-h-[100svh] w-full overflow-hidden bg-[#2A2114] text-[#F7F4EF]" aria-label="BISILE video hero" data-navbar-theme="hero">
      <img
        src={heroPoster}
        srcSet={heroPosterSrcSet}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {canLoadVideo && availableVideoIndexes.length > 0 && heroVideos.map((video, index) => (
        failedVideoIndexes.includes(index) ? null : (
          <video
            key={video.src}
            ref={(node) => {
              videoRefs.current[index] = node;
            }}
            className={`absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-1000 md:block ${index === activeAvailableIndex ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            autoPlay={index === activeAvailableIndex}
            preload={index === activeAvailableIndex ? 'auto' : 'metadata'}
            poster={heroPoster}
            aria-label={video.label}
            onError={(event) => {
              setFailedVideoIndexes((current) => current.includes(index) ? current : [...current, index]);
              if (import.meta.env.DEV) console.warn('BISILE hero video failed to load.', event.currentTarget.currentSrc || video.src);
            }}
          >
            <source src={video.src} />
          </video>
        )
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.68)_0%,rgba(17,17,17,0.38)_42%,rgba(17,17,17,0.78)_100%)]" />
      <div className="absolute inset-0 bg-black/28" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 pt-28 sm:px-10 md:pb-20 lg:px-16">
        <p className="font-inter text-xs font-light uppercase tracking-[0.24em] text-[#E9E6DF]/78">BISILE</p>
        <h2 className="mt-4 max-w-3xl font-inter text-5xl font-light leading-[0.94] text-[#F7F4EF] sm:text-6xl md:text-7xl lg:text-8xl">Be Luxury.</h2>
        <p className="mt-6 max-w-xl font-inter text-sm font-light leading-7 text-[#F7F4EF]/76">
          Fragrance, hair, gifting, and care shaped around refined everyday beauty rituals.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center justify-center border border-[#F7F4EF]/70 bg-[#F7F4EF]/10 px-7 py-4 font-inter text-[10px] font-light uppercase tracking-[0.18em] text-[#F7F4EF] backdrop-blur-sm transition-colors hover:border-[#F7F4EF] hover:bg-[#F7F4EF] hover:text-[#2A2114]"
        >
          Shop BISILE
        </Link>
      </div>
    </section>
  );
};
