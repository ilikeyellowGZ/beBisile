import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FadeIn } from '../components/UI/FadeIn';
import { ProductCard } from '../components/UI/ProductCard';
import { ALL_HAIR_PRODUCTS, WIG_PRODUCTS } from '../constants';
import { CLOSURE_PRODUCT, BUNDLE_PRODUCTS, HAIR_CATEGORY_LINKS, WIG_LAUNDRY_PRODUCT, WIG_LAUNDRY_SERVICE_PRICES, formatPrice } from '../data/hairCatalog';

const LAUNDRY_SERVICE_OPTIONS = Object.entries(WIG_LAUNDRY_SERVICE_PRICES).map(([label, price]) => ({
  label,
  meta: formatPrice(price),
}));

type HairCategory = 'all' | 'wigs' | 'bundles' | 'closures' | 'laundry';

const filters: Array<{ value: HairCategory; label: string }> = [
  { value: 'all', label: 'All Hair' },
  { value: 'wigs', label: 'Wigs' },
  { value: 'bundles', label: 'Bundles' },
  { value: 'closures', label: 'Closures & Frontals' },
  { value: 'laundry', label: 'Wig Laundry' },
];

export const Hair: React.FC = () => {
  const [filter, setFilter] = useState<HairCategory>('all');
  const [addedCategory, setAddedCategory] = useState<string | null>(null);
  const { addItem } = useCart();

  const products = useMemo(() => {
    if (filter === 'wigs') return WIG_PRODUCTS;
    if (filter === 'bundles') return BUNDLE_PRODUCTS;
    if (filter === 'closures') return [CLOSURE_PRODUCT];
    if (filter === 'laundry') return [WIG_LAUNDRY_PRODUCT];
    return ALL_HAIR_PRODUCTS;
  }, [filter]);

  const getCategoryCartProduct = (label: string) => {
    if (label === 'Bhelekazi Wigs') return WIG_PRODUCTS[0];
    if (label === 'Bundles') return BUNDLE_PRODUCTS[0];
    if (label === 'Closures') return CLOSURE_PRODUCT;
    if (label === 'Wig Laundry') return WIG_LAUNDRY_PRODUCT;
    return null;
  };

  const getCategoryCartLabel = (label: string) => {
    if (label === 'Bhelekazi Wigs') return 'Add featured wig';
    if (label === 'Bundles') return 'Add single bundle';
    if (label === 'Closures') return 'Add closure';
    if (label === 'Wig Laundry') return 'Add wash service';
    return 'Add to cart';
  };

  const handleAddCategory = (label: string) => {
    const product = getCategoryCartProduct(label);
    if (!product) return;
    addItem(product);
    setAddedCategory(label);
  };

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Home / Premium Hair</p>
          <p className="bisile-kicker mb-3">Premium Hair</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Premium Hair.</h1>
          <p className="mt-4 max-w-2xl font-inter text-sm font-light leading-7 text-primary/58">
            Choose your BISILE hair category, review the details, then add a starter item to your cart or open the full category to configure your order.
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {HAIR_CATEGORY_LINKS.map((item, index) => {
            const options = item.label === 'Wig Laundry'
              ? LAUNDRY_SERVICE_OPTIONS
              : item.options.map((label) => ({ label, meta: '' }));
            const cartProduct = getCategoryCartProduct(item.label);
            const isAdded = addedCategory === item.label;

            return (
              <FadeIn key={item.label} delay={index * 60}>
                <article className="group flex h-full flex-col border-y bisile-rule py-5 transition-colors hover:border-[#8A6F35]/45">
                  <Link to={item.path} className="block">
                    <div className="bisile-image-frame">
                      <img src={item.image} alt={item.label} className="editorial-image" />
                    </div>
                  </Link>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <h2 className="font-inter text-lg font-light leading-tight md:text-xl">
                      <span className="mr-2 text-primary/35">{String(index + 1).padStart(2, '0')}</span>{item.label}
                    </h2>
                    <ChevronDown size={20} strokeWidth={1.3} className="mt-1 shrink-0 text-primary/40 transition-all duration-300 group-hover:translate-y-1 group-hover:text-accent" />
                  </div>
                  <p className="mt-2 font-inter text-sm font-light leading-6 text-primary/58">{item.description}</p>
                  {options.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t bisile-rule pt-4">
                      {options.map((option) => (
                        <li key={option.label} className="flex items-start justify-between gap-4 font-inter text-sm font-light text-primary/65 transition-colors group-hover:text-accent">
                          <span>{option.label}</span>
                          {option.meta && <span className="shrink-0 text-primary/45">{option.meta}</span>}
                        </li>
                      ))}
                    </ul>
                  )}

                  {cartProduct && (
                    <div className="mt-auto grid gap-3 pt-5">
                      <button
                        type="button"
                        onClick={() => handleAddCategory(item.label)}
                        className="flex h-11 items-center justify-center border border-[#A3915D]/45 px-4 font-inter text-xs font-light uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary hover:bg-primary hover:text-[#F7F4EF]"
                      >
                        {isAdded ? 'Added to cart' : getCategoryCartLabel(item.label)}
                      </button>
                      <Link to={item.path} className="bisile-link justify-center">
                        {item.cta} <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="bisile-shell bisile-section">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <FadeIn>
            <p className="bisile-kicker mb-3">Hair</p>
            <h2 className="font-inter text-3xl font-light leading-tight md:text-5xl">Shop by category.</h2>
          </FadeIn>
          <label className="field-light flex h-11 w-full items-center gap-2 px-3 md:w-auto">
            <SlidersHorizontal size={15} strokeWidth={1.25} className="text-[#8A6F35]" />
            <span className="sr-only">Filter hair category</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as HairCategory)} className="h-full min-w-52 bg-transparent font-inter text-sm font-light text-[#2A2114] outline-none">
              {filters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="border-y bisile-rule py-4 font-inter text-sm font-light text-primary/50">
          {filters.find((option) => option.value === filter)?.label} / {products.length} item{products.length === 1 ? '' : 's'}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 45}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
};
