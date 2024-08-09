import axios from "axios";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const getGeocode = async (query) => {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        name: query,
        count: 1,
        language: "fr",
      },
    });
    if (response.data.results && response.data.results.length > 0) {
      const { latitude, longitude } = response.data.results[0];
      return { latitude, longitude };
    } else {
      throw new Error("Ville non trouvée");
    }
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude,
        longitude,
        current_weather: true,
        timezone: "Europe/Paris",
      },
    });
    return response.data.current_weather;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};
