<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import type { WeatherData } from "../types/weather";
import WeatherIcon from "./WeatherIcon.vue";

const props = defineProps<{
  weather: WeatherData;
}>();

interface ForecastData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

const forecast = ref<ForecastData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const API_KEY = "d43e9730fe896028d7f76cca8b066475";

async function getForecast() {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: props.weather.name,
          appid: API_KEY,
          units: "metric",
          lang: "fr",
        },
      }
    );
    forecast.value = response.data.list.slice(0, 8); // Prochaines 24h (toutes les 3h)
  } catch (e) {
    error.value = "Impossible de récupérer les prévisions";
  } finally {
    loading.value = false;
  }
}

function formatHour(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(getForecast);
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div
      class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
    >
      <h2 class="mb-2 text-2xl font-bold">
        Prévisions pour {{ weather.name }}
      </h2>
      <p class="text-white/70">Prochaines 24 heures</p>
    </div>

    <!-- Prévisions -->
    <div v-if="loading" class="py-12 text-center text-white">
      Chargement des prévisions...
    </div>

    <div
      v-else-if="error"
      class="p-6 text-center text-white bg-red-500/20 backdrop-blur-lg rounded-xl"
    >
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in forecast"
        :key="item.dt"
        class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="text-lg font-medium">
            {{ formatHour(item.dt_txt) }}
          </div>
          <WeatherIcon :type="item.weather[0].main" class="w-12 h-12" />
        </div>

        <div class="space-y-4">
          <div class="text-center">
            <div class="text-3xl font-bold">
              {{ Math.round(item.main.temp) }}°C
            </div>
            <div class="text-sm opacity-75">
              Ressenti {{ Math.round(item.main.feels_like) }}°C
            </div>
          </div>

          <div class="text-sm text-center capitalize">
            {{ item.weather[0].description }}
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div class="opacity-75">Humidité</div>
              <div>{{ item.main.humidity }}%</div>
            </div>
            <div>
              <div class="opacity-75">Vent</div>
              <div>{{ Math.round(item.wind.speed * 3.6) }} km/h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
