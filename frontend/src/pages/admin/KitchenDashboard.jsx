import { useEffect, useState } from "react";
import client from "../../api/client";
import socket from "../../api/socket";
import { useAuth } from "../../context/AuthContext";

// The active stages shown as kanban columns. Delivered/cancelled orders
// aren't shown here - see order history for those.
const COLUMNS = [
  { key: "placed", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
];

// Given a status, what's the next stage a staff member can move it to
function nextStatus(status) {
  const idx = COLUMNS.findIndex((c) => c.key === status);
  return idx >= 0 && idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].key : null;
}

export default function KitchenDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    client.get("/orders").then((res) => setOrders(res.data.orders));

    socket.emit("kitchen:join");

    function handleNew(order) {
      setOrders((prev) => [order, ...prev]);
    }
    function handleUpdated(updated) {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    }

    socket.on("order:new", handleNew);
    socket.on("order:updated", handleUpdated);
    return () => {
      socket.off("order:new", handleNew);
      socket.off("order:updated", handleUpdated);
    };
  }, []);

  async function advance(order) {
    const status = nextStatus(order.status);
    if (!status) return;
    const res = await client.patch(`/orders/${order._id}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data.order : o)));
  }

  if (!user || !["staff", "admin"].includes(user.role)) {
    return <p className="text-center mt-16 text-on-surface-variant">Staff access only.</p>;
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Kitchen Orders</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="min-w-[260px] bg-surface-container rounded-xl p-3">
              <h2 className="font-semibold text-on-surface mb-3">
                {col.label} ({colOrders.length})
              </h2>
              <div className="space-y-3">
                {colOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-surface-container-lowest rounded-lg p-3 shadow-sm"
                  >
                    <p className="font-semibold text-sm">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs text-on-surface-variant">
                        {item.quantity} × {item.name}
                      </p>
                    ))}
                    <p className="text-xs font-semibold text-primary mt-1">
                      ${order.total.toFixed(2)}
                    </p>
                    {nextStatus(order.status) && (
                      <button
                        onClick={() => advance(order)}
                        className="mt-2 w-full bg-primary text-on-primary text-xs py-1.5 rounded-lg font-semibold"
                      >
                        Move to {COLUMNS.find((c) => c.key === nextStatus(order.status)).label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
