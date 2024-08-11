import { useState, useCallback } from "react";
import axios from "axios";

export const useFetchWeather = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (lat, lon, timezone) => {
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
  }, []);

  return { data, fetchWeather, status, error };
};
