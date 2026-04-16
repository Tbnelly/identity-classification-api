// src/server.js
//
// This is the ENTRY POINT of the application.
// It wires everything together: Express, middleware, routes, and the database.
// Think of it as the "main()" function of your backend.

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const profileRoutes = require("./routes/profileRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// ─────────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Middleware Stack
// (runs in order, top to bottom, for EVERY request)
// ─────────────────────────────────────────────

// CORS: Adds "Access-Control-Allow-Origin: *" to every response.
// Without this, browsers block requests from different origins (domains).
// The "*" means ANY website can call your API. Secure APIs would restrict this.
app.use(cors());

// express.json(): Parses incoming request bodies that have Content-Type: application/json
// Without this, req.body would be undefined for POST requests.
// After this middleware, req.body is a JavaScript object you can use.
app.use(express.json());

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
// All routes defined in profileRoutes.js are mounted under "/api"
// So "/profiles" in the router becomes "/api/profiles" in the final URL.
app.use("/api", profileRoutes);

// ─────────────────────────────────────────────
// 404 Handler (must come AFTER all routes)
// If no route matched, this catches it.
// ─────────────────────────────────────────────
app.use(notFoundHandler);

// ─────────────────────────────────────────────
// Global Error Handler (must come LAST, with 4 params)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
// Initialize the database (create tables if they don't exist),
// then start listening for HTTP requests.


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/api/profiles`);
  console.log(`   GET    http://localhost:${PORT}/api/profiles`);
  console.log(`   GET    http://localhost:${PORT}/api/profiles/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/profiles/:id`);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;