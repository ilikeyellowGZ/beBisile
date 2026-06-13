import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { FadeIn } from '../components/UI/FadeIn';
import { BisileSelect } from '../components/UI/BisileSelect';
import { ProductCard } from '../components/UI/ProductCard';
import { ALL_HAIR_PRODUCTS, FRAGRANCE_PRODUCTS } from '../constants';
import { fragranceImages, hairImages, packageImages } from '../src/assets/images';
import { SORT_OPTIONS, type CatalogSort, sortProducts } from '../utils/catalog';

type ShopFilter = 'all' | 'fragrance' | 'hair' | 'new' | 'best-seller' | 'under-550' | 'over-550';

const shopProducts = [...FRAGRANCE_PRODUCTS, ...ALL_HAIR_PRODUCTS];

const filterOptions: Array<{ value: ShopFilter; label: string }> = [
  { value: 'all', label: 'All products' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'hair', label: 'Hair' },
  { value: 'new', label: 'New' },
  { value: 'best-seller', label: 'Best sellers' },
  { value: 'under-550', label: 'Under R550' },
  { value: 'over-550', label: 'R550 and over' },
];

const shopCategories = [
  {
    number: '01',
    title: 'Imvelo Collection',
    image: fragranceImages.indoniyamanzi,
    href: '/fragrances',
    description: 'The BISILE fragrance drop, refined into individual 50ml Eau de Parfum rituals.',
    items: ['Indoniyamanzi', 'Inkanyezi', 'Ndalwenhle', 'Langelihle', 'Sithelo', 'Luyanda'],
    cta: 'Shop Fragrances',
  },
  {
    number: '02',
    title: 'BhelekWigs',
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

const applyFilter = (filter: ShopFilter) => {
  if (filter === 'fragrance') return FRAGRANCE_PRODUCTS;
  if (filter === 'hair') return ALL_HAIR_PRODUCTS;
  if (filter === 'new') return shopProducts.filter((product) => product.isNew);
  if (filter === 'best-seller') return shopProducts.filter((product) => product.isBestSeller);
  if (filter === 'under-550') return shopProducts.filter((product) => product.price < 550);
  if (filter === 'over-550') return shopProducts.filter((product) => product.price >= 550);
  return shopProducts;
};

export const Shop: React.FC = () => {
  const [filter, setFilter] = useState<ShopFilter>('all');
  const [sort, setSort] = useState<CatalogSort>('featured');

  const products = useMemo(() => sortProducts(applyFilter(filter), sort), [filter, sort]);
  const activeFilterLabel = filterOptions.find((option) => option.value === filter)?.label ?? 'Filters';

  return (
    <div className="min-h-screen bg-off-white pb-24 pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Shop</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Shop BISILE.</h1>
          <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
            Discover BISILE fragrance, luxury hair, wigs, bundles, closures, frontals, wig laundry services, and gifting rituals.
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

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <FadeIn>
            <p className="bisile-kicker mb-3">Catalogue</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Shop all products.</h2>
          </FadeIn>
          <div className="grid gap-3 sm:grid-cols-2">
            <BisileSelect
              value={filter}
              options={filterOptions}
              onChange={setFilter}
              ariaLabel="Filter shop products"
              icon={<SlidersHorizontal size={15} strokeWidth={1.25} />}
              className="min-w-[13rem]"
            />
            <BisileSelect
              value={sort}
              options={SORT_OPTIONS}
              onChange={setSort}
              ariaLabel="Sort shop products"
              className="min-w-[13rem]"
            />
          </div>
        </div>
        <div className="border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {activeFilterLabel} / {SORT_OPTIONS.find((option) => option.value === sort)?.label}
          <span className="ml-2 text-primary/35">/ {products.length} of {shopProducts.length} items</span>
        </div>
        {products.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => <FadeIn key={product.id} delay={index * 45}><ProductCard product={product} /></FadeIn>)}
          </div>
        ) : (
          <div className="mt-10 border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/60">
            No products match this filter.
          </div>
        )}
      </section>
    </div>
  );
};
