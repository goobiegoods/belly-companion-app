import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CartContextValue {
  cartCount: number;
  setCartCount: (n: number) => void;
}

const CartContext = createContext<CartContextValue>({ cartCount: 0, setCartCount: () => {} });

const KEY = "belly-cart-count";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCountState] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const v = parseInt(localStorage.getItem(KEY) || "0", 10);
    return isNaN(v) ? 0 : v;
  });

  const setCartCount = (n: number) => {
    setCartCountState(n);
    try { localStorage.setItem(KEY, String(n)); } catch {}
  };

  useEffect(() => {
    try { localStorage.setItem(KEY, String(cartCount)); } catch {}
  }, [cartCount]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
