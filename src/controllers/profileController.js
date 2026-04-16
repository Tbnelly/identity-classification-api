// src/controllers/profileController.js
//
// Controllers are the "traffic directors" of your app.
// They receive the HTTP request, validate inputs, call services,
// and send back the right HTTP response.
//
// Controllers should NOT contain business logic or SQL — that lives in services.
// Controllers should NOT know how data is stored — that's the service's job.
// This clean separation makes the code easy to test and maintain.

const { fetchAllProfileData } = require("../services/externalApis");
const {
  findProfileByName,
  findProfileById,
  createProfile,
  getAllProfiles,
  deleteProfileById,
} = require("../services/profileService");

// ─────────────────────────────────────────────
// POST /api/profiles
// Body: { "name": "ella" }
// ─────────────────────────────────────────────
async function createProfileHandler(req, res) {
  try {
    const { name } = req.body;

    // VALIDATION 1: name must be present
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }

    // VALIDATION 2: name must be a string (not a number, array, object, etc.)
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string",
      });
    }

    // VALIDATION 3: name must not be empty after trimming whitespace
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        status: "error",
        message: "Name cannot be empty",
      });
    }

    // DUPLICATE PREVENTION:
    // Before calling any external APIs, check if this name already exists.
    // Why? Because calling 3 APIs just to throw away the result is wasteful.
    // We check BEFORE to save time and API quota.
    const existing = findProfileByName(trimmedName);
    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing,
      });
    }

    // EXTERNAL API CALLS (all 3 in parallel):
    // fetchAllProfileData can throw a custom error object { statusCode, message }
    // if any API fails or returns invalid data. We catch that below.
    const apiData = await fetchAllProfileData(trimmedName);

    // STORE IN DATABASE:
    // Only reached if all 3 APIs returned valid data.
    const profile = createProfile(trimmedName, apiData);

    // 201 Created = "I made a new resource for you"
    return res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: profile,
    });
  } catch (err) {
    // If the error came from our external API service, it has statusCode + message
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    }

    // Any other unexpected error → 500 Internal Server Error
    console.error("Unexpected error in createProfileHandler:", err);
    return res.status(500).json({
      status: "error",
      message: "An unexpected server error occurred",
    });
  }
}

// ─────────────────────────────────────────────
// GET /api/profiles/:id
// ─────────────────────────────────────────────
function getProfileByIdHandler(req, res) {
  try {
    const { id } = req.params;  // Express extracts :id from the URL automatically

    const profile = findProfileById(id);

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    console.error("Unexpected error in getProfileByIdHandler:", err);
    return res.status(500).json({
      status: "error",
      message: "An unexpected server error occurred",
    });
  }
}

// ─────────────────────────────────────────────
// GET /api/profiles
// Query params: ?gender=male&country_id=US&age_group=adult
// ─────────────────────────────────────────────
function getAllProfilesHandler(req, res) {
  try {
    // req.query contains URL query parameters as an object
    // e.g. GET /api/profiles?gender=male → req.query = { gender: "male" }
    const { gender, country_id, age_group } = req.query;

    // Only pass defined filters to the service
    // (undefined values are ignored inside getAllProfiles)
    const profiles = getAllProfiles({ gender, country_id, age_group });

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles,
    });
  } catch (err) {
    console.error("Unexpected error in getAllProfilesHandler:", err);
    return res.status(500).json({
      status: "error",
      message: "An unexpected server error occurred",
    });
  }
}

// ─────────────────────────────────────────────
// DELETE /api/profiles/:id
// ─────────────────────────────────────────────
function deleteProfileHandler(req, res) {
  try {
    const { id } = req.params;

    const deletedCount = deleteProfileById(id);

    if (deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    // 204 No Content = "I did the thing, there's nothing to send back"
    // Importantly: 204 responses must NOT have a body — that's the HTTP standard.
    return res.status(204).send();
  } catch (err) {
    console.error("Unexpected error in deleteProfileHandler:", err);
    return res.status(500).json({
      status: "error",
      message: "An unexpected server error occurred",
    });
  }
}

module.exports = {
  createProfileHandler,
  getProfileByIdHandler,
  getAllProfilesHandler,
  deleteProfileHandler,
};