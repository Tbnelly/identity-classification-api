const Profile = require("../models/Profile");
const { uuidv7 } = require("uuidv7");

function getAgeGroup(age) {
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
}

async function findProfileByName(name) {
  return await Profile.findOne({ name: name.toLowerCase() });
}

async function findProfileById(id) {
  return await Profile.findOne({ id });
}

async function createProfile(name, apiData) {
  const profile = new Profile({
    id: uuidv7(),
    name: name.toLowerCase(),
    gender: apiData.gender,
    gender_probability: apiData.gender_probability,
    sample_size: apiData.sample_size,
    age: apiData.age,
    age_group: getAgeGroup(apiData.age),
    country_id: apiData.country_id,
    country_probability: apiData.country_probability,
    created_at: new Date().toISOString()
  });

  await profile.save();
  return profile;
}

async function getAllProfiles(filters = {}) {
  const query = {};

  if (filters.gender) {
    query.gender = new RegExp(`^${filters.gender}$`, "i");
  }

  if (filters.country_id) {
    query.country_id = new RegExp(`^${filters.country_id}$`, "i");
  }

  if (filters.age_group) {
    query.age_group = new RegExp(`^${filters.age_group}$`, "i");
  }

  return await Profile.find(query).sort({ created_at: -1 });
}

async function deleteProfileById(id) {
  const result = await Profile.deleteOne({ id });
  return result.deletedCount;
}

module.exports = {
  findProfileByName,
  findProfileById,
  createProfile,
  getAllProfiles,
  deleteProfileById
};