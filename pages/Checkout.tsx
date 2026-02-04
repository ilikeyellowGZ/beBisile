import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  notes: string;
}

export const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof CheckoutFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      nextErrors.email = 'Please enter a valid email.';
    }
    if (!form.phone.trim()) nextErrors.phone = 'Please enter a contact number.';
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'Address is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';
    if (!form.postalCode.match(/^\d{4}$/)) {
      nextErrors.postalCode = 'Postal code should be 4 digits.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    if (!validate()) return;

    // Simulate secure order creation on the server:
    // In production, this POST should go to a backend or payment gateway;
    // we intentionally avoid collecting card details in the browser here.
    setIsSubmitting(true);
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      navigate('/', { state: { checkoutSuccess: true } });
    }, 1200);
  };

  if (!items.length) {
    return (
      <div className="pt-32 pb-24 bg-secondary min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-serif text-2xl mb-4">Your bag is empty.</p>
          <Link
            to="/shop"
            className="inline-block px-10 py-3 border border-primary text-xs tracking-[0.25em] uppercase hover:border-accent hover:text-accent transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-secondary min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <section className="lg:col-span-2 bg-white border border-gray-200 shadow-sm px-6 md:px-10 py-8">
          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl mb-2">Checkout</h1>
            <p className="font-sans text-xs tracking-widest text-gray-500 uppercase">
              Secure delivery details — no card details collected on-site.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Delivery Address
              </label>
              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans mb-3 focus:outline-none focus:border-accent"
                placeholder="Street address"
                autoComplete="address-line1"
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>
              )}
              <input
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                placeholder="Apartment, suite, etc. (optional)"
                autoComplete="address-line2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent"
                  autoComplete="postal-code"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Order Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent resize-none"
                placeholder="Delivery instructions, gift message, etc."
              />
            </div>

            <p className="font-sans text-[11px] text-gray-500 leading-relaxed">
              By placing your order you agree to our{" "}
              <span className="underline">Terms</span> and{" "}
              <span className="underline">Privacy Policy</span>. Payment is processed
              securely via your chosen provider — we never store card details in this
              application.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link
                to="/cart"
                className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-accent"
              >
                Back to Bag
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3 bg-primary text-white text-xs uppercase tracking-[0.25em] hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          </form>
        </section>

        {/* Summary */}
        <aside className="bg-white border border-gray-200 shadow-sm px-6 md:px-8 py-6">
          <h2 className="font-serif text-2xl mb-4">Order Summary</h2>
          <ul className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm font-sans text-gray-700">
                <div>
                  <p>{item.name}</p>
                  <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                </div>
                <p>R {(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm font-sans text-gray-600">
              <span>Subtotal</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-sans text-gray-500">
              <span>Shipping</span>
              <span>Calculated based on address</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 pt-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-gray-500">
              Estimated Total
            </span>
            <span className="font-sans text-lg font-medium">
              R {subtotal.toFixed(2)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

