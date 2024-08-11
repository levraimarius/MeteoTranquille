import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureArrowUp,
  faTemperatureArrowDown,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";

const DailyForecast = ({ data, getWeatherDescription }) => (
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
            <p>{getWeatherDescription(data.daily.weathercode[index])}</p>
            <p>
              <FontAwesomeIcon icon={faDroplet} />{" "}
              {data.daily.precipitation_sum[index]} mm
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default DailyForecast;
