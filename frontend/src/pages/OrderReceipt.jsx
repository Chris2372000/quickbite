import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import DishThumb from "../components/DishThumb";
import Footer from "../components/Footer";
import {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_SUBTEXT,
  etaDate,
  fmtDateTime,
  fmtTime,
  itemCount,
  lineTotal,
  money,
  orderCode,
  paymentLabel,
  timeOfStatus,
  useRestaurant,
} from "../data/orderMeta";

export default function OrderReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const restaurant = useRestaurant();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError("Could not load this order."));
  }, [id]);

  if (error) return <p className="qb-empty-inline error">{error}</p>;
  if (!order) return <p className="qb-empty-inline">Loading…</p>;

  const code = orderCode(order._id);
  const active = ACTIVE_STATUSES.includes(order.status);
  const cancelled = order.status === "cancelled";
  const delivered = order.status === "delivered";
  const eta = etaDate(order);
  const addr = order.deliveryAddress || {};
  const history = (order.statusHistory || []).filter((h) => STATUS_ORDER.includes(h.status));
  const txn = `TXN-${order._id.slice(-4).toUpperCase()}-${order._id.slice(-8, -4).toUpperCase()}`;

  function reorderAll() {
    order.items.forEach((i) =>
      addToCart({
        menuItem: i.menuItem,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        selectedModifiers: i.selectedModifiers,
        notes: i.notes,
      })
    );
    navigate("/cart");
  }

  return (
    <>
      <div className="qb-rcpt">
        <div className="qb-rcpt-top">
          <Link to="/orders">← Back to Order History</Link>
          <div>
            <span className="qb-pill">🧾 Order #{code}</span>
            <span className="muted-line"> • Placed on {fmtDateTime(order.createdAt)}</span>
          </div>
        </div>

        <section className="qb-ord-card qb-rcpt-hero">
          <div>
            <span className={`qb-pill ${cancelled ? "red" : "green"}`}>● {STATUS_LABELS[order.status]}</span>
            <h1>
              {delivered
                ? `Delivered ${timeOfStatus(order, "delivered") ? fmtTime(timeOfStatus(order, "delivered")) : ""}`
                : cancelled
                ? "Order cancelled"
                : `Estimated ${fmtTime(eta)}`}
            </h1>
            <p className="muted-line">{STATUS_SUBTEXT[order.status] || ""}</p>
          </div>
          <div className="qb-rcpt-actions">
            {active && <Link to={`/orders/${order._id}`} className="primary-btn">➤ Track Live Order</Link>}
            <button className="qb-secondary-btn" onClick={() => window.print()}>⇩ Receipt (PDF)</button>
            {!active && <button className="qb-secondary-btn" onClick={reorderAll}>↻ Reorder All</button>}
          </div>
        </section>

        <div className="qb-rcpt-grid">
          <div>
            <section className="qb-ord-card qb-rcpt-rest">
              <span className="qb-rest-line-icon">🍴</span>
              <div>
                <b>{restaurant.name}</b>
                <small>▣ {restaurant.address || "Your neighbourhood kitchen"}</small>
              </div>
              {restaurant.phone && <a className="qb-secondary-btn" href={`tel:${restaurant.phone}`}>📞 Call Store</a>}
            </section>

            <section className="qb-ord-card">
              <div className="qb-ord-card-head">
                <h2>🍴 Itemized Items ({order.items.length} {order.items.length === 1 ? "Dish" : "Dishes"}, {itemCount(order)} Items)</h2>
                <small className="qb-label">KITCHEN VERIFIED</small>
              </div>
              {order.items.map((item, i) => (
                <div key={i} className="qb-rcpt-item">
                  <DishThumb name={item.name} size={72} radius={10} />
                  <div>
                    <div className="qb-rcpt-item-head">
                      <b>{item.name}</b>
                      <strong>{money(lineTotal(item))}</strong>
                    </div>
                    <span className="qb-pill red">Qty: {item.quantity}{item.quantity > 1 ? ` × ${money(item.unitPrice)}` : ""}</span>
                    <ul>
                      {(item.selectedModifiers || []).map((m, k) => (
                        <li key={k}>
                          {m.groupName}: {m.optionName}
                          {m.priceDelta > 0 && ` (+${money(m.priceDelta)})`}
                        </li>
                      ))}
                    </ul>
                    {item.notes && <span className="qb-note">💬 Special Note: "{item.notes}"</span>}
                  </div>
                </div>
              ))}
            </section>

            <section className="qb-ord-card">
              <div className="qb-ord-card-head"><h2>📍 Drop-off &amp; Location Instructions</h2></div>
              <div className="qb-drop">
                <div>
                  <small className="qb-label">DELIVERY ADDRESS</small>
                  <b>{user?.name || "Customer"}</b>
                  <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />{addr.city}</p>
                  <span className="green">✔ Verified Residential Address</span>
                </div>
                <div>
                  <small className="qb-label">DROP-OFF PREFERENCE</small>
                  <b>{order.instructions ? "Custom instructions" : "Standard delivery"}</b>
                  <p className="italic">{order.instructions ? `"${order.instructions}"` : "No special instructions were added."}</p>
                </div>
              </div>
            </section>
          </div>

          <div>
            <section className="qb-ord-card">
              <div className="qb-ord-card-head">
                <h2>💵 Payment Ledger</h2>
                <span className={`qb-pill ${order.paymentStatus === "paid" ? "green" : "amber"}`}>
                  {order.paymentStatus === "paid" ? "PAID IN FULL" : "PAYMENT DUE"}
                </span>
              </div>
              <div className="qb-ledger">
                <div><span>Items Subtotal</span><span>{money(order.subtotal)}</span></div>
                <div><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</span></div>
                <div><span>Estimated Sales Tax</span><span>{money(order.tax)}</span></div>
              </div>
              <div className="qb-ledger-total">
                <div>
                  <small className="qb-label">TOTAL AMOUNT {order.paymentStatus === "paid" ? "PAID" : "DUE"}</small>
                  <strong>{money(order.total)}</strong>
                </div>
                <span className="qb-pill green">▣ Instant Receipt</span>
              </div>
              <dl className="qb-ledger-meta">
                <div><dt>Payment Method</dt><dd>{paymentLabel(order)}</dd></div>
                <div><dt>Transaction ID</dt><dd className="mono">{txn}</dd></div>
                <div><dt>Invoice Auth Code</dt><dd className="mono">#{orderCode(order._id).replace("QB-", "AUTH-")}</dd></div>
              </dl>
              <div className="qb-guarantee slim">
                🛡 <span><b>QuickBite Fresh &amp; On-Time Guarantee:</b> If your meal arrives more than 15 minutes past the target window or doesn't meet quality standards, you receive an immediate refund or credit.</span>
              </div>
            </section>

            <section className="qb-ord-card">
              <div className="qb-ord-card-head">
                <h2>🕒 Order Timeline Log</h2>
                {active && <small className="green">((•)) Live Sync</small>}
              </div>
              <div className="qb-vtimeline">
                {history.map((h, i) => {
                  const last = i === history.length - 1 && active;
                  return (
                    <div key={i} className={`qb-vt ${last ? "active" : "done"}`}>
                      <span className="qb-vt-dot">{last ? "➤" : "✓"}</span>
                      <div>
                        <b>{STATUS_LABELS[h.status]}</b>
                        <small>{STATUS_SUBTEXT[h.status]}</small>
                      </div>
                      <em>{last ? "Active Now" : fmtTime(h.at)}</em>
                    </div>
                  );
                })}
                {cancelled && (
                  <div className="qb-vt todo"><span className="qb-vt-dot">✕</span><div><b>Cancelled</b></div></div>
                )}
              </div>
            </section>

            <section className="qb-ord-card qb-help">
              <span className="qb-rest-line-icon">?</span>
              <div>
                <b>Need Help with this Order?</b>
                <p>Missing condiments, item temperatures, or courier delays? QuickBite resolves 94% of inquiries within 2 minutes.</p>
              </div>
              <div className="qb-help-btns">
                <button className="qb-secondary-btn">⚑ Report Issue</button>
                <button className="qb-dark-btn">🎧 Instant Chat</button>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
