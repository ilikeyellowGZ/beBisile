import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { brandImages, carouselImages, hairImages, packageImages } from '../../src/assets/images';
import { OptimizedImage } from '../UI/OptimizedImage';

type DiscoverItem = {
  label: string;
  path: string;
  description: string;
  image: string;
};

type DiscoverGridProps = {
  onNavigate?: (item: { path: string }) => void;
};

const discoverItems: DiscoverItem[] = [
  {
    label: 'Fragrances',
    path: '/fragrances',
    description: 'Imvelo Collection and best-selling signature scents',
    image: carouselImages.perfumeDisplay04,
  },
  {
    label: 'Premium Hair',
    path: '/hair',
    description: 'Bhelekazi wigs, closures, bundles, and wig laundry',
    image: hairImages.wigShowcase,
  },
  {
    label: 'Diffuser',
    path: '/shop',
    description: 'Home fragrance for a softer BISILE room ritual',
    image: carouselImages.perfumeDisplay04,
  },
  {
    label: 'Candle',
    path: '/shop',
    description: 'Warm luxury for gifting and daily care moments',
    image: packageImages.product07,
  },
  {
    label: 'Pamper packages',
    path: '/pamper',
    description: 'Soft gifting sets for considered care',
    image: brandImages.giftPouches,
  },
];

const getPreviewItems = (activeIndex: number) => {
  const first = discoverItems[activeIndex];
  const second = discoverItems[(activeIndex + 1) % discoverItems.length];

  return [first, second];
};

export const DiscoverGrid: React.FC<DiscoverGridProps> = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const previews = getPreviewItems(activeIndex);

  return (
    <div className="bisile-shell grid gap-12 border-t border-[#A3915D]/22 bg-[#F7F4EF] pb-14 pt-8 md:grid-cols-[0.65fr_1.35fr]">
      <div className="space-y-7">
        {discoverItems.map((item, index) => (
          <button
            key={item.label}
            className="block w-full text-left"
            onClick={() => onNavigate?.({ path: item.path })}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span className="block font-inter text-sm font-light text-[#2A2114] transition-colors hover:text-[#8A6F35]">{item.label}</span>
            <span className="mt-1 block max-w-xs font-inter text-xs font-light leading-5 text-[#5B3A24]/62">{item.description}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {previews.map((item) => (
          <Link key={`${item.label}-${activeIndex}`} className="group animate-fade-in block" to={item.path} data-discover="true">
            <div className="bisile-image-frame aspect-[4/3]">
              <OptimizedImage alt={item.label} className="editorial-image h-full w-full object-cover" src={item.image} width={900} widths={[360, 540, 720, 900, 1200]} sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
            <p className="mt-3 inline-flex items-center gap-2 font-inter text-sm font-light text-[#2A2114] transition-colors group-hover:text-[#8A6F35]">
              {item.label}
              <ArrowRight size={15} strokeWidth={1.2} className="transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoverGrid;
