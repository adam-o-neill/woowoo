import axios from "axios";

const geocodeWithGoogle = async (placeOfBirth: string) => {
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
    const formattedAddress = response.data.results[0].formatted_address;

    // Fetch timezone information
    const timezoneResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/timezone/json`,
      {
        params: {
          location: `${lat},${lng}`,
          timestamp: Math.floor(Date.now() / 1000),
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (timezoneResponse.data.status !== "OK") {
      throw new Error("Timezone not found");
    }

    const timezone = timezoneResponse.data.timeZoneId;

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress,
      timezone,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};

// Wrapper function to use either service
const geocode = async (placeOfBirth: string) => {
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return geocodeWithGoogle(placeOfBirth);
  } else {
    throw new Error("Google Maps API key is not set");
  }
};

export { geocode };
