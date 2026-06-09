import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { CONTACT_PHONE, LAYBYE_TERMS, ORDER_EMAIL, SHIPPING_PARTNERS } from '../constants';
import type { CheckoutDetails } from '../types';

export const CHECKOUT_STORAGE_KEY = 'bisile-checkout-details-v1';

const initial: CheckoutDetails = {
  fullName: '',
  email: '',
  phone: '',
  alternativePhone: '',
  instagramHandle: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'South Africa',
  deliveryInstructions: '',
  notes: '',
  shippingPartner: SHIPPING_PARTNERS[0].id,
};

const shippingLogo = (mark: string, tone: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="64" viewBox="0 0 120 64"><rect width="120" height="64" rx="0" fill="%23F7F4EF"/><rect x="7" y="7" width="106" height="50" rx="0" fill="${tone.replace('#', '%23')}" fill-opacity=".12" stroke="${tone.replace('#', '%23')}" stroke-opacity=".45"/><text x="60" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${tone.replace('#', '%23')}" letter-spacing="2">${mark}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

export const Checkout: React.FC = () => {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutDetails>(() => {
    try { return { ...initial, ...JSON.parse(sessionStorage.getItem(CHECKOUT_STORAGE_KEY) ?? '') } as CheckoutDetails; } catch { return initial; }
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutDetails, string>>>({});

  const selectedShipping = useMemo(
    () => SHIPPING_PARTNERS.find((option) => option.id === form.shippingPartner) ?? SHIPPING_PARTNERS[0],
    [form.shippingPartner]
  );
  const estimatedTotal = subtotal + selectedShipping.price;

  const updateField = (name: keyof CheckoutDetails, value: string) => setForm((current) => ({ ...current, [name]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof CheckoutDetails, string>> = {};
    if (form.fullName.trim().length < 3) next.fullName = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 7) next.phone = 'Please enter a valid phone number.';
    if (form.address.trim().length < 5) next.address = 'Please enter your street address.';
    if (!form.city.trim()) next.city = 'Please enter your city.';
    if (!form.province.trim()) next.province = 'Please enter your province.';
    if (form.postalCode.trim().length < 3) next.postalCode = 'Please enter a valid postal code.';
    if (!form.country.trim()) next.country = 'Please enter your country.';
    if (!form.shippingPartner) next.shippingPartner = 'Please choose a shipping partner.';
    setErrors(next);
    if (Object.keys(next).length) return;
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(form));
    navigate('/payment');
  };

  if (!items.length) return <div className="flex min-h-screen items-center justify-center bg-off-white px-6 text-center"><div><h1 className="font-serif text-6xl">Your bag is empty.</h1><Link to="/hair" className="mt-7 inline-block border border-primary px-6 py-4 text-[10px] uppercase tracking-[0.18em]">Return to hair</Link></div></div>;

  const fields: Array<[keyof CheckoutDetails, string, string, string, boolean?]> = [
    ['fullName', 'Full name', 'name', 'text'],
    ['email', 'Email address', 'email', 'email'],
    ['phone', 'Contact number', 'tel', 'tel'],
    ['alternativePhone', 'Alternative contact number (optional)', 'tel', 'tel'],
    ['instagramHandle', 'Instagram handle (optional)', 'off', 'text'],
    ['address', 'Street address', 'street-address', 'text', true],
    ['city', 'City', 'address-level2', 'text'],
    ['province', 'Province', 'address-level1', 'text'],
    ['postalCode', 'Postal code', 'postal-code', 'text'],
    ['country', 'Country', 'country-name', 'text'],
  ];

  return <div className="min-h-screen bg-off-white px-6 pb-24 pt-32 md:px-12"><div className="mx-auto max-w-[1320px]"><p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Checkout / 01 Delivery details</p><h1 className="font-serif text-6xl md:text-7xl">Where should we send it?</h1><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><form onSubmit={submit} className="bisile-card-surface grid gap-5 p-6 sm:grid-cols-2 md:p-8">
    {fields.map(([name, label, autocomplete, type, wide]) => <label key={name} className={wide ? 'sm:col-span-2' : ''}><span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#5B3A24]/68">{label}</span><input required={!label.includes('optional')} type={type} autoComplete={autocomplete} value={form[name]} onChange={(event) => updateField(name, event.target.value)} className="field-light w-full px-4 py-4 text-xs" />{errors[name] && <span className="mt-2 block text-[11px] text-red-800">{errors[name]}</span>}</label>)}

    <section className="sm:col-span-2">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent">Choose your shipping partner</p>
          <p className="mt-2 text-xs leading-5 text-[#5B3A24]/62">Select the delivery option that suits this order.</p>
        </div>
        {errors.shippingPartner && <span className="text-[11px] text-red-800">{errors.shippingPartner}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SHIPPING_PARTNERS.map((option) => {
          const selected = form.shippingPartner === option.id;
          return (
            <label key={option.id} className={`flex items-center gap-4 border p-4 transition-colors ${selected ? 'border-[#8A6F35] bg-[#E9E6DF]' : 'border-[#B9AA8B]/46 bg-[#F7F4EF]/62 hover:border-[#A3915D]'}`}>
              <input type="radio" name="shippingPartner" value={option.id} checked={selected} onChange={(event) => updateField('shippingPartner', event.target.value)} className="h-4 w-4 shrink-0" />
              <img src={shippingLogo(option.mark, option.tone)} alt={`${option.name} logo`} className="h-12 w-20 border border-[#B9AA8B]/30 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-[#2A2114]">{option.name}</span>
                <span className="mt-1 block text-xs text-[#5B3A24]/66">R {option.price.toFixed(2)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>

    <label className="sm:col-span-2"><span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#5B3A24]/68">Delivery instructions</span><textarea rows={3} value={form.deliveryInstructions} onChange={(event) => updateField('deliveryInstructions', event.target.value)} className="field-light w-full px-4 py-4 text-xs" /></label>
    <label className="sm:col-span-2"><span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#5B3A24]/68">Order notes (optional)</span><textarea rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} className="field-light w-full px-4 py-4 text-xs" /></label>
    <div className="flex flex-col gap-4 border-t border-[#B9AA8B]/36 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><Link to="/cart" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#5B3A24]/62 hover:text-accent"><ArrowLeft size={14} /> Back to bag</Link><button className="flex items-center justify-between gap-8 bg-[#5B3A24] px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-[#F7F4EF] hover:bg-[#8A6F35]">Continue to payment <ArrowRight size={14} /></button></div></form><aside className="bisile-card-surface h-fit p-7"><p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-accent">Order summary</p>{items.map((item) => <div key={item.id} className="mb-3 flex justify-between gap-3 text-xs text-[#5B3A24]/66"><span>{item.name} x{item.quantity}</span><span>R {(item.price * item.quantity).toFixed(2)}</span></div>)}<div className="mt-5 space-y-3 border-t border-[#B9AA8B]/36 pt-5 text-xs text-[#5B3A24]/66"><div className="flex justify-between"><span>Subtotal</span><span>R {subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>{selectedShipping.name}</span><span>R {selectedShipping.price.toFixed(2)}</span></div></div><div className="mt-5 flex justify-between border-t border-[#B9AA8B]/36 pt-5"><span className="text-[10px] uppercase tracking-[0.16em] text-[#5B3A24]/62">Estimated total</span><span className="font-subhead text-2xl text-[#2A2114]">R {estimatedTotal.toFixed(2)}</span></div><p className="mt-6 flex gap-3 text-[11px] leading-5 text-[#5B3A24]/62"><ShieldCheck size={16} className="shrink-0 text-accent" /> Payment details are entered securely on Stripe Checkout after your review.</p><details className="mt-6 border-t border-[#B9AA8B]/36 pt-5 text-xs leading-6 text-[#5B3A24]/62"><summary className="cursor-pointer text-[10px] uppercase tracking-[0.16em] text-[#2A2114]">Bhelekazi Laybye Payments</summary><ul className="mt-4 space-y-2">{LAYBYE_TERMS.map((term) => <li key={term}>- {term}</li>)}</ul><p className="mt-4 font-normal text-[#2A2114]">Proof of payment is required to confirm and process your order. Without proof of payment, your order will be cancelled.</p><p className="mt-3">WhatsApp: {CONTACT_PHONE}<br />Email: {ORDER_EMAIL}</p></details></aside></div></div></div>;
};
