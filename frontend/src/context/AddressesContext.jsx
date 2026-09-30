import { createContext, useContext, useEffect, useState } from "react";

const AddressesContext = createContext(null);
const KEY = "quickbite_addresses";

const DEFAULTS = [
  {
    id: "home",
    label: "Home",
    line1: "742 Evergreen Terrace",
    line2: "",
    city: "Downtown",
    instructions: "Leave at the door",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    line1: "1200 Corporate Plaza",
    line2: "Suite 400",
    city: "Midtown",
    instructions: "Front desk, ask for Alex",
    isDefault: false,
  },
];

export function AddressesProvider({ children }) {
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(addresses));
  }, [addresses]);

  function addAddress(address) {
    const id = crypto.randomUUID();
    setAddresses((prev) => [...prev, { ...address, id, isDefault: prev.length === 0 }]);
    return id;
  }

  function updateAddress(id, patch) {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function deleteAddress(id) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function setDefaultAddress(id) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  return (
    <AddressesContext.Provider
      value={{ addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }}
    >
      {children}
    </AddressesContext.Provider>
  );
}

export function useAddresses() {
  return useContext(AddressesContext);
}
