// src/services/externalApis.js
//
// This file is responsible for ONE thing: talking to the 3 external APIs.
// It fetches raw data, validates it, and throws clear errors if anything is wrong.
// The controller doesn't need to know HOW we get the data — only that we do.
// This is called "separation of concerns" — a key principle in clean architecture.

/**
 * fetchGenderData(name)
 * Calls genderize.io and returns { gender, gender_probability, sample_size }
 *
 * EDGE CASE: If the name is too obscure, gender or count can be null/0.
 * We must reject those — we can't store unreliable data.
 */
async function fetchGenderData(name) {
  // fetch() is built into modern Node.js (v18+). It makes HTTP requests.
  const response = await fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`);

  // If the HTTP status is not 2xx (like 500, 503), throw immediately
  if (!response.ok) {
    throw { statusCode: 502, message: "Genderize returned an invalid response" };
  }

  const data = await response.json();

  // EDGE CASE VALIDATION:
  // gender is null  → the API doesn't know the gender (name too rare)
  // count is 0      → zero data points, result is meaningless
  if (!data.gender || !data.count || data.count === 0) {
    throw { statusCode: 502, message: "Genderize returned an invalid response" };
  }

  return {
    gender: data.gender,
    gender_probability: data.probability,
    sample_size: data.count,
  };
}

/**
 * fetchAgeData(name)
 * Calls agify.io and returns { age }
 */
async function fetchAgeData(name) {
  const response = await fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw { statusCode: 502, message: "Agify returned an invalid response" };
  }

  const data = await response.json();

  // EDGE CASE: age can be null for very uncommon names
  if (data.age === null || data.age === undefined) {
    throw { statusCode: 502, message: "Agify returned an invalid response" };
  }

  return { age: data.age };
}

/**
 * fetchNationalityData(name)
 * Calls nationalize.io and returns { country_id, country_probability }
 *
 * The API returns an array of countries ranked by probability.
 * We pick the first one (highest probability).
 */
async function fetchNationalityData(name) {
  const response = await fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw { statusCode: 502, message: "Nationalize returned an invalid response" };
  }

  const data = await response.json();

  // EDGE CASE: country array can be empty for very rare names
  if (!data.country || data.country.length === 0) {
    throw { statusCode: 502, message: "Nationalize returned an invalid response" };
  }

  // The array is already sorted by probability (highest first)
  const topCountry = data.country[0];

  return {
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
  };
}

/**
 * fetchAllProfileData(name)
 * Calls ALL THREE APIs in parallel using Promise.all()
 *
 * WHY PARALLEL?
 * If we called them one-by-one (sequentially), and each takes 300ms,
 * total wait = 900ms. With Promise.all(), they all run at the SAME TIME,
 * so total wait ≈ 300ms (the slowest one). Much faster!
 *
 * If ANY of them throws, the whole Promise.all() immediately rejects
 * with that error. Perfect for our use case.
 */
async function fetchAllProfileData(name) {
  const [genderData, ageData, nationalityData] = await Promise.all([
    fetchGenderData(name),
    fetchAgeData(name),
    fetchNationalityData(name),
  ]);

  return { ...genderData, ...ageData, ...nationalityData };
}

module.exports = { fetchAllProfileData };