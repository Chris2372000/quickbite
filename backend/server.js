require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const restaurantRoutes = require("./routes/restaurant");
const offerRoutes = require("./routes/offers");

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ["GET", "POST", "PATCH"] },
});

// Make io available inside route handlers via req.app.get("io")
app.set("io", io);

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/offers", offerRoutes);

// --- Socket.io: real-time order tracking + kitchen kanban board ---
io.on("connection", (socket) => {
  // A customer's order-tracking screen joins its own order's room
  socket.on("order:watch", (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // The restaurant's kitchen dashboard joins the shared "kitchen" room
  socket.on("kitchen:join", () => {
    socket.join("kitchen");
  });

  socket.on("disconnect", () => {
    // socket.io cleans up room membership automatically
  });
});

connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[server] QuickBite API listening on port ${PORT}`);
});
