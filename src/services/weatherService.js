import axios from "axios";

// URL de base pour les API de géocodage et de météo.
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Fonction pour obtenir les coordonnées géographiques à partir d'un nom de ville.
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

// Fonction pour obtenir les données météo à partir des coordonnées géographiques.
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
