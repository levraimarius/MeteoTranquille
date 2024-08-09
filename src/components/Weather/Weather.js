import React, { useState, useCallback } from "react";
import axios from "axios";
import "./Weather.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCloud,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudShowersWater,
  faCloudSun,
  faLocationDot,
  faSmog,
  faSun,
  faTemperatureThreeQuarters,
  faWind,
} from "@fortawesome/free-solid-svg-icons";

const Weather = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      setError("Veuillez entrer un nom de ville ou un code postal.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search`,
        {
          params: {
            name: input,
            language: "fr",
          },
        }
      );

      if (
        !response.data ||
        !response.data.results ||
        !Array.isArray(response.data.results)
      ) {
        throw new Error("Données de réponse invalides.");
      }

      const uniqueSuggestions = new Map();
      response.data.results.forEach((item) => {
        const city_name = item.name;
        const country = item.country;
        const postcodes = item.postcodes || [];
        const admin2 = item.admin2;
        const admin1 = item.admin1;

        if (city_name && item.latitude && item.longitude) {
          const id = `${city_name}-${item.country_code}`;
          if (!uniqueSuggestions.has(id)) {
            uniqueSuggestions.set(id, {
              ...item,
              city_name,
              country,
              postcodes,
              admin2,
              admin1,
            });
          }
        }
      });

      const suggestionsArray = Array.from(uniqueSuggestions.values());

      suggestionsArray.sort((a, b) => {
        if (a.country === "France" && b.country !== "France") {
          return -1;
        }
        if (a.country !== "France" && b.country === "France") {
          return 1;
        }
        return a.city_name.localeCompare(b.city_name);
      });

      setSuggestions(suggestionsArray);
      setStatus("succeeded");
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions", error);
      setSuggestions([]);
      setError(
        "Nous n'avons pas pu récupérer les suggestions. Assurez-vous que votre recherche est correcte et essayez à nouveau."
      );
      setStatus("failed");
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    []
  );

  const handleChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.city_name);
    setSuggestions([]);
    setSelectedSuggestion(suggestion);
    await fetchWeather(suggestion.latitude, suggestion.longitude);
  };

  const fetchWeather = async (lat, lon) => {
    setStatus("loading");
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m,precipitation,wind_speed_10m,weathercode",
            current_weather: true,
          },
        }
      );
      const now = new Date();
      const currentHour = now.getHours();
      const hourlyForecast = response.data.hourly.time;

      const forecastStartIndex = hourlyForecast.findIndex(
        (time) => new Date(time).getHours() === currentHour
      );

      const hourlyData = hourlyForecast.slice(
        forecastStartIndex,
        forecastStartIndex + 24
      );

      setData({
        ...response.data,
        hourly: {
          ...response.data.hourly,
          time: hourlyData,
        },
      });
      setStatus("succeeded");
    } catch (error) {
      console.error("Erreur lors de la récupération des données météo", error);
      setError(
        "Une erreur est survenue lors de la récupération des données météo. Veuillez réessayer."
      );
      setStatus("failed");
    }
  };

  const getWeatherDescription = (weatherCode) => {
    switch (weatherCode) {
      case 0:
        return (
          <>
            <FontAwesomeIcon icon={faSun} /> Ciel clair
          </>
        );
      case 1:
        return (
          <>
            <FontAwesomeIcon icon={faCloudSun} /> Partiellement clair
          </>
        );
      case 2:
        return (
          <>
            <FontAwesomeIcon icon={faCloudSun} /> Partiellement nuageux
          </>
        );
      case 3:
        return (
          <>
            <FontAwesomeIcon icon={faCloud} /> Nuageux
          </>
        );
      case 45:
        return (
          <>
            <FontAwesomeIcon icon={faSmog} /> Brouillard
          </>
        );
      case 48:
        return (
          <>
            <FontAwesomeIcon icon={faSmog} /> Brouillard givrant
          </>
        );
      case 51:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersWater} /> Bruine légère
          </>
        );
      case 53:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersWater} /> Bruine modérée
          </>
        );
      case 55:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersWater} /> Bruine dense
          </>
        );
      case 61:
        return (
          <>
            <FontAwesomeIcon icon={faCloudRain} /> Pluie légère
          </>
        );
      case 63:
        return (
          <>
            <FontAwesomeIcon icon={faCloudRain} /> Pluie modérée
          </>
        );
      case 65:
        return (
          <>
            <FontAwesomeIcon icon={faCloudRain} /> Pluie forte
          </>
        );
      case 80:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersHeavy} /> Averses légères
          </>
        );
      case 81:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersHeavy} /> Averses modérées
          </>
        );
      case 82:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersHeavy} /> Averses fortes
          </>
        );
      case 95:
        return (
          <>
            <FontAwesomeIcon icon={faBolt} /> Orages
          </>
        );
      case 96:
        return (
          <>
            <FontAwesomeIcon icon={faBolt} /> Orages avec grêle
          </>
        );
      case 99:
        return (
          <>
            <FontAwesomeIcon icon={faBolt} /> Orages fort avec grêle
          </>
        );
      default:
        return "Conditions météo inconnues";
    }
  };

  const filterPostcodes = (postcodes) => {
    if (!Array.isArray(postcodes)) {
      return [];
    }
    return postcodes.filter((postcode) => !postcode.includes("CEDEX"));
  };

  const formatPostcodes = (postcodes) => {
    if (!Array.isArray(postcodes) || postcodes.length === 0) {
      return "";
    }
    return postcodes.length > 1 ? `${postcodes[0]}...` : postcodes[0];
  };

  const formatSuggestion = (suggestion) => {
    const parts = [];
    if (suggestion.city_name) parts.push(suggestion.city_name);
    if (formatPostcodes(filterPostcodes(suggestion.postcodes)))
      parts.push(formatPostcodes(filterPostcodes(suggestion.postcodes)));
    if (suggestion.admin2) parts.push(suggestion.admin2);
    if (suggestion.admin1) parts.push(suggestion.admin1);
    if (suggestion.country) parts.push(suggestion.country);

    return parts.join(", ");
  };

  return (
    <div className="weather-container">
      <h1>Météo Tranquille</h1>
      <p>La météo préférée des français tranquille</p>
      <form className="weather-form" onSubmit={(e) => e.preventDefault()}>
        <div className="input-container">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Entrez le nom de la ville ou le code postal"
            aria-label="Rechercher une ville ou un code postal"
          />
        </div>
      </form>

      {error && (
        <p aria-live="polite" className="error-message">
          {error}
        </p>
      )}

      <div className="suggestions-container">
        {status === "loading" && (
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
          </div>
        )}
        {suggestions.length > 0 && status === "succeeded" && (
          <div className="suggestions" role="listbox">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-item"
                role="option"
                aria-selected={selectedSuggestion?.id === suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {formatSuggestion(suggestion)}
              </div>
            ))}
          </div>
        )}
      </div>

      {status === "failed" && !error && (
        <p aria-live="polite" className="error-message">
          Une erreur est survenue. Veuillez réessayer plus tard.
        </p>
      )}

      {data && (
        <div className="weather-results">
          <div>
            <p>
              <FontAwesomeIcon icon={faLocationDot} />{" "}
              {selectedSuggestion.city_name}
            </p>
            <h2>
              <FontAwesomeIcon icon={faTemperatureThreeQuarters} />{" "}
              {data.current_weather.temperature}{" "}
              {data.current_weather_units.temperature}
            </h2>
            <p>
              <FontAwesomeIcon icon={faWind} /> {data.current_weather.windspeed}{" "}
              {data.current_weather_units.windspeed}
            </p>
            <p>{getWeatherDescription(data.current_weather.weathercode)}</p>
          </div>
          <div className="weather-timeline">
            {data.hourly.time.map((time, index) => (
              <div key={time} className="weather-timeline-item">
                <div className="weather-timeline-time">
                  {new Date(time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="weather-timeline-details">
                  <div className="weather-timeline-temperature">
                    {data.hourly.temperature_2m[index]}°C
                  </div>
                  <div className="weather-timeline-description">
                    {getWeatherDescription(data.hourly.weathercode[index])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
