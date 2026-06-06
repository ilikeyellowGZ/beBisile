import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { CHECKOUT_STORAGE_KEY } from './Checkout';
import type { CheckoutDetails } from '../types';

const API_URL = import.meta.env.VITE_CHECKOUT_API_URL || '/.netlify/functions/create-checkout-session';

export const Payment: React.FC = () => {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const details = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CHECKOUT_STORAGE_KEY) ?? '') as CheckoutDetails;
    } catch {
      return null;
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white">
        <Link to="/shop" className="border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em]">
          Return to shop
        </Link>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white">
        <button onClick={() => navigate('/checkout')} className="border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em]">
          Enter delivery details
        </button>
      </div>
    );
  }

  const startStripeCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: details,
          items: items.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Unable to start secure checkout.');
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start secure checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Checkout / 02 Payment</p>
        <h1 className="font-serif text-6xl md:text-7xl">Review and pay securely.</h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="border border-black/10 bg-white p-6 md:p-8">
            <div className="flex items-start gap-4 border-b border-black/10 pb-7">
              <div className="bg-secondary p-3"><CreditCard strokeWidth={1.2} /></div>
              <div>
                <h2 className="font-subhead text-2xl">Stripe secure checkout</h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-primary/60">
                  Select "Continue to Stripe" to enter your card or available payment method on Stripe's hosted checkout page. BISILE does not store your card details.
                </p>
              </div>
            </div>

            <div className="grid gap-7 py-7 md:grid-cols-2">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-accent">Delivery to</p>
                <p className="text-sm leading-7">
                  {details.fullName}<br />
                  {details.address}<br />
                  {details.city}, {details.postalCode}<br />
                  {details.phone}
                </p>
              </div>

              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-accent">Order items</p>
                {items.map((item) => (
                  <p key={item.id} className="mb-2 flex justify-between gap-4 text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>R {(item.price * item.quantity).toFixed(2)}</span>
                  </p>
                ))}
              </div>
            </div>

            {error && <p className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-xs leading-6 text-red-800">{error}</p>}

            <div className="flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/checkout" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary/60 hover:text-accent">
                <ArrowLeft size={14} /> Edit details
              </Link>
              <button disabled={loading} onClick={startStripeCheckout} className="flex items-center justify-between gap-8 bg-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white hover:bg-accent disabled:opacity-50">
                {loading ? 'Opening Stripe...' : 'Continue to Stripe'} <ArrowRight size={14} />
              </button>
            </div>
          </section>

          <aside className="h-fit border border-black/10 bg-white p-7">
            <div className="mb-5 flex items-center gap-3 text-accent">
              <LockKeyhole size={17} />
              <p className="text-[10px] uppercase tracking-[0.18em]">Secure payment</p>
            </div>
            <div className="space-y-3 border-b border-black/10 pb-5 text-xs text-primary/60">
              <div className="flex justify-between"><span>Subtotal</span><span>R {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>Confirmed securely</span></div>
            </div>
            <div className="flex justify-between py-5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-primary/55">Estimated total</span>
              <span className="font-subhead text-2xl">R {subtotal.toFixed(2)}</span>
            </div>
            <p className="flex gap-3 border-t border-black/10 pt-5 text-[11px] leading-5 text-primary/55">
              <ShieldCheck size={16} className="shrink-0 text-accent" /> Stripe handles payment entry and confirmation. Amounts are recalculated securely by the server.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};
