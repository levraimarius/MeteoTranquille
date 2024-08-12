import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import "./WeatherForm.scss";

// Ce composant affiche un formulaire de recherche pour entrer une ville ou un code postal.
// Il gère également les suggestions basées sur l'entrée utilisateur et affiche des messages d'erreur le cas échéant.
const WeatherForm = ({
  query,
  handleChange,
  suggestions,
  handleSuggestionClick,
  error,
  status,
  formatSuggestion,
}) => (
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
    <ul className={suggestions.length > 0 ? "visible" : "hidden"}>
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
);

export default WeatherForm;
