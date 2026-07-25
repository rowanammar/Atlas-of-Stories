const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/** Helper: fetch with a timeout to prevent hanging requests */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Geocoding request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  }
}

/**
 * geocodeLocation(placeName)
 *byhawel asamy el amaken ly co-ordinates
 * @param {string} placeName — e.g. "St. Petersburg, Russia"
 * @returns {object|null} — { lat, lng, formattedAddress } or null if not found
 */
async function geocodeLocation(placeName) {
  try {
    const apiKey = process.env.GEOCODING_API_KEY;

    if (!apiKey) {
      console.error(' GEOCODING_API_KEY is not set in .env');
      return null;
    }

    const url = `${GEOCODING_URL}?address=${encodeURIComponent(placeName)}&key=${apiKey}`;
    const response = await fetchWithTimeout(url, {}, 10000);

    if (!response.ok) {
      console.warn(` Geocoding API returned ${response.status} for "${placeName}"`);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    console.warn(` Could not geocode: "${placeName}" (status: ${data.status})`);
    return null;

  } catch (error) {
    console.error(`Geocoding error for "${placeName}":`, error.message);
    return null;
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {Array} locations — Array of { name, type, significance, trivia, quote }
 * @returns {Array} — Same array but with lat, lng, formattedAddress added
 */
async function geocodeLocations(locations) {
  const geocoded = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];

    console.log(`Geocoding (${i + 1}/${locations.length}): ${location.name}`);
    const coords = await geocodeLocation(location.name);

    if (coords) {
      geocoded.push({
        ...location,
        lat: coords.lat,
        lng: coords.lng,
        formattedAddress: coords.formattedAddress,
      });
    }

    if (i < locations.length - 1) {
      await sleep(100);
    }
  }

  console.log(`✅ Successfully geocoded ${geocoded.length}/${locations.length} locations`);
  return geocoded;
}

module.exports = {
  geocodeLocation,
  geocodeLocations,
};
