import { createContext, useContext, useEffect, useState } from "react";

const PaymentMethodsContext = createContext(null);
const KEY = "quickbite_payment_methods";

const DEFAULTS = [
  { id: "card-visa", type: "card", brand: "Visa", last4: "4242", expiry: "09/28", isDefault: true },
  { id: "cash", type: "cash", brand: "Cash on delivery", last4: "", expiry: "", isDefault: false },
];

export function PaymentMethodsProvider({ children }) {
  const [methods, setMethods] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(methods));
  }, [methods]);

  function addMethod(method) {
    const id = crypto.randomUUID();
    setMethods((prev) => [...prev, { ...method, id, isDefault: prev.length === 0 }]);
    return id;
  }

  function deleteMethod(id) {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  function setDefaultMethod(id) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }

  return (
    <PaymentMethodsContext.Provider value={{ methods, addMethod, deleteMethod, setDefaultMethod }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  return useContext(PaymentMethodsContext);
}
