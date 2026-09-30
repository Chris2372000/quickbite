import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();

  if (!cartItems.length) {
    return (
      <div className="qb-empty" style={{ maxWidth: 480, margin: "60px auto" }}>
        <span>🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add something delicious to get started.</p>
        <Link to="/restaurants" className="primary-btn" style={{ display: "inline-block", marginTop: 14 }}>
          Browse restaurants
        </Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 25 ? 0 : 2.99;
  const serviceFee = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + deliveryFee + serviceFee).toFixed(2);

  return (
    <div className="qb-cart-page">
      <h1>Your Cart</h1>

      <div className="qb-cart-list">
        {cartItems.map((item) => {
          const modifiersTotal = (item.selectedModifiers || []).reduce(
            (s, m) => s + (m.priceDelta || 0),
            0
          );
          const lineTotal = (item.unitPrice + modifiersTotal) * item.quantity;

          return (
            <div key={item.cartId} className="qb-cart-item">
              <div className="qb-cart-item-thumb">🍽️</div>
              <div className="qb-cart-item-body">
                <p className="qb-cart-item-name">{item.name}</p>
                {item.selectedModifiers?.map((m) => (
                  <p key={m.optionName} className="muted-line">
                    {m.optionName} {m.priceDelta > 0 && `(+$${m.priceDelta.toFixed(2)})`}
                  </p>
                ))}
                {item.notes && <p className="muted-line italic">Note: {item.notes}</p>}
                <div className="qb-stepper" style={{ marginTop: 8 }}>
                  <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="qb-cart-item-right">
                <p className="qb-cart-item-price">${lineTotal.toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.cartId)} className="qb-cart-remove">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="qb-totals">
        <div>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div>
          <span>Delivery fee</span>
          <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
        </div>
        <div>
          <span>Service fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="qb-totals-final">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      {subtotal < 25 && (
        <p className="muted-line">Add ${(25 - subtotal).toFixed(2)} more for free delivery.</p>
      )}

      <Link to="/checkout/address" className="primary-btn full" style={{ display: "block", textAlign: "center", marginTop: 18 }}>
        Proceed to Checkout
      </Link>
    </div>
  );
}
