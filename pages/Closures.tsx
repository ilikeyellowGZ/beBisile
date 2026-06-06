import React, { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { FadeIn } from '../components/UI/FadeIn';
import { CLOSURE_PRICES, CLOSURE_PRODUCT, ClosureLaceSize, ClosureLength, ClosureTexture, formatPrice, getClosurePrice } from '../data/hairCatalog';
import { getWhatsAppUrl } from '../constants';
import type { Product } from '../types';

const laceSizes = Object.keys(CLOSURE_PRICES) as ClosureLaceSize[];
const textures = Object.keys(CLOSURE_PRICES['4x4 Closure']) as ClosureTexture[];
const lengths = Object.keys(CLOSURE_PRICES['4x4 Closure'].Straight) as ClosureLength[];

export const Closures: React.FC = () => {
  const { addItem } = useCart();
  const [laceSize, setLaceSize] = useState<ClosureLaceSize>('4x4 Closure');
  const [texture, setTexture] = useState<ClosureTexture>('Straight');
  const [length, setLength] = useState<ClosureLength>('10 inch');
  const [added, setAdded] = useState(false);
  const price = getClosurePrice(laceSize, texture, length);

  const configuredProduct: Product = {
    ...CLOSURE_PRODUCT,
    id: `closure-${laceSize.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${texture.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${length.replace(/\s+/g, '-')}`,
    name: `${laceSize} - ${texture} - ${length}`,
    price,
    description: `${laceSize} in ${texture.toLowerCase()}, ${length}. Processed Virgin Hair by BISILE.`,
    selectedOptions: { 'Lace size': laceSize, Texture: texture, Length: length, 'Hair type': 'Processed Virgin Hair' },
    specs: { 'Lace size': laceSize, Texture: texture, Length: length, 'Hair type': 'Processed Virgin Hair' },
  };

  return (
    <div className="min-h-screen bg-white pt-16 text-primary">
      <section className="bisile-shell border-b bisile-rule py-10 md:py-14">
        <FadeIn>
          <p className="mb-3 font-inter text-sm font-light text-primary/45">Hair / Closures & Frontals</p>
          <p className="bisile-kicker mb-3">Closures & Frontals</p>
          <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">Complete your install with premium lace.</h1>
          <p className="mt-5 max-w-2xl font-inter text-sm font-light leading-7 text-primary/60">
            Choose your lace size, texture and length for a refined BISILE install finish.
          </p>
        </FadeIn>
      </section>

      <section className="bisile-shell bisile-section grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <FadeIn>
          <div className="bisile-image-frame aspect-[4/5]">
            <img src={CLOSURE_PRODUCT.image} alt="BISILE closures and frontals" className="editorial-image" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {CLOSURE_PRODUCT.galleryImages?.slice(1, 4).map((image, index) => (
              <div key={image} className="bisile-image-frame aspect-square">
                <img src={image} alt={`BISILE closure detail ${index + 1}`} className="editorial-image" />
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="border-y bisile-rule py-8 font-inter">
            <p className="bisile-kicker mb-3">Processed Virgin Hair</p>
            <h2 className="text-3xl font-light leading-tight md:text-5xl">Closures & Frontals</h2>
            <p className="mt-4 max-w-xl text-sm font-light leading-7 text-primary/60">Select your lace size, texture and length. The price updates before checkout.</p>
            <p className="mt-8 text-2xl font-light">{formatPrice(price)}</p>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Lace size
                <select value={laceSize} onChange={(event) => setLaceSize(event.target.value as ClosureLaceSize)} className="field-light px-4 py-4 text-sm text-primary">
                  {laceSizes.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Texture
                <select value={texture} onChange={(event) => setTexture(event.target.value as ClosureTexture)} className="field-light px-4 py-4 text-sm text-primary">
                  {textures.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-light text-primary/60">
                Length
                <select value={length} onChange={(event) => setLength(event.target.value as ClosureLength)} className="field-light px-4 py-4 text-sm text-primary">
                  {lengths.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <button onClick={() => { addItem(configuredProduct); setAdded(true); }} className="mt-8 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent">
              {added ? 'Added to bag' : 'Add to Cart'}
            </button>
            <div className="mt-5 flex flex-wrap gap-5">
              <Link to={`/product/${CLOSURE_PRODUCT.id}`} className="bisile-link">View Details <ArrowRight size={14} /></Link>
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
