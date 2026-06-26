import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { getWhatsAppUrl } from '../constants';
import { CHECKOUT_STORAGE_KEY } from './Checkout';
import { configuredApiUrl, readJsonResponse } from '../utils/http';

const VERIFY_API_OVERRIDE = import.meta.env.VITE_PAYSTACK_VERIFY_API_URL;
const getVerifyApiUrl = (reference: string) => VERIFY_API_OVERRIDE
  ? configuredApiUrl(VERIFY_API_OVERRIDE, `/api/payments/verify/${encodeURIComponent(reference)}`)
  : configuredApiUrl(undefined, `/api/payments/verify/${encodeURIComponent(reference)}`);

type VerificationPayload = {
  success?: boolean;
  status?: string;
  error?: string;
  message?: string;
  orderNumber?: string | null;
  customerName?: string | null;
  orderTotal?: number | null;
  currency?: string | null;
  shippingOption?: string | null;
  paymentStatus?: string | null;
};

export const PaymentSuccess: React.FC = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fallbackOrderNumber = searchParams.get('order');
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState<'checking' | 'paid' | 'processing' | 'error'>('checking');
  const [summary, setSummary] = useState<VerificationPayload | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');

  const orderNumber = summary?.orderNumber || fallbackOrderNumber;
  const paymentStatus = summary?.paymentStatus || (status === 'paid' ? 'paid' : status);
  const formattedTotal = typeof summary?.orderTotal === 'number'
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: summary.currency || 'ZAR' }).format(summary.orderTotal)
    : null;

  const statusCopy = useMemo(() => {
    if (status === 'paid') return 'A confirmation email will be sent to you shortly. Please keep your order reference safe for any enquiries.';
    if (error) return 'We could not confirm this payment yet. BISILE will only process the order once Paystack verification succeeds.';
    return 'Paystack is securely confirming your payment. This page will update once verification is complete.';
  }, [error, status]);

  useEffect(() => {
    if (status !== 'paid') return undefined;

    clearCart();
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);

    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          navigate('/');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [clearCart, navigate, status]);

  useEffect(() => {
    if (!reference) {
      setStatus('processing');
      return;
    }

    let isActive = true;
    const verifyPayment = async () => {
      try {
        const response = await fetch(getVerifyApiUrl(reference), {
          method: VERIFY_API_OVERRIDE ? 'POST' : 'GET',
          headers: {
            ...(VERIFY_API_OVERRIDE ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(VERIFY_API_OVERRIDE ? { body: JSON.stringify({ reference }) } : {}),
        });
        const payload = await readJsonResponse<VerificationPayload>(response, 'Payment verification failed');
        if (payload.success === false) throw new Error(payload.message || payload.error || 'Payment verification failed');
        if (!isActive) return;
        setSummary(payload);
        setStatus(payload.status === 'success' || payload.paymentStatus === 'paid' ? 'paid' : 'processing');
      } catch (verifyError) {
        if (!isActive) return;
        setError(verifyError instanceof Error ? verifyError.message : 'Payment verification failed');
        setStatus('error');
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
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-accent">{status === 'paid' ? 'Payment confirmed' : 'Payment verification'}</p>
        <h1 className="font-serif text-6xl">{status === 'paid' ? 'Thank you for your order.' : 'Payment verification in progress.'}</h1>
        {status === 'paid' && <p className="mt-4 text-lg text-primary/70">Your BISILE order has been received and is being processed.</p>}
        <p className="mt-5 text-sm leading-7 text-primary/60">{statusCopy}</p>

        <div className="mt-8 grid gap-3 border-y border-[#B9AA8B]/36 py-6 text-left font-inter text-xs text-primary/62">
          {orderNumber && <div className="flex justify-between gap-6"><span>Order reference</span><span className="text-right text-primary">{orderNumber}</span></div>}
          {summary?.customerName && <div className="flex justify-between gap-6"><span>Customer name</span><span className="text-right text-primary">{summary.customerName}</span></div>}
          {formattedTotal && <div className="flex justify-between gap-6"><span>Order total</span><span className="text-right text-primary">{formattedTotal}</span></div>}
          {summary?.shippingOption && <div className="flex justify-between gap-6"><span>Shipping option</span><span className="text-right text-primary">{summary.shippingOption}</span></div>}
          <div className="flex justify-between gap-6"><span>Payment status</span><span className="text-right capitalize text-primary">{paymentStatus}</span></div>
          {reference && <div className="flex justify-between gap-6"><span>Paystack reference</span><span className="text-right text-primary">{reference}</span></div>}
        </div>

        {error && <p className="mt-5 text-xs leading-6 text-red-700">{error}</p>}
        {status === 'paid' && <p className="mt-5 text-xs uppercase tracking-[0.16em] text-primary/45">Redirecting you to the homepage in {countdown} seconds...</p>}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">
            Return Home
          </Link>
          <a href={getWhatsAppUrl(`Hello BISILE, I need help with order ${orderNumber || reference || ''}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#B9AA8B]/60 px-6 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">
            <MessageCircle size={14} strokeWidth={1.2} /> WhatsApp support
          </a>
        </div>
      </div>
    </div>
  );
};
