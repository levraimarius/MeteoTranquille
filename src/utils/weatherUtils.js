import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCloud,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudShowersWater,
  faCloudSun,
  faSmog,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

export const getWeatherDescription = (weatherCode) => {
  const weatherDescriptions = {
    0: { icon: faSun, text: "Ciel clair" },
    1: { icon: faCloudSun, text: "Partiellement clair" },
    2: { icon: faCloudSun, text: "Partiellement nuageux" },
    3: { icon: faCloud, text: "Nuageux" },
    45: { icon: faSmog, text: "Brouillard" },
    48: { icon: faSmog, text: "Brouillard givrant" },
    51: { icon: faCloudShowersWater, text: "Bruine légère" },
    53: { icon: faCloudShowersWater, text: "Bruine modérée" },
    55: { icon: faCloudShowersWater, text: "Bruine dense" },
    61: { icon: faCloudRain, text: "Pluie légère" },
    63: { icon: faCloudRain, text: "Pluie modérée" },
    65: { icon: faCloudRain, text: "Pluie forte" },
    80: { icon: faCloudShowersHeavy, text: "Averses légères" },
    81: { icon: faCloudShowersHeavy, text: "Averses modérées" },
    82: { icon: faCloudShowersHeavy, text: "Averses fortes" },
    95: { icon: faBolt, text: "Orages" },
    96: { icon: faBolt, text: "Orages avec grêle" },
    99: { icon: faBolt, text: "Orages fort avec grêle" },
  };

  const description = weatherDescriptions[weatherCode];
  if (!description) return "Conditions météo inconnues";

  return (
    <>
      <FontAwesomeIcon icon={description.icon} /> {description.text}
    </>
  );
};

export const formatTime = (time, timezone) => {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
};

export const filterPostcodes = (postcodes) => {
  if (!Array.isArray(postcodes)) return [];
  return postcodes.filter((postcode) => !postcode.includes("CEDEX"));
};

export const formatPostcodes = (postcodes) => {
  if (!Array.isArray(postcodes) || postcodes.length === 0) return "";
  return postcodes.length > 1 ? `${postcodes[0]}...` : postcodes[0];
};

export const formatSuggestion = (suggestion) => {
  const parts = [];
  if (suggestion.city_name) parts.push(suggestion.city_name);
  if (formatPostcodes(filterPostcodes(suggestion.postcodes)))
    parts.push(formatPostcodes(filterPostcodes(suggestion.postcodes)));
  if (suggestion.admin2) parts.push(suggestion.admin2);
  if (suggestion.admin1) parts.push(suggestion.admin1);
  if (suggestion.country) parts.push(suggestion.country);

  return parts.join(", ");
};
