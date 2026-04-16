const { fetchAllProfileData } = require("../services/externalApis");
const {
  findProfileByName,
  findProfileById,
  createProfile,
  getAllProfiles,
  deleteProfileById,
} = require("../services/profileService");

// POST /api/profiles
async function createProfileHandler(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ status: "error", message: "Name is required" });
    }

    if (typeof name !== "string") {
      return res.status(422).json({ status: "error", message: "Name must be a string" });
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({ status: "error", message: "Name cannot be empty" });
    }

    const existing = await findProfileByName(trimmedName);
    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing,
      });
    }

    const apiData = await fetchAllProfileData(trimmedName);
    const profile = await createProfile(trimmedName, apiData); // ❌ was missing await

    return res.status(201).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ status: "error", message: err.message });
    }
    console.error("Unexpected error in createProfileHandler:", err);
    return res.status(500).json({ status: "error", message: "An unexpected server error occurred" });
  }
}

// GET /api/profiles/:id
async function getProfileByIdHandler(req, res) { // ❌ was missing async
  try {
    const { id } = req.params;
    const profile = await findProfileById(id); // ❌ was missing await

    if (!profile) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }

    return res.status(200).json({ status: "success", data: profile });
  } catch (err) {
    console.error("Unexpected error in getProfileByIdHandler:", err);
    return res.status(500).json({ status: "error", message: "An unexpected server error occurred" });
  }
}

// GET /api/profiles
async function getAllProfilesHandler(req, res) { // ❌ was missing async
  try {
    const { gender, country_id, age_group } = req.query;
    const profiles = await getAllProfiles({ gender, country_id, age_group }); // ❌ was missing await

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles,
    });
  } catch (err) {
    console.error("Unexpected error in getAllProfilesHandler:", err);
    return res.status(500).json({ status: "error", message: "An unexpected server error occurred" });
  }
}

// DELETE /api/profiles/:id
async function deleteProfileHandler(req, res) { // ❌ was missing async
  try {
    const { id } = req.params;
    const deletedCount = await deleteProfileById(id); // ❌ was missing await

    if (deletedCount === 0) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Unexpected error in deleteProfileHandler:", err);
    return res.status(500).json({ status: "error", message: "An unexpected server error occurred" });
  }
}

module.exports = {
  createProfileHandler,
  getProfileByIdHandler,
  getAllProfilesHandler,
  deleteProfileHandler,
};