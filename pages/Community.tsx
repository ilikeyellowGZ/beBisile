import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { OptimizedImage } from '../components/UI/OptimizedImage';
import { heroImages } from '../src/assets/images';

const platformOptions = ['Instagram', 'TikTok', 'YouTube'];

export const Community: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [platform, setPlatform] = useState('');
  const [platformOpen, setPlatformOpen] = useState(false);
  const [platformError, setPlatformError] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!platformRef.current?.contains(event.target as Node)) setPlatformOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="min-h-screen bg-secondary pt-20 text-primary">
      <section className="grid md:grid-cols-2">
        <div className="flex items-center px-7 py-20 md:px-16">
          <FadeIn>
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">The BISILE circle</p>
            <h1 className="font-serif text-6xl leading-[0.9] md:text-8xl">Create with intention.</h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-primary/60">
              We work with creators whose point of view feels considered, honest, and beautifully their own.
            </p>
          </FadeIn>
        </div>
        <div className="min-h-[520px] overflow-hidden">
          <OptimizedImage src={heroImages.fragrance11} width={1200} widths={[480, 720, 960, 1200, 1600]} sizes="(min-width: 768px) 50vw, 100vw" alt="BISILE creator community" className="editorial-image h-full w-full object-cover" />
        </div>
      </section>

      <section className="bg-secondary px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-[1120px] gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Applications</p>
            <h2 className="font-serif text-5xl">Join the circle.</h2>
            <p className="mt-5 text-sm leading-7 text-primary/60">
              You do not need a massive audience. We are interested in fit, feeling, and thoughtful storytelling.
            </p>
          </div>

          {submitted ? (
            <div className="bisile-card-surface p-8">
              <CheckCircle2 className="mb-4 text-accent" />
              <h3 className="font-subhead text-3xl">Your application is with us.</h3>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!platform) {
                  setPlatformError(true);
                  setPlatformOpen(true);
                  return;
                }
                setSubmitted(true);
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <input required placeholder="Full name" className="field-light px-4 py-4 text-xs" />
              <input required type="email" placeholder="Email address" className="field-light px-4 py-4 text-xs" />
              <input required placeholder="Primary social handle" className="field-light px-4 py-4 text-xs" />

              <div ref={platformRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={platformOpen}
                  aria-controls="platform-options"
                  onClick={() => {
                    setPlatformOpen((current) => !current);
                    setPlatformError(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setPlatformOpen(false);
                  }}
                  className={`field-light flex w-full items-center justify-between px-4 py-4 text-left text-xs transition-colors ${platformError ? 'border-accent' : ''}`}
                >
                  <span className={platform ? 'text-primary' : 'text-primary/45'}>
                    {platform || 'Primary platform'}
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={1.25}
                    className={`ml-4 shrink-0 text-primary/55 transition-transform duration-300 ease-out ${platformOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                <div
                  id="platform-options"
                  role="listbox"
                  className={`absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden border border-[#B9AA8B]/46 bg-[#F7F4EF] shadow-[0_18px_45px_rgba(42,33,20,0.08)] transition-[max-height,opacity,transform] duration-300 ease-out ${platformOpen ? 'max-h-48 translate-y-0 opacity-100' : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'}`}
                >
                  {platformOptions.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={platform === option}
                      style={{ transitionDelay: platformOpen ? `${index * 45}ms` : '0ms' }}
                      onClick={() => {
                        setPlatform(option);
                        setPlatformError(false);
                        setPlatformOpen(false);
                      }}
                      className={`block w-full px-4 py-3 text-left text-xs transition-all duration-300 hover:bg-[#E9E6DF] hover:text-accent ${platformOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'} ${platform === option ? 'text-accent' : 'text-primary/70'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {platformError && <p className="mt-2 text-xs text-accent">Please choose a primary platform.</p>}
              </div>

              <textarea required rows={5} placeholder="Tell us about your content and community" className="field-light px-4 py-4 text-xs sm:col-span-2" />
              <button className="flex items-center justify-between bg-[#5B3A24] px-5 py-4 text-[10px] uppercase tracking-[0.18em] text-[#F7F4EF] transition-colors duration-300 hover:bg-accent sm:col-span-2">
                Submit application <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
