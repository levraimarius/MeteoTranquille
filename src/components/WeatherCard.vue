<script setup lang="ts">
import { useTransition } from "@vueuse/core";
import { onMounted, onUnmounted, ref, type Ref } from "vue";
import axios from "axios";
import type {
  WeatherData,
  ForecastData,
  DailyForecast,
  ForecastApiResponse,
} from "../types/weather";
import WeatherIcon from "./WeatherIcon.vue";
import CountryFlag from "./CountryFlag.vue";

const props = defineProps<{
  weather: WeatherData;
}>();

const forecast = ref<ForecastData[]>([]);
const forecastLoading = ref(true);
const forecastError = ref<string | null>(null);
const hourlyForecastScroll = ref<HTMLDivElement | null>(null);
const dailyForecastScroll = ref<HTMLDivElement | null>(null);
const dailyForecast: Ref<DailyForecast[]> = ref([]);

function handleResize() {
  if (typeof window === "undefined") return;
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

function scrollHourlyForecast(direction: "left" | "right") {
  if (!hourlyForecastScroll.value) return;

  const scrollAmount = direction === "left" ? -200 : 200;
  hourlyForecastScroll.value.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });
}

function scrollDailyForecast(direction: "left" | "right") {
  if (!dailyForecastScroll.value) return;

  const scrollAmount = direction === "left" ? -200 : 200;
  dailyForecastScroll.value.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });
}

const API_KEY = "d43e9730fe896028d7f76cca8b066475";

async function getForecast() {
  try {
    forecastLoading.value = true;
    forecastError.value = null;

    const response = await axios.get<ForecastApiResponse>(
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

    forecast.value = response.data.list.slice(0, 8) as ForecastData[];

    const dailyData = response.data.list.reduce<DailyForecast[]>(
      (acc, curr) => {
        const date = new Date(curr.dt * 1000).toLocaleDateString();
        const accObj = acc.reduce<Record<string, DailyForecast>>(
          (obj, item) => {
            const itemDate = new Date(item.dt * 1000).toLocaleDateString();
            obj[itemDate] = item;
            return obj;
          },
          {}
        );

        if (!accObj[date]) {
          const newForecast: DailyForecast = {
            dt: curr.dt,
            main: curr.main,
            temp: {
              min: curr.main.temp,
              max: curr.main.temp,
              day: curr.main.temp,
            },
            weather: curr.weather,
            wind: curr.wind,
            speed: curr.wind.speed,
            pop: curr.pop ?? 0,
            dt_txt: curr.dt_txt,
          };
          acc.push(newForecast);
        } else {
          const existingForecast = accObj[date];
          existingForecast.temp.min = Math.min(
            existingForecast.temp.min,
            curr.main.temp
          );
          existingForecast.temp.max = Math.max(
            existingForecast.temp.max,
            curr.main.temp
          );
          if (new Date(curr.dt * 1000).getHours() === 12) {
            existingForecast.temp.day = curr.main.temp;
            existingForecast.weather = curr.weather;
          }
          existingForecast.pop = Math.max(
            existingForecast.pop ?? 0,
            curr.pop ?? 0
          );
        }
        return acc;
      },
      []
    );

    dailyForecast.value = dailyData.slice(0, 7);
  } catch (e) {
    forecastError.value = "Impossible de récupérer les prévisions";
  } finally {
    forecastLoading.value = false;
  }
}

function formatDay(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
  });
}

const temperature = useTransition(props.weather.main.temp);

function formatHour(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  if (qualityIndex < 30)
    return { text: "Excellente", color: "text-emerald-300" };
  if (qualityIndex < 50) return { text: "Bonne", color: "text-green-300" };
  if (qualityIndex < 70) return { text: "Moyenne", color: "text-yellow-300" };
  return { text: "Médiocre", color: "text-red-300" };
}

const airQuality = getAirQuality();

onMounted(getForecast);
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Carte principale -->
    <div
      class="p-4 shadow-lg text-modern-primary glass-card rounded-2xl sm:p-6"
    >
      <div
        class="flex flex-col items-start mb-4 space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:mb-6"
      >
        <h2 class="text-xl font-bold sm:text-2xl md:text-3xl">
          {{ weather.name }}
        </h2>
        <CountryFlag :countryCode="weather.sys.country" size="md" />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
        <div class="flex items-center justify-center">
          <WeatherIcon :type="weather.weather[0].main" class="flex-shrink-0" />
          <div class="flex flex-col ml-4 sm:ml-6">
            <div class="text-4xl font-light sm:text-5xl md:text-6xl">
              {{ Math.round(temperature) }}°C
            </div>
            <div class="mt-1 text-sm text-modern-secondary sm:mt-2">
              Ressenti {{ Math.round(weather.main.feels_like) }}°C
            </div>
          </div>
        </div>

        <div class="space-y-3 sm:space-y-4">
          <div class="text-lg text-center capitalize sm:text-xl md:text-left">
            {{ weather.weather[0].description }}
            <div class="mt-1 text-xs text-modern-accent sm:mt-2 sm:text-sm">
              Mise à jour :
              {{
                new Date(weather.dt * 1000).toLocaleString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div class="p-3 rounded-xl bg-white/10">
              <div class="text-xs text-modern-accent sm:text-sm">Min</div>
              <div class="flex items-center text-base font-medium sm:text-lg">
                <svg
                  class="w-3 h-3 mr-1 text-blue-300 sm:w-4 sm:h-4 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {{ Math.round(weather.main.temp_min) }}°C
              </div>
            </div>
            <div class="p-3 rounded-xl bg-white/10">
              <div class="text-xs text-modern-accent sm:text-sm">Max</div>
              <div class="flex items-center text-base font-medium sm:text-lg">
                <svg
                  class="w-3 h-3 mr-1 text-red-300 sm:w-4 sm:h-4 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                {{ Math.round(weather.main.temp_max) }}°C
              </div>
            </div>
          </div>

          <div
            class="pt-3 mt-3 text-xs border-t text-modern-accent border-white/20 sm:pt-4 sm:mt-4 sm:text-sm"
          >
            <div class="flex items-center justify-between">
              <span>Population</span>
              <span class="text-modern-secondary">
                {{
                  new Intl.NumberFormat("fr-FR").format(weather.population || 0)
                }}
                hab.
              </span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <span>Altitude</span>
              <span class="text-modern-secondary"
                >{{ Math.round(weather.coord?.alt || 0) }} m</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisions 24h -->
    <div
      class="p-4 overflow-hidden shadow-lg text-modern-primary glass-card rounded-2xl sm:p-6"
    >
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <h3 class="text-lg font-semibold sm:text-xl">Prévisions 24h</h3>

        <div class="hidden space-x-2 lg:flex">
          <button
            @click="scrollHourlyForecast('left')"
            class="p-2 transition-all duration-300 rounded-xl glass-button hover-lift"
            aria-label="Voir les prévisions précédentes"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            @click="scrollHourlyForecast('right')"
            class="p-2 transition-all duration-300 rounded-xl glass-button hover-lift"
            aria-label="Voir les prévisions suivantes"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="forecastLoading" class="py-6 text-center sm:py-8">
        <div
          class="inline-block w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin sm:w-6 sm:h-6"
        ></div>
        <p class="mt-2 text-sm text-modern-secondary sm:text-base">
          Chargement des prévisions...
        </p>
      </div>

      <div v-else-if="forecastError" class="py-4 text-center text-red-200">
        {{ forecastError }}
      </div>

      <div
        v-else
        ref="hourlyForecastScroll"
        class="flex gap-2 pb-4 -mb-4 overflow-x-auto scrollbar-modern sm:gap-3 snap-x snap-mandatory"
      >
        <div
          v-for="item in forecast"
          :key="item.dt"
          class="flex-none w-[120px] sm:w-[140px] md:w-[170px] p-3 rounded-xl bg-white/10 snap-start transition-all duration-300 sm:p-4"
        >
          <div
            class="mb-2 text-xs text-center text-modern-secondary sm:mb-3 sm:text-sm"
          >
            {{ formatHour(item.dt_txt) }}
          </div>

          <div class="flex flex-col items-center">
            <WeatherIcon
              :type="item.weather[0].main"
              class="mb-2 scale-50 sm:mb-3"
            />
            <div class="text-lg font-semibold sm:text-xl">
              {{ Math.round(item.main.temp) }}°C
            </div>
            <div class="mt-1 text-xs text-modern-accent sm:mt-2">
              {{ Math.round(item.wind.speed * 3.6) }} km/h
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisions 7 jours -->
    <div
      class="p-4 shadow-lg text-modern-primary glass-card rounded-2xl sm:p-6"
    >
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <h3 class="text-lg font-semibold sm:text-xl">Prévisions 7 jours</h3>

        <div class="hidden space-x-2 lg:flex">
          <button
            @click="scrollDailyForecast('left')"
            class="p-2 transition-all duration-300 rounded-xl glass-button hover-lift"
            aria-label="Voir les prévisions précédentes"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            @click="scrollDailyForecast('right')"
            class="p-2 transition-all duration-300 rounded-xl glass-button hover-lift"
            aria-label="Voir les prévisions suivantes"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="forecastLoading" class="py-6 text-center sm:py-8">
        <div
          class="inline-block w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin sm:w-6 sm:h-6"
        ></div>
        <p class="mt-2 text-sm text-modern-secondary sm:text-base">
          Chargement des prévisions...
        </p>
      </div>

      <div v-else-if="forecastError" class="py-4 text-center text-red-200">
        {{ forecastError }}
      </div>

      <div
        v-else
        ref="dailyForecastScroll"
        class="flex gap-2 pb-4 -mb-4 overflow-x-auto scrollbar-modern sm:gap-3"
      >
        <div
          v-for="item in dailyForecast"
          :key="item.dt"
          class="flex-none w-[150px] sm:w-[170px] md:w-[210px] p-3 rounded-xl bg-white/10 transition-all duration-300 sm:p-4"
        >
          <div
            class="flex flex-col items-center mb-2 sm:flex-row sm:justify-between sm:mb-3"
          >
            <div
              class="text-sm font-medium capitalize text-modern-secondary sm:text-base"
            >
              {{ formatDay(item.dt) }}
            </div>
            <WeatherIcon
              :type="item.weather[0].main"
              class="-my-2 scale-50 sm:my-0"
            />
          </div>

          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <div class="text-center">
              <div class="text-xs text-modern-accent">Min</div>
              <div class="text-base font-semibold sm:text-lg">
                {{ Math.round(item.temp.min) }}°C
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-modern-accent">Max</div>
              <div class="text-base font-semibold sm:text-lg">
                {{ Math.round(item.temp.max) }}°C
              </div>
            </div>
          </div>

          <div class="space-y-1 text-xs sm:text-sm">
            <div class="flex justify-between">
              <span class="text-modern-accent">Pluie</span>
              <span class="text-modern-secondary"
                >{{ Math.round((item.pop || 0) * 100) }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-modern-accent">Vent</span>
              <span class="text-modern-secondary"
                >{{ Math.round(item.speed * 3.6) }} km/h</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditions atmosphériques -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
      <div
        class="p-4 shadow-lg text-modern-primary glass-card rounded-2xl sm:p-6"
      >
        <h3 class="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Conditions atmosphériques
        </h3>
        <div class="space-y-3 sm:space-y-4">
          <div class="p-3 rounded-xl bg-white/10 sm:p-4">
            <div class="mb-2 text-xs text-modern-accent sm:text-sm">
              Indice de confort
            </div>
            <div class="relative h-2 overflow-hidden rounded-full bg-white/20">
              <div
                class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
                :style="{
                  width: `${
                    ((Math.round(weather.main.feels_like) -
                      Math.round(weather.main.temp_min)) /
                      (Math.round(weather.main.temp_max) -
                        Math.round(weather.main.temp_min))) *
                    100
                  }%`,
                }"
              ></div>
            </div>
          </div>

          <div class="space-y-2 sm:space-y-3">
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Ressenti</span>
              <span class="font-medium text-modern-secondary"
                >{{ Math.round(weather.main.feels_like) }}°C</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Pression</span>
              <span class="font-medium text-modern-secondary"
                >{{ weather.main.pressure }} hPa</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Humidité</span>
              <span class="font-medium text-modern-secondary"
                >{{ weather.main.humidity }}%</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Visibilité</span>
              <span class="font-medium text-modern-secondary">{{
                formatVisibility(weather.visibility)
              }}</span>
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Point de rosée</span>
              <span class="font-medium text-modern-secondary"
                >{{
                  Math.round(
                    weather.main.temp - (100 - weather.main.humidity) / 5
                  )
                }}°C</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Qualité de l'air</span>
              <span :class="['font-medium', airQuality.color]">{{
                airQuality.text
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vent et ensoleillement -->
      <div
        class="p-4 shadow-lg text-modern-primary glass-card rounded-2xl sm:p-6"
      >
        <h3 class="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Vent et ensoleillement
        </h3>
        <div class="space-y-3 sm:space-y-4">
          <div class="p-3 rounded-xl bg-white/10 sm:p-4">
            <div class="mb-2 text-xs text-modern-accent sm:mb-3 sm:text-sm">
              Rose des vents
            </div>
            <div class="relative w-20 h-20 mx-auto sm:w-24 sm:h-24">
              <div
                class="absolute inset-0 border-2 rounded-full border-white/30"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div
                  class="text-xl transition-transform duration-500 sm:text-2xl"
                  :style="{ transform: `rotate(${weather.wind.deg}deg)` }"
                >
                  ➤
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 sm:space-y-3">
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Vitesse du vent</span>
              <span class="font-medium text-modern-secondary"
                >{{ Math.round(weather.wind.speed * 3.6) }} km/h</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Direction</span>
              <span class="font-medium text-modern-secondary">{{
                formatWindDirection(weather.wind.deg)
              }}</span>
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Rafales</span>
              <span class="font-medium text-modern-secondary"
                >{{
                  Math.round((weather.wind.gust || weather.wind.speed) * 3.6)
                }}
                km/h</span
              >
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Lever du soleil</span>
              <span class="font-medium text-modern-secondary">{{
                formatTime(weather.sys.sunrise)
              }}</span>
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Coucher du soleil</span>
              <span class="font-medium text-modern-secondary">{{
                formatTime(weather.sys.sunset)
              }}</span>
            </div>
            <div class="flex items-center justify-between text-sm sm:text-base">
              <span class="text-modern-accent">Durée du jour</span>
              <span class="font-medium text-modern-secondary"
                >{{
                  Math.round((weather.sys.sunset - weather.sys.sunrise) / 3600)
                }}h</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
