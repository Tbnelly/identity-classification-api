const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// routes
app.use("/api", require("./routes/profileRoutes"));

// error handlers
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;