import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { PRODUCTS } from '../constants';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((item) => item.id === id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); setAdded(false); }, [id]);
  if (!product) return <div className="flex min-h-screen items-center justify-center bg-off-white">Product not found.</div>;

  return (
    <div className="min-h-screen bg-off-white pt-20">
      <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        <div className="relative min-h-[56vh] overflow-hidden bg-secondary">
          <img src={product.image} alt={product.name} className="editorial-image h-full w-full object-cover" />
          <Link to={product.collection === 'hair' ? '/hair' : '/shop'} className="absolute left-6 top-7 flex items-center gap-2 bg-white/85 px-4 py-3 text-[10px] uppercase tracking-[0.16em] backdrop-blur hover:text-accent"><ArrowLeft size={14} /> Back</Link>
        </div>
        <div className="flex items-center bg-white px-6 py-16 md:px-12 lg:px-16">
          <div className="max-w-xl">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-accent">{product.eyebrow}</p>
            <h1 className="font-serif text-6xl leading-[0.9] md:text-8xl">{product.name}</h1>
            <p className="mt-3 font-subhead text-2xl italic text-primary/55">{product.subtitle}</p>
            <p className="mt-6 font-subhead text-3xl">R {product.price.toFixed(2)}</p>
            <p className="mt-7 text-sm leading-8 text-primary/60">{product.description}</p>
            <div className="mt-8 border-y border-black/10 py-5">
              <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-accent">{product.collection === 'hair' ? 'Details' : 'Notes'}</p>
              <div className="flex flex-wrap gap-3">{product.notes.map((note) => <span key={note} className="border border-black/10 px-3 py-2 text-[11px] text-primary/60">{note}</span>)}</div>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex w-fit items-center border border-black/15">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:text-accent"><Minus size={14} /></button><span className="min-w-9 text-center text-xs">{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(99, quantity + 1))} className="p-4 hover:text-accent"><Plus size={14} /></button>
              </div>
              <button onClick={() => { addItem(product, quantity); setAdded(true); }} className="flex-1 bg-primary px-7 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent">{added ? 'Added to bag' : 'Add to bag'}</button>
            </div>
            {added && <Link to="/cart" className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-accent"><Check size={14} /> View your bag</Link>}
            <div className="mt-8 flex items-center gap-3 text-[11px] leading-5 text-primary/55"><ShieldCheck size={17} className="shrink-0 text-accent" strokeWidth={1.2} /> Secure Stripe checkout follows your delivery-details review.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
