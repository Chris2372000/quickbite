import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function FoodItemModal({ item, restaurant, onClose }) {
  const { addToCart } = useCart();
  const [size, setSize] = useState(item.sizes?.[0]?.name || null);
  const [extras, setExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  function toggleExtra(extra) {
    setExtras((prev) =>
      prev.some((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra]
    );
  }

  const sizeDelta = item.sizes?.find((s) => s.name === size)?.priceDelta || 0;
  const extrasDelta = extras.reduce((s, e) => s + e.priceDelta, 0);
  const unitPrice = item.price + sizeDelta + extrasDelta;
  const total = unitPrice * quantity;

  function handleAdd() {
    const selectedModifiers = [
      ...(size && sizeDelta ? [{ groupName: "Size", optionName: size, priceDelta: sizeDelta }] : []),
      ...extras.map((e) => ({ groupName: "Extras", optionName: e.name, priceDelta: e.priceDelta })),
    ];
    addToCart({
      menuItem: `${restaurant.id}:${item.id}`,
      name: item.name,
      unitPrice: item.price,
      quantity,
      selectedModifiers,
      notes,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <button className="food-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="food-modal-img" style={{ backgroundImage: `url(${item.image})` }} />
        <div className="food-modal-body">
          <h2>{item.name}</h2>
          <p className="food-modal-desc">{item.description}</p>
          <p className="food-modal-price">${item.price.toFixed(2)}</p>

          {item.sizes && (
            <div className="food-modal-group">
              <b>Size</b>
              {item.sizes.map((s) => (
                <label key={s.name} className="food-modal-option">
                  <input
                    type="radio"
                    name="size"
                    checked={size === s.name}
                    onChange={() => setSize(s.name)}
                  />
                  <span>{s.name}</span>
                  {s.priceDelta > 0 && <em>+${s.priceDelta.toFixed(2)}</em>}
                </label>
              ))}
            </div>
          )}

          {item.extras && (
            <div className="food-modal-group">
              <b>Extras</b>
              {item.extras.map((ex) => (
                <label key={ex.name} className="food-modal-option">
                  <input
                    type="checkbox"
                    checked={extras.some((e) => e.name === ex.name)}
                    onChange={() => toggleExtra(ex)}
                  />
                  <span>{ex.name}</span>
                  <em>+${ex.priceDelta.toFixed(2)}</em>
                </label>
              ))}
            </div>
          )}

          <div className="food-modal-group">
            <b>Special instructions</b>
            <input
              placeholder="e.g. no onions, sauce on the side"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="food-modal-footer">
            <div className="qb-stepper">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <button className="primary-btn full" onClick={handleAdd}>
              Add {quantity} to cart · ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
