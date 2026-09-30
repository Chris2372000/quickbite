import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import socket from "../api/socket";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import TrackingMap from "../components/TrackingMap";
import DishThumb from "../components/DishThumb";
import Footer from "../components/Footer";
import {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_SUBTEXT,
  etaDate,
  fmtTime,
  itemCount,
  money,
  orderCode,
  timeOfStatus,
  useNow,
  useRestaurant,
} from "../data/orderMeta";

const TIPS = [3, 5, 7];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const restaurant = useRestaurant();
  const now = useNow(15000);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [tip, setTip] = useState(5);

  useEffect(() => {
    client
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError("Could not load this order."));

    socket.emit("order:watch", id);
    function onStatus(p) {
      if (p.orderId === id) {
        setOrder((o) =>
          o
            ? {
                ...o,
                status: p.status,
                statusHistory: [...(o.statusHistory || []), { status: p.status, at: new Date().toISOString() }],
              }
            : o
        );
      }
    }
    socket.on("order:status", onStatus);
    return () => socket.off("order:status", onStatus);
  }, [id]);

  if (error) return <p className="qb-empty-inline error">{error}</p>;
  if (!order) return <p className="qb-empty-inline">Loading…</p>;

  const code = orderCode(order._id);
  const cancelled = order.status === "cancelled";
  const active = ACTIVE_STATUSES.includes(order.status);
  const delivered = order.status === "delivered";
  const cur = STATUS_ORDER.indexOf(order.status);
  const eta = etaDate(order);
  const minsLeft = Math.max(0, Math.ceil((eta.getTime() - now) / 60000));
  const progressPct = cancelled ? 0 : Math.round((Math.max(cur, 0) / (STATUS_ORDER.length - 1)) * 100);
  const pickedUp = cur >= STATUS_ORDER.indexOf("out_for_delivery");
  const mapProgress = delivered ? 1 : pickedUp ? 0.55 : 0.02;
  const addr = order.deliveryAddress || {};
  const ringDeg = Math.min(360, Math.round((1 - Math.min(minsLeft, 30) / 30) * 360));

  function handleReorder() {
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
      <div className="qb-track">
        <div className="qb-track-top">
          <nav className="qb-crumbs">
            <Link to="/orders">← Orders</Link> <i>/</i> <span>Order #{code}</span> <i>/</i> <b>Live Tracking</b>
          </nav>
          {active && (
            <div className="qb-track-badges">
              <span className="qb-pill green">● LIVE GPS ACTIVE</span>
              <span className="qb-pill">✦ High Precision (~2m)</span>
            </div>
          )}
        </div>

        <div className="qb-track-grid">
          <div className="qb-track-left">
            {cancelled ? (
              <div className="qb-ord-card qb-track-state">
                <h2>This order was cancelled</h2>
                <p>If you were charged, the refund will return to your original payment method.</p>
                <button className="primary-btn" onClick={handleReorder}>Order again</button>
              </div>
            ) : delivered ? (
              <div className="qb-ord-card qb-track-state">
                <span className="qb-conf-check small">✓</span>
                <h2>Delivered</h2>
                <p>
                  Your order arrived
                  {timeOfStatus(order, "delivered") ? ` at ${fmtTime(timeOfStatus(order, "delivered"))}` : ""}. Enjoy your meal!
                </p>
                <div className="qb-row-actions">
                  <button className="primary-btn" onClick={handleReorder}>Reorder</button>
                  <Link to={`/orders/${id}/receipt`} className="qb-secondary-btn">View receipt</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="qb-map">
                  <TrackingMap
                    progress={mapProgress}
                    pickedUp={pickedUp}
                    restaurantName={restaurant.name}
                    customerName={user?.name?.split(" ")[0] || "You"}
                  />
                  <div className="qb-map-banner">
                    <span className="qb-map-banner-icon">🛵</span>
                    <div>
                      <b>
                        {pickedUp ? "Courier on the way" : STATUS_LABELS[order.status]}{" "}
                        <span className="qb-pill amber">Priority Delivery</span>
                      </b>
                      <p>{pickedUp ? "Your courier is heading to you with a thermal insulated bag." : STATUS_SUBTEXT[order.status]}</p>
                    </div>
                  </div>
                  <button className="qb-map-report">⚠ Report Issue</button>
                  <span className="qb-map-bag">🌡 Thermal Bag: <b>65.2°C Hot</b></span>
                </div>
                <div className="qb-track-stats">
                  <div>
                    <span>⏱</span>
                    <small>ESTIMATED TIME</small>
                    <b>{minsLeft > 0 ? `${minsLeft}–${minsLeft + 2} mins` : "Arriving now"}</b>
                  </div>
                  <div>
                    <span>⇄</span>
                    <small>REMAINING DISTANCE</small>
                    <b>{pickedUp ? "0.8 miles" : "—"}</b>
                  </div>
                  <div>
                    <span>◔</span>
                    <small>TRAFFIC PACE</small>
                    <b>Optimal Flow</b>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="qb-track-right">
            <section className="qb-ord-card qb-eta-card">
              <small className="qb-label">ESTIMATED DELIVERY</small>
              <div className="qb-eta-row">
                <div className="qb-eta-time">
                  {fmtTime(eta).replace(/\s?(AM|PM)/i, "")}
                  <span>{/PM/i.test(fmtTime(eta)) ? "PM" : /AM/i.test(fmtTime(eta)) ? "AM" : ""}</span>
                </div>
                {active && (
                  <div className="qb-ring" style={{ background: `conic-gradient(#ff5722 ${ringDeg}deg, #f1f3ff 0)` }}>
                    <b>{minsLeft}m</b>
                  </div>
                )}
              </div>
              <div className="qb-progress"><i style={{ width: `${progressPct}%` }} /></div>

              {!cancelled && (
                <div className="qb-vtimeline">
                  {STATUS_ORDER.map((s, i) => {
                    const state = delivered || i < cur ? "done" : i === cur ? "active" : "todo";
                    const at = timeOfStatus(order, s);
                    return (
                      <div key={s} className={`qb-vt ${state}`}>
                        <span className="qb-vt-dot">{state === "done" ? "✓" : state === "active" ? "➤" : ""}</span>
                        <div>
                          <b>{STATUS_LABELS[s]}</b>
                          <small>{STATUS_SUBTEXT[s]}</small>
                        </div>
                        <em>{at ? fmtTime(at) : i === STATUS_ORDER.length - 1 ? `Est. ${fmtTime(eta)}` : ""}</em>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {active && (
              <section className="qb-ord-card qb-courier">
                <div className="qb-ord-card-head">
                  <small className="qb-label">YOUR COURIER</small>
                  <span className="qb-pill amber">★ 4.95 (1,420)</span>
                </div>
                <div className="qb-courier-id">
                  <span className="restaurant-avatar">MV</span>
                  <div>
                    <b>Marcus Vance</b>
                    <small>🛵 Honda PCX 150 (Silver)</small>
                    <span className="qb-pill green">Hot-bag verified 65°C</span>
                  </div>
                </div>
                <div className="qb-courier-btns">
                  <button className="qb-secondary-btn">📞 Call Marcus</button>
                  <button className="qb-secondary-btn">💬 Message</button>
                </div>
                <div className="qb-tip-head">
                  <span>Add a courier tip:</span>
                  <b>100% goes to Marcus</b>
                </div>
                <div className="qb-tips">
                  {TIPS.map((t) => (
                    <button key={t} className={tip === t ? "on" : ""} onClick={() => setTip(t)}>${t.toFixed(2)}</button>
                  ))}
                  <button className={!TIPS.includes(tip) ? "on" : ""} onClick={() => setTip(10)}>Custom</button>
                </div>
              </section>
            )}

            <section className="qb-ord-card">
              <div className="qb-rest-line">
                <span className="qb-rest-line-icon">🍴</span>
                <div>
                  <b>{restaurant.name}</b>
                  <small>{itemCount(order)} items · {money(order.total)} {order.paymentStatus === "paid" ? "Paid" : "Due"}</small>
                </div>
              </div>
              <div className="qb-mini-items">
                {order.items.slice(0, 4).map((i, k) => <DishThumb key={k} name={i.name} size={36} radius={8} />)}
              </div>
              <div className="qb-rest-line-foot">
                <Link to={`/orders/${id}/receipt`}>View full receipt &amp; breakdown ›</Link>
                <span>Receipt #{code.slice(3)}</span>
              </div>
            </section>

            <section className="qb-ord-card qb-instructions">
              <b>📍 Delivery Instructions</b>
              <p>{order.instructions ? `"${order.instructions}"` : `Deliver to ${addr.line1 || "your address"}${addr.city ? `, ${addr.city}` : ""}.`}</p>
              <div className="qb-instr-foot"><a>✎ Edit note</a><span>🎧 QuickBite 24/7 Dispatch</span></div>
            </section>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
