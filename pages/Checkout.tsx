import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import type { CheckoutDetails } from '../types';

export const CHECKOUT_STORAGE_KEY = 'bisile-checkout-details-v1';

const initial: CheckoutDetails = { fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', notes: '' };

export const Checkout: React.FC = () => {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutDetails>(() => {
    try { return JSON.parse(sessionStorage.getItem(CHECKOUT_STORAGE_KEY) ?? '') as CheckoutDetails; } catch { return initial; }
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutDetails, string>>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof CheckoutDetails, string>> = {};
    if (form.fullName.trim().length < 3) next.fullName = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 7) next.phone = 'Please enter a valid phone number.';
    if (form.address.trim().length < 5) next.address = 'Please enter your delivery address.';
    if (!form.city.trim()) next.city = 'Please enter your city.';
    if (form.postalCode.trim().length < 3) next.postalCode = 'Please enter a valid postal code.';
    setErrors(next);
    if (Object.keys(next).length) return;
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(form));
    navigate('/payment');
  };

  if (!items.length) return <div className="flex min-h-screen items-center justify-center bg-off-white px-6 text-center"><div><h1 className="font-serif text-6xl">Your bag is empty.</h1><Link to="/shop" className="mt-7 inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em]">Return to shop</Link></div></div>;

  return <div className="min-h-screen bg-off-white px-6 pb-24 pt-32 md:px-12"><div className="mx-auto max-w-[1320px]"><p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Checkout / 01 Delivery details</p><h1 className="font-serif text-6xl md:text-7xl">Where should we send it?</h1><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><form onSubmit={submit} className="grid gap-5 border border-black/10 bg-white p-6 sm:grid-cols-2 md:p-8">{[
    ['fullName', 'Full name', 'name'], ['email', 'Email address', 'email'], ['phone', 'Contact number', 'tel'], ['address', 'Street address', 'street-address'], ['city', 'City', 'address-level2'], ['postalCode', 'Postal code', 'postal-code'],
  ].map(([name, label, autocomplete]) => <label key={name} className={name === 'address' ? 'sm:col-span-2' : ''}><span className="mb-2 block text-[10px] text-primary/60">{label}</span><input required autoComplete={autocomplete} value={form[name as keyof CheckoutDetails]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="field-light w-full px-4 py-4 text-xs" />{errors[name as keyof CheckoutDetails] && <span className="mt-2 block text-[11px] text-red-700">{errors[name as keyof CheckoutDetails]}</span>}</label>)}<label className="sm:col-span-2"><span className="mb-2 block text-[10px] text-primary/60">Order notes (optional)</span><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="field-light w-full px-4 py-4 text-xs" /></label><div className="flex flex-col gap-4 border-t border-black/10 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><Link to="/cart" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary/60 hover:text-accent"><ArrowLeft size={14} /> Back to bag</Link><button className="flex items-center justify-between gap-8 bg-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white hover:bg-accent">Continue to payment <ArrowRight size={14} /></button></div></form><aside className="h-fit border border-black/10 bg-white p-7"><p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-accent">Order summary</p>{items.map((item) => <div key={item.id} className="mb-3 flex justify-between gap-3 text-xs text-primary/60"><span>{item.name} x{item.quantity}</span><span>R {(item.price * item.quantity).toFixed(2)}</span></div>)}<div className="mt-5 flex justify-between border-t border-black/10 pt-5"><span className="text-[10px] uppercase tracking-[0.16em] text-primary/55">Estimated total</span><span className="font-subhead text-2xl">R {subtotal.toFixed(2)}</span></div><p className="mt-6 flex gap-3 text-[11px] leading-5 text-primary/55"><ShieldCheck size={16} className="shrink-0 text-accent" /> Payment details are entered securely on Stripe Checkout after your review.</p></aside></div></div></div>;
};
