const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use("/api", profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Only listen locally, Vercel handles this in production
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;