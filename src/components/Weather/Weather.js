import React, { useState, useCallback, useEffect } from "react";
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

      const hourlyData = {
        time: hourlyForecast.slice(forecastStartIndex, forecastStartIndex + 24),
        temperature: response.data.hourly.temperature_2m.slice(
          forecastStartIndex,
          forecastStartIndex + 24
        ),
        weathercode: response.data.hourly.weathercode.slice(
          forecastStartIndex,
          forecastStartIndex + 24
        ),
        windspeed: response.data.hourly.wind_speed_10m.slice(
          forecastStartIndex,
          forecastStartIndex + 24
        ),
      };

      setData({
        ...response.data,
        hourly: hourlyData,
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
      case 53:
      case 55:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersWater} /> Bruine
          </>
        );
      case 61:
      case 63:
      case 65:
        return (
          <>
            <FontAwesomeIcon icon={faCloudRain} /> Pluie
          </>
        );
      case 80:
      case 81:
      case 82:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersHeavy} /> Averses
          </>
        );
      case 95:
        return (
          <>
            <FontAwesomeIcon icon={faBolt} /> Orages
          </>
        );
      case 99:
        return (
          <>
            <FontAwesomeIcon icon={faBolt} /> Violents orages
          </>
        );
      case 85:
      case 86:
        return (
          <>
            <FontAwesomeIcon icon={faCloudShowersHeavy} /> Neige
          </>
        );
      default:
        return (
          <>
            <FontAwesomeIcon icon={faSun} /> Ciel clair
          </>
        );
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

  // Applique la classe de fond au body
  const getWeatherBackgroundClass = (weatherCode) => {
    const body = document.body;

    body.classList.remove(
      "clear-sky",
      "partly-cloudy",
      "cloudy",
      "foggy",
      "drizzle",
      "rainy",
      "stormy",
      "snowy"
    );

    if (weatherCode === 1 || weatherCode === 2)
      body.classList.add("partly-cloudy");
    else if (weatherCode === 3) body.classList.add("cloudy");
    else if (weatherCode >= 45 && weatherCode <= 48)
      body.classList.add("foggy");
    else if (weatherCode >= 51 && weatherCode <= 55)
      body.classList.add("drizzle");
    else if (weatherCode >= 61 && weatherCode <= 82)
      body.classList.add("rainy");
    else if (weatherCode >= 95 && weatherCode <= 99)
      body.classList.add("stormy");
    else if (weatherCode >= 85 && weatherCode <= 86)
      body.classList.add("snowy");
    else body.classList.add("clear-sky");
  };

  // Utilisation d'un useEffect pour déclencher la mise à jour du fond du body
  useEffect(() => {
    if (data?.current_weather) {
      getWeatherBackgroundClass(data.current_weather.weathercode);
    }
  }, [data?.current_weather]);

  return (
    <div className="weather-container">
      <div className="weather-form">
        <h1>
          <FontAwesomeIcon icon={faSun} /> Météo Tranquille
        </h1>
        <p>La météo préférée des français tranquille</p>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Entrez un nom de ville ou un code postal"
        />
        {status === "loading" && <p>Chargement...</p>}
        {error && <p className="error-message">{error}</p>}
        <ul>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {formatSuggestion(suggestion)}
            </li>
          ))}
        </ul>
      </div>
      {selectedSuggestion && (
        <div className="weather-info">
          <div className="actual-forecast">
            <h2>
              <FontAwesomeIcon icon={faLocationDot} />{" "}
              {selectedSuggestion.city_name}
            </h2>
            {data?.current_weather && (
              <>
                <p>{getWeatherDescription(data.current_weather.weathercode)}</p>
                <p>
                  <FontAwesomeIcon icon={faTemperatureThreeQuarters} />{" "}
                  Température : {data.current_weather.temperature}°C
                </p>
                <p>
                  <FontAwesomeIcon icon={faWind} /> Vent :{" "}
                  {data.current_weather.windspeed} km/h
                </p>
              </>
            )}
          </div>
          {data?.hourly && (
            <div className="hourly-forecast">
              <div className="hourly-forecast-scroll">
                <ul>
                  {data.hourly.time.map((time, index) => (
                    <li key={index}>
                      <p>
                        {new Date(time).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        {getWeatherDescription(data.hourly.weathercode[index])}
                      </p>
                      <p>{data.hourly.temperature[index]}°C</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Weather;
