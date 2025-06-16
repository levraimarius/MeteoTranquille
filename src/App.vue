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
const locationStatus = ref<string>("");
const isUsingUserLocation = ref(false);

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

function openSearch() {
  isSearchOpen.value = true;
  // Focus sur l'input après l'ouverture
  setTimeout(() => {
    const input = document.querySelector('.mobile-search-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }, 100);
}

function closeSearch() {
  isSearchOpen.value = false;
  searchQuery.value = "";
  showSuggestions.value = false;
}

const API_KEY = "d43e9730fe896028d7f76cca8b066475";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_API_URL = "https://geo.api.gouv.fr/communes";

async function getWeatherByCity(cityName: string) {
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
    isUsingUserLocation.value = false;
  } catch (e) {
    error.value = "Impossible de récupérer les données météo";
  } finally {
    loading.value = false;
  }
}

async function getWeatherByCoordinates(lat: number, lon: number) {
  try {
    loading.value = true;
    error.value = null;
    locationStatus.value = "Récupération des données météo...";
    
    const response = await axios.get(API_URL, {
      params: {
        lat: lat,
        lon: lon,
        appid: API_KEY,
        units: "metric",
        lang: "fr",
      },
    });
    weather.value = response.data;
    isUsingUserLocation.value = true;
    locationStatus.value = "";
  } catch (e) {
    error.value = "Impossible de récupérer les données météo pour votre position";
    locationStatus.value = "";
    // Fallback sur Paris en cas d'erreur
    await getWeatherByCity("Paris");
  } finally {
    loading.value = false;
  }
}

async function getUserLocation() {
  return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par ce navigateur"));
      return;
    }

    locationStatus.value = "Demande d'autorisation de localisation...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Autorisation de localisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position indisponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai de localisation dépassé";
            break;
          default:
            errorMessage = "Erreur de localisation inconnue";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

async function initializeWeather() {
  try {
    locationStatus.value = "Détection de votre position...";
    const userLocation = await getUserLocation();
    locationStatus.value = "Position détectée !";
    await getWeatherByCoordinates(userLocation.lat, userLocation.lon);
  } catch (locationError) {
    console.log("Erreur de géolocalisation:", locationError);
    locationStatus.value = "Utilisation de la ville par défaut...";
    // Fallback sur Paris si la géolocalisation échoue
    await getWeatherByCity("Paris");
    setTimeout(() => {
      locationStatus.value = "";
    }, 2000);
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
  closeSearch();
  getWeatherByCity(city.nom);
}

async function refreshUserLocation() {
  if (isUsingUserLocation.value) {
    await initializeWeather();
  }
}

function handleSearchSubmit() {
  if (searchQuery.value.trim()) {
    getWeatherByCity(searchQuery.value.trim());
    closeSearch();
  }
}

onMounted(() => {
  initializeWeather();
});
</script>

<template>
  <div class="min-h-screen">
    <WeatherAnimations
      v-if="weather"
      :weather-type="weather.weather[0].main"
      class="z-0"
    />

    <!-- Barre de navigation responsive -->
    <nav class="sticky top-0 z-50">
      <div class="absolute inset-0 glass-nav"></div>
      <div class="relative">
        <!-- Navigation principale -->
        <div class="flex items-center justify-between h-14 px-3 mx-auto max-w-7xl sm:h-16 sm:px-4 md:px-6 lg:px-8">
          <!-- Logo et titre -->
          <div class="flex items-center space-x-2 flex-1 min-w-0 sm:space-x-3">
            <div class="w-7 h-7 flex-shrink-0 sm:w-8 sm:h-8 md:w-10 md:h-10">
              <svg
                class="w-full h-full text-yellow-300 animate-spin-slow filter drop-shadow-lg"
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
            <div class="min-w-0 flex-1">
              <h1 class="text-sm font-bold text-modern-primary sm:text-base md:text-lg lg:text-xl truncate">
                Météo Tranquille
              </h1>
              <div class="text-xs text-modern-secondary sm:text-xs md:text-sm truncate">
                <span v-if="locationStatus">{{ locationStatus }}</span>
                <span v-else>
                  Dernière mise à jour : {{ new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-1 flex-shrink-0 sm:space-x-2">
            <!-- Bouton de rafraîchissement de la géolocalisation -->
            <button
              v-if="isUsingUserLocation && !loading"
              @click="refreshUserLocation"
              class="p-1.5 transition-all duration-300 rounded-lg glass-button text-modern-primary hover-lift sm:p-2 sm:rounded-xl"
              title="Actualiser votre position"
            >
              <svg
                class="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <!-- Barre de recherche pour desktop -->
            <div class="hidden xl:block relative">
              <input
                v-model="searchQuery"
                @input="searchCities(searchQuery)"
                @keyup.enter="handleSearchSubmit"
                @blur="hideSuggestions"
                @focus="showSuggestions = true"
                type="text"
                placeholder="Entrez une ville..."
                class="w-72 px-4 py-2 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-300 2xl:w-80"
              />

              <!-- Suggestions pour desktop -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute w-full mt-2 overflow-hidden rounded-xl glass-suggestion animate-slide-in-up"
                style="z-index: 9999"
              >
                <button
                  v-for="city in suggestions"
                  :key="city.code"
                  @click="selectCity(city)"
                  class="w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100/20 hover:bg-white/10 last:border-none"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-800">
                      {{ city.nom }}
                      <span class="ml-1 text-sm text-gray-600">({{ city.codeDepartement }})</span>
                    </span>
                    <span class="text-sm text-gray-600">
                      {{ city.departement.nom }} - {{ city.region.nom }}
                    </span>
                  </div>
                </button>
              </div>

              <div
                v-else-if="searchQuery && suggestions.length === 0 && showSuggestions"
                class="absolute w-full p-3 mt-2 text-gray-600 rounded-xl glass-suggestion animate-fade-in"
                style="z-index: 9999"
              >
                Aucune ville trouvée
              </div>
            </div>

            <!-- Bouton de recherche pour mobile et tablette -->
            <button
              @click="openSearch"
              class="p-1.5 transition-all duration-300 rounded-lg glass-button text-modern-primary hover-lift xl:hidden sm:p-2 sm:rounded-xl"
              aria-label="Rechercher une ville"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6"
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
          </div>
        </div>

        <!-- Modal de recherche mobile/tablette -->
        <div
          v-if="isSearchOpen"
          class="fixed inset-0 z-50 xl:hidden"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            @click="closeSearch"
          ></div>
          
          <!-- Modal de recherche -->
          <div class="relative z-60 flex items-start justify-center min-h-screen p-3 pt-12 sm:p-4 sm:pt-16">
            <div class="w-full max-w-lg glass-card rounded-2xl p-4 animate-slide-in-up sm:p-6">
              <!-- En-tête de la recherche -->
              <div class="flex items-center space-x-3 mb-6 sm:space-x-4">
                <button
                  @click="closeSearch"
                  class="p-2 transition-all duration-300 rounded-xl glass-button text-modern-primary hover-lift flex-shrink-0"
                  aria-label="Fermer la recherche"
                >
                  <svg
                    class="w-5 h-5 sm:w-6 sm:h-6"
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
                
                <div class="flex-1">
                  <input
                    v-model="searchQuery"
                    @input="searchCities(searchQuery)"
                    @keyup.enter="handleSearchSubmit"
                    @focus="showSuggestions = true"
                    type="text"
                    placeholder="Entrez une ville..."
                    class="mobile-search-input w-full px-4 py-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all duration-300 text-base sm:text-lg"
                  />
                </div>
              </div>

              <!-- Suggestions pour mobile/tablette -->
              <div v-if="showSuggestions && suggestions.length > 0" class="space-y-2 max-h-80 overflow-y-auto scrollbar-modern">
                <button
                  v-for="city in suggestions"
                  :key="city.code"
                  @click="selectCity(city)"
                  class="w-full p-3 text-left transition-all duration-200 rounded-xl hover:bg-white/10 glass-button sm:p-4"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-modern-primary text-base sm:text-lg">
                      {{ city.nom }}
                      <span class="ml-1 text-sm text-modern-secondary">({{ city.codeDepartement }})</span>
                    </span>
                    <span class="text-sm text-modern-accent mt-1">
                      {{ city.departement.nom }} - {{ city.region.nom }}
                    </span>
                  </div>
                </button>
              </div>

              <div
                v-else-if="searchQuery && suggestions.length === 0 && showSuggestions"
                class="p-6 text-center text-modern-secondary sm:p-8"
              >
                <svg class="w-12 h-12 mx-auto mb-3 text-modern-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.291-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p class="text-lg">Aucune ville trouvée</p>
                <p class="text-sm text-modern-accent mt-1">Essayez un autre nom de ville</p>
              </div>

              <!-- État vide -->
              <div v-else-if="!searchQuery" class="p-6 text-center text-modern-secondary sm:p-8">
                <svg class="w-12 h-12 mx-auto mb-3 text-modern-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="text-lg">Rechercher une ville</p>
                <p class="text-sm text-modern-accent mt-1">Tapez le nom d'une ville pour voir la météo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="relative z-10 w-full px-3 py-3 mx-auto max-w-7xl sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div v-if="loading" class="text-center text-modern-primary animate-pulse">
        <div class="inline-block w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin sm:w-8 sm:h-8"></div>
        <p class="mt-3 text-base sm:text-lg">{{ locationStatus || 'Chargement...' }}</p>
      </div>
      
      <div v-else-if="error" class="text-center text-red-200 animate-fade-in">
        <div class="p-4 rounded-2xl glass-card sm:p-6">
          <svg class="w-10 h-10 mx-auto mb-3 text-red-300 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.18 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-base sm:text-lg">{{ error }}</p>
        </div>
      </div>
      
      <WeatherCard v-else-if="weather" :weather="weather" class="animate-slide-in-up" />
    </main>
  </div>
</template>