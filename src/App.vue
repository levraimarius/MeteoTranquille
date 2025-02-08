<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import type { WeatherData } from "./types/weather";
import type { CityData } from "./types/weather";
import WeatherCard from "./components/WeatherCard.vue";
import WeatherAnimations from "./components/WeatherAnimations.vue";

const weather = ref<WeatherData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const suggestions = ref<CityData[]>([]);
const isSearchOpen = ref(false);
const showSuggestions = ref(false);

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

const API_KEY = "d43e9730fe896028d7f76cca8b066475"; // OpenWeatherMap API key
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_API_URL = "https://geo.api.gouv.fr/communes";

async function getWeather(cityName: string) {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get(API_URL, {
      params: {
        q: cityName,
        appid: API_KEY,
        units: "metric",
        lang: "fr",
      },
    });
    weather.value = response.data;
  } catch (e) {
    error.value = "Impossible de récupérer les données météo";
  } finally {
    loading.value = false;
  }
}

async function searchCities(query: string) {
  if (query.length < 2) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await axios.get(GEO_API_URL, {
      params: {
        nom: query,
        boost: "population",
        limit: 5,
        fields: "nom,code,codeDepartement,departement,region,population",
      },
    });
    suggestions.value = response.data;
    showSuggestions.value = true;
  } catch (e) {
    suggestions.value = [];
  }
}

function selectCity(city: CityData) {
  searchQuery.value = city.nom;
  isSearchOpen.value = false;
  showSuggestions.value = false;
  getWeather(city.nom);
}

onMounted(() => {
  getWeather("Paris");
});
</script>

<template>
  <div class="min-h-screen">
    <WeatherAnimations
      v-if="weather"
      :weather-type="weather.weather[0].main"
      class="z-0"
    />

    <!-- Barre de navigation -->
    <nav class="sticky top-0 z-50">
      <div
        class="absolute inset-0 border-b bg-black/30 backdrop-blur-lg border-white/20"
      ></div>
      <div class="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div
            class="flex items-center space-x-4"
            :class="{ 'hidden sm:flex': isSearchOpen }"
          >
            <div
              class="w-10 h-10 transition-all duration-500 ease-in-out"
              :class="{ 'scale-0 opacity-0': isSearchOpen }"
            >
              <svg
                class="w-full h-full text-yellow-400 animate-spin-slow filter drop-shadow-glow"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="6" fill="currentColor" />
                <path
                  d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              class="transition-all duration-500 ease-in-out transform"
              :class="{ 'opacity-0 -translate-x-8': isSearchOpen }"
            >
              <h1 class="text-lg font-bold text-white sm:text-xl">
                Météo Tranquille
              </h1>
              <div class="text-xs sm:text-sm text-white/70">
                Dernière mise à jour :
                {{ new Date().toLocaleTimeString("fr-FR") }}
              </div>
            </div>
          </div>

          <button
            @click="isSearchOpen = true"
            class="p-2 text-white transition-colors rounded-lg sm:hidden hover:bg-white/10"
            :class="{ hidden: isSearchOpen }"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <div
            class="flex items-center space-x-4 overflow-visible"
            :class="{
              'absolute inset-x-0 top-0 h-16 px-4 sm:px-6 lg:px-8 backdrop-blur-lg border-b border-white/20 justify-between sm:relative sm:h-auto sm:px-0 sm:bg-transparent sm:border-0': true,
              'translate-y-0 opacity-100': isSearchOpen,
              'translate-y-[-100%] opacity-0 pointer-events-none sm:translate-y-0 sm:opacity-100 sm:pointer-events-auto':
                !isSearchOpen,
            }"
          >
            <button
              @click="isSearchOpen = false"
              class="p-2 text-white transition-colors rounded-lg sm:hidden hover:bg-white/10"
              v-if="isSearchOpen"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              class="relative flex-1 transition-all duration-300 ease-in-out transform sm:w-96"
              :class="{
                'scale-100 opacity-100': isSearchOpen,
                'scale-95 opacity-0 sm:scale-100 sm:opacity-100': !isSearchOpen,
              }"
            >
              <input
                v-model="searchQuery"
                @input="searchCities(searchQuery)"
                @keyup.enter="getWeather(searchQuery)"
                @blur="hideSuggestions"
                @focus="showSuggestions = true"
                type="text"
                placeholder="Entrez une ville..."
                class="w-full px-4 py-2 text-white border rounded-lg bg-white/10 backdrop-blur-lg placeholder-white/70 border-white/30 focus:outline-none focus:border-white"
              />

              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute w-full mt-1 overflow-hidden rounded-lg shadow-lg bg-white/95 backdrop-blur-lg"
                style="max-width: inherit; z-index: 9999"
              >
                <button
                  v-for="city in suggestions"
                  :key="city.code"
                  @click="selectCity(city)"
                  class="w-full px-4 py-3 text-left transition-colors border-b border-gray-100 hover:bg-gray-100 last:border-none"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900">
                      {{ city.nom }}
                      <span class="ml-1 text-sm text-gray-500"
                        >({{ city.codeDepartement }})</span
                      >
                    </span>
                    <span class="text-sm text-gray-600">
                      {{ city.departement.nom }} - {{ city.region.nom }}
                    </span>
                  </div>
                </button>
              </div>

              <div
                v-else-if="
                  searchQuery && suggestions.length === 0 && showSuggestions
                "
                class="absolute w-full p-3 mt-1 text-gray-600 rounded-lg bg-white/95 backdrop-blur-lg"
                style="max-width: inherit; z-index: 9999"
              >
                Aucune ville trouvée
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main
      class="relative z-10 w-full px-2 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8"
    >
      <div v-if="loading" class="text-center text-white">Chargement...</div>
      <div v-else-if="error" class="text-center text-red-200">
        {{ error }}
      </div>
      <WeatherCard v-else-if="weather" :weather="weather" />
    </main>
  </div>
</template>
