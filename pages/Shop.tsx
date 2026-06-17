import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { fragranceImages, hairImages, packageImages } from '../src/assets/images';

const shopCategories = [
  {
    number: '01',
    title: 'Discovery Set',
    image: packageImages.product01,
    href: '/product/discovery-set',
    description: 'Discover fragrances that capture the essence of women - subtle, earthly, and effortlessly powerful.',
    items: ['IMVELO Collection', 'Six signature scents', '6 x 10ml Eau de Parfum'],
    cta: 'Explore Discovery Set',
  },
  {
    number: '02',
    title: 'Bhelekazi Wigs',
    image: hairImages.straightWig01,
    href: '/hair/wigs',
    description: 'Everyday luxury, soft luxurious quality and premium luxury wigs crafted with refined BISILE finishes.',
    items: ['Everyday Luxury', 'Soft Luxurious Quality', 'Premium Luxury'],
    cta: 'Shop Wigs',
  },
  {
    number: '03',
    title: 'Closures',
    image: hairImages.straightWig11,
    href: '/hair/closures',
    description: 'Complete your install with premium lace closures and frontals.',
    items: ['Waterwave Curl', 'Kinky Curl', 'Straight'],
    cta: 'Shop Closures',
  },
  {
    number: '04',
    title: 'Bundles',
    image: hairImages.curlyBundle01,
    href: '/hair/bundles',
    description: 'Choose your texture, length and bundle package.',
    items: ['Single Bundle', 'Three Bundles'],
    cta: 'Shop Bundles',
  },
  {
    number: '05',
    title: 'Wig Laundry',
    image: hairImages.straightWig07,
    href: '/hair/laundry',
    description: 'Refresh, revive and restyle your wig with BISILE premium hair care services.',
    items: ['Wig Wash Only', 'Wig Treatment', 'Styling Services', 'Full Laundry Packages'],
    cta: 'Book Wig Laundry',
  },
  {
    number: '06',
    title: 'Candles',
    image: packageImages.product07,
    href: '/candles',
    description: 'Warm home fragrance rituals for gifting, quiet evenings and everyday luxury.',
    items: ['Coming soon', 'Home Fragrance', 'Gift-ready Ritual'],
    cta: 'View Candles',
  },
  {
    number: '07',
    title: 'Diffusers',
    image: fragranceImages.product06,
    href: '/diffusers',
    description: 'Home fragrance for a softer atmosphere and a more considered room ritual.',
    items: ['Coming soon', 'Room Ritual', 'Soft Atmosphere'],
    cta: 'View Diffusers',
  },
  {
    number: '08',
    title: 'Care Packages',
    image: packageImages.product04,
    href: '/care-packages',
    description: 'Care packages and pamper edits prepared for thoughtful BISILE gifting moments.',
    items: ['Coming soon', 'Pamper Packages', 'Gift-ready Care'],
    cta: 'View Care Packages',
  },
];

export const Shop: React.FC = () => {
  return (
    <div className="min-h-screen bg-off-white pb-24 pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Shop</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Shop BISILE.</h1>
          <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
            Discover BISILE fragrances.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shopCategories.map((category, index) => (
            <FadeIn key={category.title} delay={index * 60}>
              <Link
                to={category.href}
                className="group flex h-full flex-col border-y bisile-rule py-5 transition-colors hover:border-[#8A6F35]/45"
              >
                <div className="bisile-image-frame aspect-[4/5]">
                  <img src={category.image} alt={category.title} className="editorial-image" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <h2 className="font-inter text-lg font-light leading-tight md:text-xl">
                    <span className="mr-2 text-primary/35">{category.number}</span>{category.title}
                  </h2>
                  <ChevronDown
                    size={20}
                    strokeWidth={1.3}
                    className="mt-1 shrink-0 text-primary/40 transition-all duration-300 group-hover:translate-y-1 group-hover:text-accent"
                  />
                </div>
                <p className="mt-2 font-inter text-sm font-light leading-6 text-primary/58">{category.description}</p>
                <ul className="mt-4 space-y-1.5 border-t bisile-rule pt-4">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="font-inter text-sm font-light text-primary/65 transition-colors group-hover:text-accent"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="bisile-link mt-auto pt-5">
                  {category.cta} <ArrowRight size={14} />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
};
