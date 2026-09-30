# QuickBite — Single Restaurant Ordering App

A starter scaffold for a food-ordering app for **one restaurant**: customers browse
the menu, place orders, and track them live; kitchen staff manage orders on a
real-time kanban board.

Stack: **React (Vite) + Node/Express + MongoDB + Socket.io**, fully free and
self-hostable — no subscriptions required. Payments use Stripe when you're
ready for real transactions (free to integrate, per-transaction fee only when
you process a real charge).

## Project layout

```
quickbite-app/
├── docker-compose.yml     # spins up MongoDB + the API together
├── backend/                # Express API + Mongoose models + Socket.io
└── frontend/                # React (Vite) app, styled with the QuickBite design tokens
```

## 1. Start the backend + database (Docker)

```bash
cd quickbite-app
docker compose up --build
```

This starts two containers:
- `mongo` — MongoDB, data persisted in a Docker volume (`mongo_data`)
- `api` — the Express server, on http://localhost:5000

The API auto-reloads on file changes (nodemon), so you can edit files in
`backend/` and see changes without rebuilding the container.

### Seed sample data

The database starts empty. Populate it with a sample menu, a default
restaurant profile, and a staff test login:

```bash
docker compose exec api npm run seed
```

This creates a staff account you can use to log into the kitchen dashboard:
- **email:** staff@quickbite.test
- **password:** staffpass123

## 2. Start the frontend

The frontend runs outside Docker for a faster dev experience (instant hot
reload). You'll need Node.js 18+ installed.

```bash
cd quickbite-app/frontend
cp .env.example .env
npm install
npm run dev
```

Visit **http://localhost:5173**.

## What's wired up already

- **Auth:** signup/login with JWT + bcrypt (no third-party auth service)
- **Menu:** browse, item modifiers (size/extras), add to cart
- **Cart & checkout:** client-side cart (persisted to localStorage), address +
  payment method, order placed to the backend
- **Live order tracking:** customer's order page updates in real time via
  Socket.io as staff move the order through its stages
- **Kitchen dashboard:** `/admin` — a kanban board (New → Confirmed →
  Preparing → Ready → Out for Delivery) for staff/admin accounts, updating
  live for every connected staff member
- **Roles:** `customer`, `staff`, `admin` — staff/admin-only routes are
  protected both in the API (middleware) and hidden in the UI

## What's intentionally left for you to add next

- **Real payments:** Checkout currently records `paymentMethod` but doesn't
  charge a card. Wire in Stripe's SDK when you're ready to take real orders.
- **Push notifications:** order status changes currently only push to
  whoever has the tracking page open. Add Firebase Cloud Messaging if you
  want notifications when the app is closed.
- **Maps/ETA:** delivery address is just stored as a string + optional
  lat/lng. Add Leaflet + OpenStreetMap if you want map pickers or live
  courier tracking.
- **Restaurant profile UI:** the `Restaurant` model and API route exist
  (`GET/PUT /api/restaurant`) but there's no settings page yet — useful for
  editing hours, delivery fee, tax rate from the UI instead of the database.
- **Password reset, favorites, saved addresses/payment methods:** the User
  model has fields ready (`addresses`, `favorites`) but no routes/UI yet.
- **Production deploy:** for a real deployment, swap `JWT_SECRET` for a long
  random value, and deploy frontend (Vercel/Netlify free tier) + backend
  (Render/Railway free tier, or your own VPS) separately from your dev setup.

## API quick reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Log in |
| GET | `/api/auth/me` | customer | Validate current token |
| GET | `/api/menu` | — | Browse menu |
| POST/PUT/DELETE | `/api/menu` | staff/admin | Manage menu items |
| POST | `/api/orders` | customer | Place an order |
| GET | `/api/orders/mine` | customer | Own order history |
| GET | `/api/orders/:id` | customer (own) / staff | Order detail |
| GET | `/api/orders` | staff/admin | All active orders |
| PATCH | `/api/orders/:id/status` | staff/admin | Advance order status |
| GET/PUT | `/api/restaurant` | — / admin | Restaurant profile & hours |
