<script setup lang="ts">
import type { WeatherData } from "../types/weather";
import WeatherIcon from "./WeatherIcon.vue";

const props = defineProps<{
  weather: WeatherData;
}>();

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWindDirection(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function formatVisibility(meters: number): string {
  return (meters / 1000).toFixed(1) + " km";
}

const qualityIndex = Math.round(
  (props.weather.main.humidity + props.weather.clouds.all) / 2
);
function getAirQuality() {
  if (qualityIndex < 30) return { text: "Excellente", color: "text-green-400" };
  if (qualityIndex < 50) return { text: "Bonne", color: "text-green-300" };
  if (qualityIndex < 70) return { text: "Moyenne", color: "text-yellow-300" };
  return { text: "Médiocre", color: "text-red-300" };
}

const airQuality = getAirQuality();
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête avec l'icône -->
    <div
      class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold">{{ weather.name }}</h2>
          <p class="text-lg opacity-75">Détails complets</p>
        </div>
        <WeatherIcon :type="weather.weather[0].main" class="w-24 h-24" />
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Température et ressenti -->
        <div class="space-y-2">
          <div class="text-sm opacity-75">Température actuelle</div>
          <div class="text-4xl font-bold">
            {{ Math.round(weather.main.temp) }}°C
          </div>
          <div class="text-sm">
            Ressenti {{ Math.round(weather.main.feels_like) }}°C
          </div>
        </div>

        <!-- Min/Max -->
        <div class="space-y-2">
          <div class="text-sm opacity-75">Températures</div>
          <div class="flex space-x-4">
            <div>
              <div class="text-sm opacity-75">Min</div>
              <div class="text-xl">
                {{ Math.round(weather.main.temp_min) }}°C
              </div>
            </div>
            <div>
              <div class="text-sm opacity-75">Max</div>
              <div class="text-xl">
                {{ Math.round(weather.main.temp_max) }}°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditions atmosphériques -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div
        class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
      >
        <h3 class="mb-4 text-xl font-semibold">Conditions atmosphériques</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="opacity-75">Pression</span>
            <span class="font-medium">{{ weather.main.pressure }} hPa</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Humidité</span>
            <span class="font-medium">{{ weather.main.humidity }}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Visibilité</span>
            <span class="font-medium">{{
              formatVisibility(weather.visibility)
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Couverture nuageuse</span>
            <span class="font-medium">{{ weather.clouds.all }}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Qualité de l'air</span>
            <span :class="['font-medium', airQuality.color]">
              {{ airQuality.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Vent et ensoleillement -->
      <div
        class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
      >
        <h3 class="mb-4 text-xl font-semibold">Vent et ensoleillement</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="opacity-75">Vitesse du vent</span>
            <span class="font-medium"
              >{{ Math.round(weather.wind.speed * 3.6) }} km/h</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Direction</span>
            <span class="font-medium">{{
              formatWindDirection(weather.wind.deg)
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Lever du soleil</span>
            <span class="font-medium">{{
              formatTime(weather.sys.sunrise)
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Coucher du soleil</span>
            <span class="font-medium">{{
              formatTime(weather.sys.sunset)
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-75">Durée du jour</span>
            <span class="font-medium">
              {{
                Math.round((weather.sys.sunset - weather.sys.sunrise) / 3600)
              }}h
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Description et alertes -->
    <div
      class="p-6 text-white shadow-lg bg-white/20 backdrop-blur-lg rounded-xl"
    >
      <h3 class="mb-4 text-xl font-semibold">Description détaillée</h3>
      <div class="space-y-4">
        <p class="text-lg">
          {{
            weather.weather[0].description.charAt(0).toUpperCase() +
            weather.weather[0].description.slice(1)
          }}
          avec une température de {{ Math.round(weather.main.temp) }}°C. Le vent
          souffle à {{ Math.round(weather.wind.speed * 3.6) }} km/h en direction
          du {{ formatWindDirection(weather.wind.deg) }}.
        </p>
        <p>
          La visibilité est de {{ formatVisibility(weather.visibility) }} avec
          une couverture nuageuse de {{ weather.clouds.all }}%.
        </p>
      </div>
    </div>
  </div>
</template>
