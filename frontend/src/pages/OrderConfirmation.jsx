import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";
import CheckoutSteps from "../components/CheckoutSteps";
import DishThumb from "../components/DishThumb";
import Footer from "../components/Footer";
import {
  KITCHEN_STAGES,
  etaDate,
  fmtTime,
  lineTotal,
  money,
  orderCode,
  paymentLabel,
  stageIndex,
  useNow,
  useRestaurant,
} from "../data/orderMeta";

const MODIFY_WINDOW_SEC = 120;
const STAGE_ICONS = ["", "♨", "🛵", "⌂"];

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();
  const restaurant = useRestaurant();
  const now = useNow(1000);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError("We couldn't load this order."));

    socket.emit("order:watch", id);
    function onStatus(p) {
      if (p.orderId === id) setOrder((o) => (o ? { ...o, status: p.status } : o));
    }
    socket.on("order:status", onStatus);
    return () => socket.off("order:status", onStatus);
  }, [id]);

  if (error) return <p className="qb-empty-inline error">{error}</p>;
  if (!order) return <p className="qb-empty-inline">Loading your order…</p>;

  const firstName = (user?.name || "there").split(" ")[0];
  const placedAt = new Date(order.createdAt);
  const eta = etaDate(order);
  const stage = stageIndex(order.status);
  const cancelled = order.status === "cancelled";
  const secondsLeft = Math.max(0, MODIFY_WINDOW_SEC - Math.floor((now - placedAt.getTime()) / 1000));
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const addr = order.deliveryAddress || {};
  const itemTotal = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      <div className="qb-conf">
        <div className="qb-conf-steps">
          <CheckoutSteps current="complete" />
        </div>

        <section className="qb-conf-hero">
          <div className="qb-conf-check">✓</div>
          <span className="qb-conf-badge">● Payment Verified &amp; Sent to Kitchen</span>
          <h1>Order Placed Successfully!</h1>
          <p>
            Thank you, {firstName}! <b>{restaurant.name}</b> has received your order and the kitchen will
            start prep shortly.
          </p>
          {secondsLeft > 0 && !cancelled && (
            <div className="qb-conf-modify">
              ⏱ Need to modify? You have <span className="qb-conf-timer">{mm}:{ss}</span> left to edit or
              cancel.
              <Link to={`/orders/${id}`}>Modify Now</Link>
            </div>
          )}
        </section>

        <section className="qb-ord-card qb-conf-status">
          <div className="qb-ord-card-head">
            <h2>
              Live Kitchen Status{" "}
              <span className="qb-pill amber">
                Step {Math.max(stage, 0) + 1} of {KITCHEN_STAGES.length}
              </span>
            </h2>
            <span className="qb-conf-auto">⟳ Auto-updating</span>
          </div>
          {cancelled ? (
            <div className="qb-payment-error" style={{ margin: 0 }}>
              <p>This order was cancelled.</p>
            </div>
          ) : (
            <div className="qb-stage-row">
              {KITCHEN_STAGES.map((s, i) => {
                const state = i < stage || stage === 3 ? "done" : i === stage ? "active" : "todo";
                return (
                  <div key={s.label} className={`qb-stage ${state}`}>
                    <div className="qb-stage-dot">{state === "done" ? "✓" : STAGE_ICONS[i] || i + 1}</div>
                    <b>{s.label}</b>
                    <small>
                      {i === 0 ? `Placed ${fmtTime(placedAt)}` : i === 3 ? `By ~${fmtTime(eta)}` : s.sub}
                    </small>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="qb-conf-facts">
          <div className="qb-fact">
            <small>ORDER ID</small>
            <strong className="mono">#{orderCode(id)}</strong>
            <span>Saved to your profile</span>
          </div>
          <div className="qb-fact">
            <small>ESTIMATED ARRIVAL</small>
            <strong>25 – 30 mins</strong>
            <span className="green">Arriving by ~{fmtTime(eta)}</span>
          </div>
          <div className="qb-fact">
            <small>PAYMENT METHOD</small>
            <strong>{order.paymentMethod === "cash" ? "Cash on delivery" : "Card"}</strong>
            <span className="mono">
              {money(order.total)} {order.paymentStatus === "paid" ? "Paid" : "Due"}
            </span>
          </div>
          <div className="qb-fact">
            <small>DELIVERY TO</small>
            <strong>{addr.line1 || "Your address"}</strong>
            <span>{[addr.line2, addr.city].filter(Boolean).join(", ") || "—"}</span>
          </div>
        </section>

        <div className="qb-conf-grid">
          <div className="qb-conf-left">
            <section className="qb-ord-card">
              <div className="qb-ord-card-head">
                <h3>
                  <span className="qb-live-dot" /> Live Transit Overview
                </h3>
                <span className="muted-line">Courier assigning…</span>
              </div>
              <div className="qb-transit-box">
                <div className="qb-transit-card">
                  <span className="qb-transit-icon">🛵</span>
                  <b>Route Optimization</b>
                  <p>Direct hot-bag dispatch from {restaurant.name} to your doorstep.</p>
                </div>
              </div>
            </section>

            <section className="qb-ord-card qb-conf-actions">
              <Link to={`/orders/${id}`} className="primary-btn qb-big-btn">
                ● Track Order in Real-Time →
              </Link>
              <Link to="/" className="qb-secondary-btn qb-big-btn">
                ⌂ Return Home
              </Link>
            </section>
            <div className="qb-conf-links">
              <Link to={`/orders/${id}/receipt`}>⇩ Download Receipt</Link>
              <a>☎ Contact {restaurant.name} Support</a>
            </div>
          </div>

          <aside className="qb-ord-card qb-conf-summary">
            <div className="qb-ord-card-head">
              <h2>Order Summary</h2>
              <span className="qb-pill">{itemTotal} Items</span>
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="qb-sum-item">
                <DishThumb name={item.name} size={56} />
                <div>
                  <b>{item.name}</b>
                  <small>
                    Qty: {item.quantity}
                    {(item.selectedModifiers || []).length > 0 &&
                      ` • ${item.selectedModifiers.map((m) => m.optionName).join(", ")}`}
                  </small>
                </div>
                <strong>{money(lineTotal(item))}</strong>
              </div>
            ))}
            <div className="qb-sum-totals">
              <div>
                <span>Subtotal</span>
                <span className="mono">{money(order.subtotal)}</span>
              </div>
              <div>
                <span>Estimated Taxes &amp; Fees</span>
                <span className="mono">{money(order.tax)}</span>
              </div>
              <div>
                <span>Delivery</span>
                <span className={`mono${order.deliveryFee === 0 ? " green" : ""}`}>
                  {order.deliveryFee === 0 ? "FREE" : money(order.deliveryFee)}
                </span>
              </div>
            </div>
            <div className="qb-sum-total">
              <div>
                <b>TOTAL {order.paymentStatus === "paid" ? "PAID" : "DUE"}</b>
                <small>{paymentLabel(order)}</small>
              </div>
              <span className="mono">{money(order.total)}</span>
            </div>
          </aside>
        </div>

        <section className="qb-guarantee">
          <span>✔</span>
          <div>
            <b>QuickBite Fresh &amp; On-Time Guarantee</b>
            <p>Arrives steaming hot or your next delivery meal is entirely on us.</p>
          </div>
          <a>Read policy ↗</a>
        </section>

        <div className="qb-trust-row">
          <span>🛡 PCI-DSS Level 1 Encrypted</span>
          <span>👍 100% Taste &amp; On-Time Guarantee</span>
          <span>🛵 No-Contact Sanitary Delivery</span>
        </div>
      </div>
      <Footer />
    </>
  );
}
