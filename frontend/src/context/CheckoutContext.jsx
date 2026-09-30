import { createContext, useContext, useState } from "react";

// Ephemeral state carried between the checkout steps (address -> payment -> review).
// Not persisted — a fresh checkout starts clean.
const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const [addressId, setAddressId] = useState(null);
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [promoCode, setPromoCode] = useState("");

  return (
    <CheckoutContext.Provider
      value={{
        addressId,
        setAddressId,
        paymentMethodId,
        setPaymentMethodId,
        instructions,
        setInstructions,
        promoCode,
        setPromoCode,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  return useContext(CheckoutContext);
}
