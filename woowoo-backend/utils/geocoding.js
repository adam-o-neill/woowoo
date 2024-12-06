const axios = require("axios");

// Option 1: Using Google Maps Geocoding API
const geocodeWithGoogle = async (placeOfBirth) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: placeOfBirth,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.results.length === 0) {
      throw new Error("Location not found");
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: response.data.results[0].formatted_address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};

// Wrapper function to use either service
const geocode = async (placeOfBirth) => {
  // Choose which service to use based on your needs
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return geocodeWithGoogle(placeOfBirth);
  }
};

module.exports = {
  geocode,
};
