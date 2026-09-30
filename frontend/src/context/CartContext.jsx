import { createContext, useContext, useEffect, useState } from "react";
import { canonicalMenuId } from "../utils/orderItems";

const CartContext = createContext(null);
const STORAGE_KEY = "quickbite_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved).map((i) => ({ ...i, menuItem: canonicalMenuId(i.menuItem) }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Adds a fully-configured line item (menuItem + chosen modifiers + quantity)
  function addToCart(lineItem) {
    setCartItems((prev) => [...prev, { ...lineItem, menuItem: canonicalMenuId(lineItem.menuItem), cartId: crypto.randomUUID() }]);
  }

  function removeFromCart(cartId) {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }

  function updateQuantity(cartId, quantity) {
    setCartItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const modifiersTotal = (item.selectedModifiers || []).reduce(
      (s, m) => s + (m.priceDelta || 0),
      0
    );
    return sum + (item.unitPrice + modifiersTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
