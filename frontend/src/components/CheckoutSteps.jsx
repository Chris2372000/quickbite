const STEPS = [
  { key: "address", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
  { key: "complete", label: "Complete" },
];

// `current="complete"` shows all four steps; the checkout pages keep the 3-step view.
export default function CheckoutSteps({ current }) {
  const steps = current === "complete" ? STEPS : STEPS.slice(0, 3);
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <div className="qb-checkout-steps">
      {steps.map((s, i) => (
        <div key={s.key} className={`qb-checkout-step${i <= currentIndex ? " on" : ""}`}>
          <span>{i + 1}</span>
          {s.label}
          {i < steps.length - 1 && <i />}
        </div>
      ))}
    </div>
  );
}
