import { useState, useCallback } from "react";
import axios from "axios";

// Custom hook pour récupérer les suggestions de villes en fonction de l'entrée utilisateur.
export const useFetchSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Fonction pour récupérer les suggestions depuis l'API.
  const fetchSuggestions = useCallback(async (input) => {
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
          params: { name: input, language: "fr" },
        }
      );

      // Filtre et organise les suggestions pour s'assurer qu'elles sont uniques.
      const uniqueSuggestions = new Map();
      response.data.results.forEach((item) => {
        const {
          name,
          country,
          postcodes,
          admin2,
          admin1,
          latitude,
          longitude,
          country_code,
        } = item;
        if (name && latitude && longitude) {
          const id = `${name}-${country_code}`;
          if (!uniqueSuggestions.has(id)) {
            uniqueSuggestions.set(id, {
              ...item,
              city_name: name,
              country,
              postcodes: postcodes || [],
              admin2,
              admin1,
            });
          }
        }
      });

      // Trie les suggestions par pays, en priorisant la France.
      const suggestionsArray = Array.from(uniqueSuggestions.values());
      suggestionsArray.sort((a, b) => {
        if (a.country === "France" && b.country !== "France") return -1;
        if (a.country !== "France" && b.country === "France") return 1;
        return a.city_name.localeCompare(b.city_name);
      });

      setSuggestions(suggestionsArray);
      setStatus("succeeded");
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions", error);
      setSuggestions([]);
      setError("Nous n'avons pas pu récupérer les suggestions.");
      setStatus("failed");
    }
  }, []);

  return { suggestions, fetchSuggestions, status, error };
};
