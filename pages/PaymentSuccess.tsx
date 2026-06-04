import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { CHECKOUT_STORAGE_KEY } from './Checkout';

export const PaymentSuccess: React.FC = () => {
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); sessionStorage.removeItem(CHECKOUT_STORAGE_KEY); }, []);
  return <div className="flex min-h-screen items-center justify-center bg-off-white px-6 pt-20 text-center"><div className="max-w-xl"><CheckCircle2 size={38} strokeWidth={1.1} className="mx-auto mb-5 text-accent" /><p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-accent">Payment received</p><h1 className="font-serif text-6xl">Thank you for your order.</h1><p className="mt-5 text-sm leading-7 text-primary/60">Your payment was completed securely. BISILE will confirm your order and delivery details shortly.</p><Link to="/" className="mt-7 inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">Return home</Link></div></div>;
};
