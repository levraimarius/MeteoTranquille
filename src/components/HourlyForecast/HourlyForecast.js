import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureThreeQuarters,
  faClock,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";
import "./HourlyForecast.scss";

// Ce composant affiche les prévisions horaires.
const HourlyForecast = ({
  data,
  selectedSuggestion,
  formatTime,
  getWeatherDescription,
}) => (
  <div className="hourly-forecast">
    <div className="hourly-forecast-scroll">
      <ul>
        {data.hourly.time.map((time, index) => (
          <li key={index}>
            <p>{getWeatherDescription(data.hourly.weathercode[index])}</p>
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
);

export default HourlyForecast;
