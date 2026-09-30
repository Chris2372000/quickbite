import { useEffect, useState } from "react";
import client from "../api/client";
import { useCart } from "../context/CartContext";

function MenuItemCard({ item }) {
  const { addToCart } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [selections, setSelections] = useState({}); // groupName -> [{name, priceDelta}]
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  function toggleOption(group, option) {
    setSelections((prev) => {
      const current = prev[group.name] || [];
      const exists = current.find((o) => o.name === option.name);

      let updated;
      if (group.multiple) {
        updated = exists
          ? current.filter((o) => o.name !== option.name)
          : [...current, option];
      } else {
        updated = exists ? [] : [option];
      }
      return { ...prev, [group.name]: updated };
    });
  }

  function handleAdd() {
    const selectedModifiers = Object.entries(selections).flatMap(([groupName, options]) =>
      options.map((o) => ({ groupName, optionName: o.name, priceDelta: o.priceDelta }))
    );

    addToCart({
      menuItem: item._id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      selectedModifiers,
      notes,
    });

    setExpanded(false);
    setSelections({});
    setQuantity(1);
    setNotes("");
  }

  const hasRequiredUnmet = (item.modifierGroups || []).some(
    (g) => g.required && !(selections[g.name] || []).length
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-on-surface">{item.name}</h3>
          <p className="text-sm text-on-surface-variant mt-1">{item.description}</p>
          <p className="text-primary font-semibold mt-2">${item.price.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="bg-primary text-on-primary rounded-full w-9 h-9 font-bold shrink-0"
        >
          {expanded ? "×" : "+"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-surface-container-highest pt-4">
          {(item.modifierGroups || []).map((group) => (
            <div key={group.name} className="mb-3">
              <p className="text-sm font-semibold text-on-surface">
                {group.name} {group.required && <span className="text-error">*</span>}
              </p>
              {group.options.map((option) => {
                const isSelected = (selections[group.name] || []).some(
                  (o) => o.name === option.name
                );
                return (
                  <label key={option.name} className="flex items-center gap-2 text-sm mt-1">
                    <input
                      type={group.multiple ? "checkbox" : "radio"}
                      checked={isSelected}
                      onChange={() => toggleOption(group, option)}
                    />
                    {option.name}
                    {option.priceDelta > 0 && ` (+$${option.priceDelta.toFixed(2)})`}
                  </label>
                );
              })}
            </div>
          ))}

          <label className="block text-sm font-semibold text-on-surface mt-2">
            Notes (optional)
          </label>
          <input
            className="w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. no onions"
          />

          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-surface-container-high"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-surface-container-high"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={hasRequiredUnmet}
              className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/menu")
      .then((res) => setItems(res.data.items))
      .catch(() => setError("Could not load the menu. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Menu</h1>

      {loading && <p className="text-on-surface-variant">Loading menu…</p>}
      {error && <p className="text-error">{error}</p>}

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-3">{category}</h2>
          <div className="grid gap-4">
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
