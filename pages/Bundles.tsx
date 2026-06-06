import React, { useMemo, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FadeIn } from '../components/UI/FadeIn';
import { BUNDLE_PRICES, BUNDLE_PRODUCTS, BundleLength, BundlePackageType, BundleTexture, formatPrice, getBundlePrice } from '../data/hairCatalog';
import { getWhatsAppUrl } from '../constants';
import type { Product } from '../types';

const packageTypes = Object.keys(BUNDLE_PRICES) as BundlePackageType[];
const textures = Object.keys(BUNDLE_PRICES['Single Bundle']) as BundleTexture[];
const lengths = Object.keys(BUNDLE_PRICES['Single Bundle'].Straight) as BundleLength[];

export const Bundles: React.FC = () => {
  const { addItem } = useCart();
  const [packageType, setPackageType] = useState<BundlePackageType>('Single Bundle');
  const [texture, setTexture] = useState<BundleTexture>('Straight');
  const [length, setLength] = useState<BundleLength>('10 inch');
  const [added, setAdded] = useState(false);
  const price = getBundlePrice(packageType, texture, length);
  const baseProduct = useMemo(() => packageType === 'Single Bundle' ? BUNDLE_PRODUCTS[0] : BUNDLE_PRODUCTS[1], [packageType]);

  const configuredProduct: Product = {
    ...baseProduct,
    id: `${baseProduct.id}-${texture.toLowerCase().replace(/\s+/g, '-')}-${length.replace(/\s+/g, '-')}`,
    name: `${packageType} - ${texture} - ${length}`,
    price,
    description: `${packageType} in ${texture.toLowerCase()}, ${length}. Processed Virgin Hair by BISILE.`,
    selectedOptions: { 'Package type': packageType, Texture: texture, Length: length, 'Hair type': 'Processed Virgin Hair' },
    specs: { 'Package type': packageType, Texture: texture, Length: length, 'Hair type': 'Processed Virgin Hair' },
  };

  return (
    <div className="min-h-screen bg-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Hair / Bundles</p>
          <p className="bisile-kicker mb-3">Hair Bundles</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Choose your texture, length and bundle package.</h1>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Premium processed virgin hair bundles available as single bundles or three-bundle packages.
          </p>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <FadeIn>
          <div className="bisile-image-frame aspect-[4/5]">
            <img src={baseProduct.image} alt={`${packageType} ${texture}`} className="editorial-image" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {baseProduct.galleryImages?.slice(1, 4).map((image, index) => (
              <div key={image} className="bisile-image-frame aspect-square">
                <img src={image} alt={`BISILE bundle detail ${index + 1}`} className="editorial-image" />
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="border-y bisile-rule py-8 font-inter">
            <p className="bisile-kicker mb-3">Processed Virgin Hair</p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">{packageType}</h2>
            <p className="mt-4 max-w-xl text-sm font-light leading-7 text-primary/60">Select your bundle package, texture and length. The price updates before you add it to your bag.</p>
            <p className="mt-8 text-2xl font-light">{formatPrice(price)}</p>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Package type
                <select value={packageType} onChange={(event) => setPackageType(event.target.value as BundlePackageType)} className="field-light px-4 py-4 text-sm text-primary">
                  {packageTypes.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Texture
                <select value={texture} onChange={(event) => setTexture(event.target.value as BundleTexture)} className="field-light px-4 py-4 text-sm text-primary">
                  {textures.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Length
                <select value={length} onChange={(event) => setLength(event.target.value as BundleLength)} className="field-light px-4 py-4 text-sm text-primary">
                  {lengths.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <button onClick={() => { addItem(configuredProduct); setAdded(true); }} className="mt-8 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent">
              {added ? 'Added to bag' : 'Add to Cart'}
            </button>
            <div className="mt-5 flex flex-wrap gap-5">
              <Link to={`/product/${baseProduct.id}`} className="bisile-link">View Details <ArrowRight size={14} /></Link>
              <a href={getWhatsAppUrl(`Hello BISILE, I would like to enquire about ${configuredProduct.name}.`)} target="_blank" rel="noreferrer" className="bisile-link">
                <MessageCircle size={15} /> WhatsApp Us
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};
