import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Product } from "@/data/shopData";

export interface CartItem { product: Product; qty: number }

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addItem: (product: Product) => void;
  updateQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  // legacy (kept for existing callers — Shop's bag badge etc.)
  setCartCount: (n: number) => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  cartCount: 0,
  cartTotal: 0,
  addItem: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  setCartCount: () => {},
});

const ITEMS_KEY = "belly-cart-items";
const COUNT_KEY = "belly-cart-count";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(ITEMS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  useEffect(() => {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
      localStorage.setItem(COUNT_KEY, String(cartCount));
    } catch {}
  }, [items, cartCount]);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.product.id !== id));
  };

  const clearCart = () => setItems([]);

  // Legacy API: only zeroing the cart is meaningful now; treat as clearCart.
  const setCartCount = (n: number) => {
    if (n === 0) clearCart();
  };

  const value = useMemo(
    () => ({ items, cartCount, cartTotal, addItem, updateQty, removeItem, clearCart, setCartCount }),
    [items, cartCount, cartTotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
