import React, { useEffect, useRef, useState } from 'react';
import { getImageSrcSet, getImageUrl, getVideoUrl } from '../../utils/images';

const heroVideo = getVideoUrl('/videos/hero/hero2 - Trim.mp4', 1600);
const heroPoster = getImageUrl('/media/image 33.png', { width: 1600 });
const heroPosterSrcSet = getImageSrcSet('/media/image 33.png', [640, 960, 1280, 1600, 1920]);

export const HeroSplit: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateVideoPreference = () => setCanLoadVideo(mediaQuery.matches);

    updateVideoPreference();
    mediaQuery.addEventListener('change', updateVideoPreference);
    return () => mediaQuery.removeEventListener('change', updateVideoPreference);
  }, []);

  useEffect(() => {
    if (!canLoadVideo || videoFailed) return;

    const video = videoRef.current;
    void video?.play().catch((error) => {
      if (import.meta.env.DEV) console.warn('BISILE hero video could not autoplay.', error);
    });
  }, [canLoadVideo, videoFailed]);

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
      {canLoadVideo && !videoFailed && (
        <video
          ref={videoRef}
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={heroPoster}
          onError={(event) => {
            setVideoFailed(true);
            if (import.meta.env.DEV) console.warn('BISILE hero video failed to load.', event.currentTarget.currentSrc || heroVideo);
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.68)_0%,rgba(17,17,17,0.38)_42%,rgba(17,17,17,0.78)_100%)]" />
      <div className="absolute inset-0 bg-black/28" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 pt-28 sm:px-10 md:pb-20 lg:px-16">
        <p className="font-inter text-xs font-light uppercase tracking-[0.24em] text-[#E9E6DF]/78">BISILE</p>
        <h2 className="mt-4 max-w-3xl font-inter text-5xl font-light leading-[0.94] text-[#F7F4EF] sm:text-6xl md:text-7xl lg:text-8xl">Be Luxury.</h2>
        <p className="mt-6 max-w-xl font-inter text-sm font-light leading-7 text-[#F7F4EF]/76">
          Fragrance, hair, gifting, and care shaped around refined everyday beauty rituals.
        </p>
      </div>
    </section>
  );
};
