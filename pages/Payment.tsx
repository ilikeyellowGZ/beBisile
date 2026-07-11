import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { CHECKOUT_STORAGE_KEY } from './Checkout';
import { SHIPPING_PARTNERS } from '../constants';
import { configuredApiUrl, readJsonResponse } from '../utils/http';
import { ensureBackendReady, prewarmBackend, wakeBackend } from '../utils/backendWake';
import type { CheckoutDetails } from '../types';

const API_URL = configuredApiUrl(
  import.meta.env.VITE_PAYSTACK_CHECKOUT_API_URL || import.meta.env.VITE_CHECKOUT_API_URL,
  '/api/payments/initialize',
);

type PaystackCheckoutResponse = {
  success?: boolean;
  url?: string;
  authorization_url?: string;
  authorizationUrl?: string;
  access_code?: string;
  accessCode?: string;
  reference?: string;
  message?: string;
  error?: string;
};

const formatDeliveryPrice = (price: number) => `R${price.toFixed(2).replace('.', ',')}`;

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
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const checkoutAbortRef = useRef<AbortController | null>(null);
  const selectedShipping = SHIPPING_PARTNERS.find((option) => option.id === details?.shippingPartner) ?? SHIPPING_PARTNERS[0];
  const estimatedTotal = subtotal + selectedShipping.price;
  const paymentDisabled = loading || isCheckingBackend;

  useEffect(() => {
    if (!items.length || !details) return;
    void prewarmBackend();
    const controller = new AbortController();

    const pingServer = async () => {
      try {
        const ready = await wakeBackend({ timeoutMs: 30_000, retryDelayMs: 2_000, signal: controller.signal });
        if (ready) {
          setServerReady(true);
        }
      } catch (wakeError) {
        if (!controller.signal.aborted) console.warn('BISILE background payment health check failed.', wakeError);
      }
    };

    void pingServer();
    return () => {
      controller.abort();
    };
  }, [details, items.length]);

  useEffect(() => () => checkoutAbortRef.current?.abort(), []);

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

  const startPaystackCheckout = async () => {
    if (loading) return;
    checkoutAbortRef.current?.abort();
    const controller = new AbortController();
    checkoutAbortRef.current = controller;

    setLoading(true);
    setIsCheckingBackend(true);
    setError('');
    try {
      await ensureBackendReady({ signal: controller.signal });
      setServerReady(true);
      setIsCheckingBackend(false);

      console.info('BISILE payment initialization request', { url: API_URL, itemCount: items.length });
      const response = await fetch(API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo: {
            fullName: details.fullName,
            email: details.email,
            phone: details.phone,
          },
          shippingAddress: {
            streetAddress: details.address,
            city: details.city,
            province: details.province,
            postalCode: details.postalCode,
            country: details.country,
            deliveryInstructions: details.deliveryInstructions,
            orderNotes: details.notes,
            alternativePhone: details.alternativePhone,
            instagramHandle: details.instagramHandle,
          },
          shippingPartner: { id: selectedShipping.id },
          items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
        }),
      });
      const payload = await readJsonResponse<PaystackCheckoutResponse>(response, 'Unable to start Paystack checkout.');
      const checkoutUrl = payload.authorization_url || payload.authorizationUrl || payload.url;
      if (payload.success === false || !checkoutUrl) throw new Error(payload.message || payload.error || 'Unable to start Paystack checkout.');
      console.info('BISILE Paystack redirect URL received', { reference: payload.reference, hasAuthorizationUrl: Boolean(checkoutUrl) });
      window.location.assign(checkoutUrl);
    } catch (checkoutError) {
      if (!controller.signal.aborted) {
        setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start Paystack checkout.');
        setLoading(false);
        setIsCheckingBackend(false);
      }
    } finally {
      if (checkoutAbortRef.current === controller) checkoutAbortRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-off-white px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Checkout / 02 Payment</p>
        <h1 className="font-serif text-6xl md:text-7xl">Review and pay securely.</h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="bisile-card-surface p-6 md:p-8">
            <div className="flex items-start gap-4 border-b border-[#B9AA8B]/36 pb-7">
              <div className="bg-[#E9E6DF] p-3 text-[#8A6F35]"><CreditCard strokeWidth={1.2} /></div>
              <div>
                <h2 className="font-subhead text-2xl text-[#2A2114]">Paystack secure checkout</h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-[#5B3A24]/62">
                  Select "Continue to Paystack" to enter your card or available payment method on Paystack's hosted checkout page. BISILE does not store your card details.
                </p>
              </div>
            </div>

            <div className="grid gap-7 py-7 md:grid-cols-2">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-accent">Delivery to</p>
                <p className="text-sm leading-7">
                  {details.fullName}<br />
                  {details.address}<br />
                  {details.city}, {details.province}<br />
                  {details.country}, {details.postalCode}<br />
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
                <p className="mt-4 flex justify-between gap-4 border-t border-[#B9AA8B]/36 pt-4 text-sm text-[#5B3A24]">
                  <span>{selectedShipping.name}</span>
                  <span>{formatDeliveryPrice(selectedShipping.price)}</span>
                </p>
              </div>
            </div>

            {error && <p className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-xs leading-6 text-red-800">{error}</p>}

            <div className="flex flex-col gap-4 border-t border-[#B9AA8B]/36 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/checkout" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#5B3A24]/62 hover:text-accent">
                <ArrowLeft size={14} /> Edit details
              </Link>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button disabled={paymentDisabled} onClick={startPaystackCheckout} className="flex items-center justify-between gap-8 bg-[#5B3A24] px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-[#F7F4EF] transition-colors hover:bg-[#8A6F35] disabled:cursor-not-allowed disabled:opacity-70">
                  <span className="inline-flex items-center gap-3">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? (isCheckingBackend ? 'Connecting securely...' : 'Opening Paystack...') : 'Continue to Paystack'}
                  </span>
                  <ArrowRight size={14} />
                </button>
                {!serverReady && !loading && <span className="text-[9px] uppercase tracking-[0.16em] text-[#5B3A24]/46">Payment service will connect automatically</span>}
              </div>
            </div>
          </section>

          <aside className="bisile-card-surface h-fit p-7">
            <div className="mb-5 flex items-center gap-3 text-accent">
              <LockKeyhole size={17} />
              <p className="text-[10px] uppercase tracking-[0.18em]">Secure payment</p>
            </div>
            <div className="space-y-3 border-b border-[#B9AA8B]/36 pb-5 text-xs text-[#5B3A24]/66">
              <div className="flex justify-between"><span>Subtotal</span><span>R {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{selectedShipping.name}</span><span>{formatDeliveryPrice(selectedShipping.price)}</span></div>
            </div>
            <div className="flex justify-between py-5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#5B3A24]/62">Estimated total</span>
              <span className="font-subhead text-2xl text-[#2A2114]">R {estimatedTotal.toFixed(2)}</span>
            </div>
            <p className="flex gap-3 border-t border-[#B9AA8B]/36 pt-5 text-[11px] leading-5 text-[#5B3A24]/62">
              <ShieldCheck size={16} className="shrink-0 text-accent" /> Paystack handles payment entry and confirmation. Amounts are recalculated securely by the server.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};
