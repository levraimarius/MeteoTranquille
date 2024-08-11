import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureThreeQuarters,
  faLocationDot,
  faClock,
  faWind,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";

const CurrentForecast = ({
  data,
  selectedSuggestion,
  formatTime,
  currentTime,
  getWeatherDescription,
}) => (
  <div className="actual-forecast">
    {data?.current_weather && (
      <>
        <div>
          <p>
            <FontAwesomeIcon icon={faTemperatureThreeQuarters} />{" "}
            {data.current_weather.temperature}
            {data.current_weather_units.temperature}
          </p>
          <p>{getWeatherDescription(data.current_weather.weathercode)}</p>
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
            <FontAwesomeIcon icon={faWind} /> {data.current_weather.windspeed}
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
);

export default CurrentForecast;
