import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./Weather.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faClock,
  faCloud,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudShowersWater,
  faCloudSun,
  faDroplet,
  faLocationDot,
  faSmog,
  faSun,
  faTemperatureArrowDown,
  faTemperatureArrowUp,
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
  const [currentTime, setCurrentTime] = useState(new Date());

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
    const timezone = suggestion.timezone;
    await fetchWeather(suggestion.latitude, suggestion.longitude, timezone);
  };

  const fetchWeather = async (lat, lon, timezone) => {
    setStatus("loading");
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m,precipitation,wind_speed_10m,weathercode",
            daily:
              "temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum",
            current_weather: true,
            timezone: timezone,
          },
        }
      );

      const now = new Date();
      const currentHour = now.getHours();
      const hourlyForecast = response.data.hourly.time;

      const currentHourIndex = hourlyForecast.findIndex(
        (time) => new Date(time).getHours() === currentHour
      );

      const forecastStartIndex =
        currentHourIndex >= 0 ? currentHourIndex + 1 : 0;

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
        precipitation: response.data.hourly.precipitation.slice(
          forecastStartIndex,
          forecastStartIndex + 24
        ),
      };

      const dailyData = {
        time: response.data.daily.time.slice(0, 5),
        temperature_max: response.data.daily.temperature_2m_max.slice(0, 5),
        temperature_min: response.data.daily.temperature_2m_min.slice(0, 5),
        weathercode: response.data.daily.weathercode.slice(0, 5),
        precipitation_sum: response.data.daily.precipitation_sum.slice(0, 5),
      };

      setData({
        ...response.data,
        hourly: hourlyData,
        daily: dailyData,
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

  const formatTime = (time, timezone) => {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(time));
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
    else if (weatherCode >= 61 && weatherCode <= 65)
      body.classList.add("rainy");
    else if (weatherCode === 95 || weatherCode === 99)
      body.classList.add("stormy");
    else if (weatherCode === 85 || weatherCode === 86)
      body.classList.add("snowy");
    else body.classList.add("clear-sky");
  };

  useEffect(() => {
    if (data?.current_weather) {
      getWeatherBackgroundClass(data.current_weather.weathercode);
    }
  }, [data?.current_weather]);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date());
    };

    updateClock();

    const intervalId = setInterval(updateClock, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedSuggestion) {
      document.title = `Météo Tranquille - ${selectedSuggestion.city_name}`;
    } else {
      document.title = "Météo Tranquille";
    }
  }, [selectedSuggestion]);

  return (
    <div className="weather-container">
      <div className="weather-form">
        <h1>
          <FontAwesomeIcon icon={faSun} /> Météo Tranquille
        </h1>
        <p>La météo préférée des Français : tranquille.</p>
        <div className="input-container">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Entrez un nom de ville ou un code postal"
          />
          {status === "loading" && <div className="loading"></div>}
        </div>

        {error && <p className="error-message">{error}</p>}
        <ul className={suggestions.length > 0 ? "visible" : ""}>
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
            {data?.current_weather && (
              <>
                <div>
                  <p>
                    <FontAwesomeIcon icon={faTemperatureThreeQuarters} />{" "}
                    {data.current_weather.temperature}
                    {data.current_weather_units.temperature}
                  </p>
                  <p>
                    {getWeatherDescription(data.current_weather.weathercode)}
                  </p>
                </div>
                <div>
                  <p className="city-name">
                    <FontAwesomeIcon icon={faLocationDot} />{" "}
                    {selectedSuggestion.city_name}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faClock} />{" "}
                    {formatTime(currentTime, selectedSuggestion.timezone)}
                  </p>
                </div>
                <div>
                  <p>
                    <FontAwesomeIcon icon={faWind} />{" "}
                    {data.current_weather.windspeed}
                    {data.current_weather_units.windspeed}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faDroplet} />{" "}
                    {data.current_weather.precipitation || "N/A"} mm
                  </p>
                </div>
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
                        {getWeatherDescription(data.hourly.weathercode[index])}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faTemperatureThreeQuarters} />{" "}
                        {data.hourly.temperature[index]}
                        {data.current_weather_units.temperature}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faClock} />{" "}
                        {formatTime(time, selectedSuggestion.timezone)}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faDroplet} />{" "}
                        {data.hourly.precipitation[index]} mm
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {data?.daily && (
            <div className="daily-forecast">
              <div className="daily-forecast-scroll">
                <ul>
                  {data.daily.time.map((time, index) => (
                    <li key={index}>
                      <h3>
                        {new Intl.DateTimeFormat("fr-FR", {
                          weekday: "long",
                        }).format(new Date(time))}
                      </h3>
                      <p>
                        <FontAwesomeIcon icon={faTemperatureArrowUp} />{" "}
                        {data.daily.temperature_max[index]}
                        {data.current_weather_units.temperature}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faTemperatureArrowDown} />{" "}
                        {data.daily.temperature_min[index]}
                        {data.current_weather_units.temperature}
                      </p>
                      <p>
                        {getWeatherDescription(data.daily.weathercode[index])}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faDroplet} />{" "}
                        {data.daily.precipitation_sum[index]} mm
                      </p>
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
