import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../CartContext';

export const Cart: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!items.length) return;
    navigate('/checkout');
  };

  if (!items.length) {
    return (
      <div className="pt-32 pb-24 bg-secondary min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-serif text-2xl mb-4">Your bag is empty.</p>
          <p className="font-sans text-xs tracking-widest text-gray-500 uppercase mb-8">
            Start with our best-selling fragrances.
          </p>
          <Link
            to="/shop"
            className="inline-block px-10 py-3 border border-primary text-xs tracking-[0.25em] uppercase hover:border-accent hover:text-accent transition-colors"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-secondary min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 md:px-10 py-6 flex justify-between items-center">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">Your Bag</h1>
              <p className="font-sans text-xs tracking-widest text-gray-500 uppercase mt-2">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="px-6 md:px-10 py-6 flex gap-4 md:gap-6">
                <div className="w-24 h-32 bg-secondary overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-lg md:text-xl">{item.name}</h2>
                    <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                      {item.subtitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-4 inline-flex items-center text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-accent transition-colors"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8">
                    <div className="flex items-center border border-gray-300 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-accent"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 font-sans text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-accent"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm text-gray-500">R {item.price.toFixed(2)}</p>
                      <p className="font-sans text-xs text-gray-900 mt-1">
                        R {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <aside className="bg-white border border-gray-200 shadow-sm px-6 md:px-8 py-6 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-2xl mb-4">Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-sans text-gray-600">
                <span>Subtotal</span>
                <span>R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-sans text-gray-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-gray-500">
                Total (incl. VAT)
              </span>
              <span className="font-sans text-lg font-medium">
                R {subtotal.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full py-4 text-xs uppercase tracking-[0.25em] bg-primary text-white hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!items.length}
          >
            Proceed to Checkout
          </button>
          <Link
            to="/shop"
            className="mt-4 text-xs uppercase tracking-[0.2em] text-gray-500 text-center hover:text-accent"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

