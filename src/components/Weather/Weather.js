import React, { useState, useEffect } from "react";
import "./Weather.scss";
import WeatherForm from "../WeatherForm/WeatherForm";
import CurrentWeather from "../CurrentForecast/CurrentForecast";
import HourlyForecast from "../HourlyForecast/HourlyForecast";
import DailyForecast from "../DailyForecast/DailyForecast";
import { useFetchSuggestions } from "../../hooks/useFetchSuggestions";
import { useFetchWeather } from "../../hooks/useFetchWeather";
import {
  formatTime,
  getWeatherDescription,
  formatSuggestion,
} from "../../utils/weatherUtils";

const Weather = () => {
  const [query, setQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [suggestions, setSuggestions] = useState([]);

  const {
    suggestions: fetchedSuggestions,
    fetchSuggestions,
    status,
    error,
  } = useFetchSuggestions();
  const { data, fetchWeather } = useFetchWeather();

  useEffect(() => {
    setSuggestions(fetchedSuggestions);
  }, [fetchedSuggestions]);

  const handleChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.city_name);
    setSelectedSuggestion(suggestion);
    await fetchWeather(
      suggestion.latitude,
      suggestion.longitude,
      suggestion.timezone
    );
    setSuggestions([]);
  };

  const getWeatherClass = (weatherCode) => {
    const weatherClasses = {
      0: "clear-sky",
      1: "partly-cloudy",
      2: "partly-cloudy",
      3: "cloudy",
      45: "foggy",
      48: "foggy",
      51: "drizzle",
      53: "drizzle",
      55: "drizzle",
      61: "rainy",
      63: "rainy",
      65: "rainy",
      80: "rainy",
      81: "rainy",
      82: "rainy",
      95: "stormy",
      96: "stormy",
      99: "stormy",
    };

    return weatherClasses[weatherCode] || "unknown";
  };

  useEffect(() => {
    if (data?.current_weather) {
      const weatherClass = getWeatherClass(data.current_weather.weathercode);
      document.body.className = weatherClass;
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
    document.title = selectedSuggestion
      ? `Météo Tranquille - ${selectedSuggestion.city_name}`
      : "Météo Tranquille";
  }, [selectedSuggestion]);

  return (
    <div className="weather-container">
      <WeatherForm
        query={query}
        handleChange={handleChange}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        error={error}
        status={status}
        formatSuggestion={formatSuggestion}
      />
      {selectedSuggestion && (
        <div className="weather-info">
          <CurrentWeather
            data={data}
            selectedSuggestion={selectedSuggestion}
            formatTime={formatTime}
            currentTime={currentTime}
            getWeatherDescription={getWeatherDescription}
          />
          {data?.hourly && (
            <HourlyForecast
              data={data}
              selectedSuggestion={selectedSuggestion}
              formatTime={formatTime}
              getWeatherDescription={getWeatherDescription}
            />
          )}
          {data?.daily && (
            <DailyForecast
              data={data}
              getWeatherDescription={getWeatherDescription}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Weather;
