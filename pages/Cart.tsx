import React from 'react';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

export const Cart: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!items.length) return (
    <div className="flex min-h-screen items-center justify-center bg-off-white px-6 pt-24 text-center">
      <div><p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Your bag</p><h1 className="font-serif text-6xl">Your bag is empty.</h1><Link to="/shop" className="mt-7 inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">Browse fragrance</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-off-white px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Shopping bag</p>
        <h1 className="font-serif text-6xl md:text-7xl">Your selections.</h1>
        <p className="mt-3 text-xs text-primary/55">{totalItems} item{totalItems === 1 ? '' : 's'}</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="border border-black/10 bg-white">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-black/10 p-5 last:border-b-0 md:gap-6 md:p-7">
                <img src={item.image} alt={item.name} className="h-32 w-24 shrink-0 object-cover md:h-40 md:w-32" />
                <div className="flex flex-1 flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div><p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-accent">{item.eyebrow}</p><h2 className="font-subhead text-2xl">{item.name}</h2><p className="mt-2 text-xs text-primary/55">R {item.price.toFixed(2)}</p></div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center border border-black/15">
                      <button aria-label={`Decrease ${item.name} quantity`} onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} className="p-3 hover:text-accent"><Minus size={13} /></button>
                      <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                      <button aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3 hover:text-accent"><Plus size={13} /></button>
                    </div>
                    <button aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)} className="text-primary/45 hover:text-accent"><Trash2 size={16} strokeWidth={1.2} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit border border-black/10 bg-white p-7">
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-accent">Order summary</p>
            <div className="space-y-3 border-b border-black/10 pb-5 text-xs text-primary/60"><div className="flex justify-between"><span>Subtotal</span><span>R {subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Delivery</span><span>Calculated next</span></div></div>
            <div className="flex items-center justify-between py-5"><span className="text-[10px] uppercase tracking-[0.16em] text-primary/55">Estimated total</span><span className="font-subhead text-2xl">R {subtotal.toFixed(2)}</span></div>
            <button onClick={() => navigate('/checkout')} className="flex w-full items-center justify-between bg-primary px-5 py-4 text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-accent">Continue to checkout <ArrowRight size={14} /></button>
            <Link to="/shop" className="mt-5 block text-center text-[10px] uppercase tracking-[0.16em] text-primary/55 hover:text-accent">Continue shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
};
