import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    label: 'Fragrance',
    path: '/shop',
    description: 'Signature scents for quiet everyday luxury',
    image: '/media/bisile/perfume-bottles.jpg',
  },
  {
    label: 'Processed hair',
    path: '/hair',
    description: 'Polished pieces made to feel effortless',
    image: '/media/bisile/wig-straight.jpg',
  },
  {
    label: 'Pamper packages',
    path: '/pamper',
    description: 'Soft gifting sets for considered care',
    image: '/media/bisile/perfume-picnic.jpg',
  },
  {
    label: 'Wig laundry',
    path: '/hair',
    description: 'Refresh, revive, and restyle your unit',
    image: '/media/bisile/laundry.png',
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
    <div className="bisile-shell grid gap-12 border-t border-[#efede9] pb-14 pt-8 md:grid-cols-[0.65fr_1.35fr]">
      <div className="space-y-7">
        {discoverItems.map((item, index) => (
          <button
            key={item.label}
            className="block w-full text-left"
            onClick={() => onNavigate?.({ path: item.path })}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span className="block font-inter text-sm font-light text-primary transition-colors hover:text-accent">{item.label}</span>
            <span className="mt-1 block max-w-xs font-inter text-xs font-light leading-5 text-primary/45">{item.description}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {previews.map((item) => (
          <Link key={`${item.label}-${activeIndex}`} className="group animate-fade-in block" to={item.path} data-discover="true">
            <div className="bisile-image-frame aspect-[4/3]">
              <img alt={item.label} className="editorial-image h-full w-full object-cover" src={item.image} />
            </div>
            <p className="mt-3 font-inter text-sm font-light text-primary">
              {item.label} <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoverGrid;
