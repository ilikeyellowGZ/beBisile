import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { CHECKOUT_STORAGE_KEY } from './Checkout';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const VERIFY_API_URL = import.meta.env.VITE_PAYSTACK_VERIFY_API_URL
  || (API_BASE_URL ? `${API_BASE_URL}/api/checkout/verify-paystack-transaction` : '/.netlify/functions/verify-paystack-transaction');

export const PaymentSuccess: React.FC = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState<'checking' | 'paid' | 'processing'>('checking');
  const [error, setError] = useState('');

  const statusCopy = useMemo(() => {
    if (status === 'paid') return 'Paystack confirmed your payment. BISILE will confirm your order and delivery details shortly.';
    if (error) return 'Paystack is still processing this payment. BISILE will confirm your order once payment verification is complete.';
    return 'Paystack is securely confirming your payment. BISILE will confirm your order and delivery details shortly.';
  }, [error, status]);

  useEffect(() => {
    clearCart();
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }, [clearCart]);

  useEffect(() => {
    if (!reference) {
      setStatus('processing');
      return;
    }

    let isActive = true;
    const verifyPayment = async () => {
      try {
        const response = await fetch(VERIFY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const payload = await response.json() as { status?: string; error?: string };
        if (!response.ok) throw new Error(payload.error || 'Payment verification failed');
        if (!isActive) return;
        setStatus(payload.status === 'success' ? 'paid' : 'processing');
      } catch (verifyError) {
        if (!isActive) return;
        setError(verifyError instanceof Error ? verifyError.message : 'Payment verification failed');
        setStatus('processing');
      }
    };

    void verifyPayment();
    return () => {
      isActive = false;
    };
  }, [reference]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white px-6 pt-20 text-center">
      <div className="max-w-xl">
        <CheckCircle2 size={38} strokeWidth={1.1} className="mx-auto mb-5 text-accent" />
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-accent">{status === 'paid' ? 'Payment confirmed' : 'Payment processing'}</p>
        <h1 className="font-serif text-6xl">Thank you for your order.</h1>
        <p className="mt-5 text-sm leading-7 text-primary/60">
          {statusCopy}
        </p>
        {orderNumber && <p className="mt-5 text-xs uppercase tracking-[0.16em] text-primary/50">Order {orderNumber}</p>}
        {reference && <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/40">Reference {reference}</p>}
        <Link to="/" className="mt-7 inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">
          Return home
        </Link>
      </div>
    </div>
  );
};
