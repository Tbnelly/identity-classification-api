const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api", require("./routes/profileRoutes"));

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;