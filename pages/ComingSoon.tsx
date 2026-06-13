import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../components/UI/FadeIn';

interface ComingSoonProps {
  title: string;
  eyebrow: string;
  body: string;
  image: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, eyebrow, body, image }) => (
  <div className="min-h-screen bg-off-white pt-16 text-primary">
    <section className="bisile-shell border-b bisile-rule py-10 md:py-16">
      <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <FadeIn>
          <div className="max-w-xl pb-2 md:pb-12">
            <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / {title}</p>
            <p className="bisile-kicker mb-4">{eyebrow}</p>
            <h1 className="font-inter text-4xl font-light leading-tight md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-lg font-inter text-sm font-light leading-7 text-primary/60">{body}</p>
            <p className="mt-8 font-inter text-2xl font-light text-primary">Coming soon.</p>
            <Link to="/shop" className="bisile-link mt-8">Back to shop <ArrowRight size={14} /></Link>
          </div>
        </FadeIn>

        <FadeIn delay={90}>
          <div className="bisile-image-frame min-h-[360px] md:min-h-[520px]">
            <img src={image} alt={title} className="editorial-image h-full w-full object-cover" />
          </div>
        </FadeIn>
      </div>
    </section>
  </div>
);
