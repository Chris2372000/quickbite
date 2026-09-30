const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/quickbite";

  try {
    await mongoose.connect(uri);
    console.log(`[mongo] connected -> ${uri}`);
  } catch (err) {
    console.error("[mongo] connection failed:", err.message);
    // Retry after a short delay - useful when Mongo container is still starting up
    setTimeout(connectDB, 3000);
  }
}

module.exports = connectDB;
