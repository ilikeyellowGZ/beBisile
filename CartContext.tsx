import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from './types';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'bisile-cart-v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage (cart only, never sensitive data)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item && typeof item.id === 'string'));
        }
      }
    } catch {
      // fail silently – cart isn't critical
    }
  }, []);

  // Persist cart back to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = (product: Product, quantity: number = 1) => {
    if (quantity <= 0) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
            : item
        );
      }
      return [
        ...current,
        {
          ...product,
          quantity: Math.min(quantity, 99),
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, 99)) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const { totalItems, subtotal } = useMemo(() => {
    const totals = items.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.subtotal += item.price * item.quantity;
        return acc;
      },
      { totalItems: 0, subtotal: 0 }
    );
    return totals;
  }, [items]);

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};

