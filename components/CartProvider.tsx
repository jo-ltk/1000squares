'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type CartContextValue = {
  cartIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = '1000squares:cart-template-ids';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((id): id is string => typeof id === 'string')) {
          setCartIds([...new Set(parsed)]);
        }
      }
    } catch {
      // Keep the in-memory cart if browser storage is unavailable or malformed.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartIds));
    } catch {
      // Cart actions remain available for this session if storage is disabled.
    }
  }, [cartIds, storageReady]);

  const addToCart = (id: string) => setCartIds((current) => current.includes(id) ? current : [...current, id]);
  const removeFromCart = (id: string) => setCartIds((current) => current.filter((item) => item !== id));
  const clearCart = () => setCartIds([]);

  return <CartContext.Provider value={{ cartIds, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
