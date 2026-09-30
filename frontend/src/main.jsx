import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AddressesProvider } from "./context/AddressesContext";
import { PaymentMethodsProvider } from "./context/PaymentMethodsContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import "./index.css";
import "./styles/orders.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <AddressesProvider>
            <PaymentMethodsProvider>
              <CartProvider>
                <CheckoutProvider>
                  <App />
                </CheckoutProvider>
              </CartProvider>
            </PaymentMethodsProvider>
          </AddressesProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
