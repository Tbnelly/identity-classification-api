// src/routes/profileRoutes.js
//
// Routes map HTTP method + URL path → controller function.
// Think of routes as the "menu" of your API.
// Express reads the METHOD (GET/POST/DELETE) and PATH (/api/profiles)
// and calls the matching controller function.
//
// We use express.Router() to group related routes together.
// In server.js, we'll mount this entire router under "/api".

const express = require("express");
const router = express.Router();

const {
  createProfileHandler,
  getProfileByIdHandler,
  getAllProfilesHandler,
  deleteProfileHandler,
} = require("../controllers/profileController");

// POST   /api/profiles        → create a new profile
// GET    /api/profiles        → list all profiles (with optional filters)
router
  .route("/profiles")
  .post(createProfileHandler)
  .get(getAllProfilesHandler);

// GET    /api/profiles/:id    → get one profile by ID
// DELETE /api/profiles/:id    → delete a profile
router
  .route("/profiles/:id")
  .get(getProfileByIdHandler)
  .delete(deleteProfileHandler);

module.exports = router;