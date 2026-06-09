import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-off-white px-6 py-28 text-center text-primary">
    <div className="max-w-xl">
      <p className="bisile-kicker mb-4">Page not found</p>
      <h1 className="font-inter text-4xl font-light leading-tight md:text-6xl">This page is not in the BISILE collection.</h1>
      <p className="mx-auto mt-5 max-w-md font-inter text-sm font-light leading-7 text-primary/60">
        Return to fragrance, hair, gifting, and care rituals selected for Be Luxury.
      </p>
      <Link to="/shop" className="bisile-link mt-8 inline-flex">
        Shop BISILE <ArrowRight size={15} strokeWidth={1.3} />
      </Link>
    </div>
  </div>
);
