// Run with: npm run seed
// Populates the database with sample menu items, a default restaurant profile,
// and a staff login you can use for the kitchen dashboard.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const sampleDishes = require("./sampleDishes.json");

async function seed() {
  await connectDB();
  // small delay to make sure the connection settled
  await new Promise((r) => setTimeout(r, 500));

  // Seed is safe to run repeatedly: it upserts sample data instead of deleting
  // menus/orders. This prevents a seed run from wiping existing customer data.
  await Restaurant.deleteMany({});

  await Restaurant.create({
    name: "QuickBite",
    description: "Fresh, fast, made-to-order.",
    address: "123 Market Street",
    phone: "555-0100",
    deliveryFee: 2.99,
    taxRate: 0.08,
    isOpen: true,
    openingHours: {
      mon: { open: "09:00", close: "22:00" },
      tue: { open: "09:00", close: "22:00" },
      wed: { open: "09:00", close: "22:00" },
      thu: { open: "09:00", close: "22:00" },
      fri: { open: "09:00", close: "23:00" },
      sat: { open: "10:00", close: "23:00" },
      sun: { open: "10:00", close: "21:00" },
    },
  });

  const baseDishes = [
    {
      name: "Classic Cheeseburger",
      description: "Beef patty, cheddar, lettuce, tomato, house sauce.",
      price: 9.99,
      category: "Burgers",
      modifierGroups: [
        {
          name: "Size",
          required: true,
          multiple: false,
          options: [
            { name: "Single patty", priceDelta: 0 },
            { name: "Double patty", priceDelta: 3.0 },
          ],
        },
        {
          name: "Extras",
          required: false,
          multiple: true,
          options: [
            { name: "Bacon", priceDelta: 1.5 },
            { name: "Extra cheese", priceDelta: 1.0 },
          ],
        },
      ],
    },
    {
      name: "Crispy Chicken Sandwich",
      description: "Buttermilk fried chicken, pickles, spicy mayo.",
      price: 8.49,
      category: "Sandwiches",
      modifierGroups: [],
    },
    {
      name: "Loaded Fries",
      description: "Fries, cheese sauce, bacon bits, scallions.",
      price: 6.49,
      category: "Sides",
      modifierGroups: [],
    },
    {
      name: "Garden Salad",
      description: "Mixed greens, cherry tomato, cucumber, vinaigrette.",
      price: 7.25,
      category: "Salads",
      modifierGroups: [],
    },
    {
      name: "Chocolate Milkshake",
      description: "Rich chocolate shake topped with whipped cream.",
      price: 5.5,
      category: "Drinks",
      modifierGroups: [],
    },
  ];

  await MenuItem.bulkWrite(
    [...baseDishes, ...sampleDishes].map((dish) => ({
      updateOne: {
        filter: dish.slug ? { slug: dish.slug } : { name: dish.name, slug: { $exists: false } },
        update: { $set: dish },
        upsert: true,
      },
    }))
  );

  // Dishes of the front-end's sample restaurants, so they can be ordered.
  // Regenerate the JSON with:  node scripts/export-sample-dishes.mjs  (in the frontend folder)
  const staffExists = await User.findOne({ email: "staff@quickbite.test" });
  if (!staffExists) {
    const passwordHash = await User.hashPassword("staffpass123");
    await User.create({
      name: "Kitchen Staff",
      email: "staff@quickbite.test",
      passwordHash,
      role: "staff",
    });
  }

  console.log("[seed] Done. Sample menu, restaurant profile, and staff login created.");
  console.log("[seed] Staff login -> email: staff@quickbite.test / password: staffpass123");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
