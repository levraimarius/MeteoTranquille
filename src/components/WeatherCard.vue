<script setup lang="ts">
import { useTransition } from '@vueuse/core'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import axios from 'axios'
import type { WeatherData, ForecastData } from '../types/weather'
import WeatherIcon from './WeatherIcon.vue'

const props = defineProps<{
  weather: WeatherData
}>()

const forecast = ref<ForecastData[]>([])
const forecastLoading = ref(true)
const forecastError = ref<string | null>(null)
const hourlyForecastScroll = ref<HTMLDivElement | null>(null)
const dailyForecastScroll = ref<HTMLDivElement | null>(null)
const dailyForecast = ref<DailyForecast[]>([])

const showNavButtons = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
})

function handleResize() {
  if (typeof window === 'undefined') return
  showNavButtons.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function scrollHourlyForecast(direction: 'left' | 'right') {
  if (!hourlyForecastScroll.value) return
  
  const scrollAmount = direction === 'left' ? -200 : 200
  hourlyForecastScroll.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

function scrollDailyForecast(direction: 'left' | 'right') {
  if (!dailyForecastScroll.value) return
  
  const scrollAmount = direction === 'left' ? -200 : 200
  dailyForecastScroll.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

const API_KEY = 'd43e9730fe896028d7f76cca8b066475'

async function getForecast() {
  try {
    forecastLoading.value = true
    forecastError.value = null
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: props.weather.name,
        appid: API_KEY,
        units: 'metric',
        lang: 'fr'
      }
    })
    
    // Prévisions horaires (24h)
    forecast.value = response.data.list.slice(0, 8)
    
    // Prévisions journalières (7 jours)
    const dailyData = response.data.list.reduce((acc: any[], curr: any) => {
      const date = new Date(curr.dt * 1000).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = {
          dt: curr.dt,
          temp: {
            min: curr.main.temp,
            max: curr.main.temp,
            day: curr.main.temp
          },
          weather: curr.weather,
          speed: curr.wind.speed,
          pop: curr.pop || 0
        }
      } else {
        acc[date].temp.min = Math.min(acc[date].temp.min, curr.main.temp)
        acc[date].temp.max = Math.max(acc[date].temp.max, curr.main.temp)
        if (new Date(curr.dt * 1000).getHours() === 12) {
          acc[date].temp.day = curr.main.temp
          acc[date].weather = curr.weather
        }
        acc[date].pop = Math.max(acc[date].pop, curr.pop || 0)
      }
      return acc
    }, {})
    
    dailyForecast.value = Object.values(dailyData).slice(0, 7)
  } catch (e) {
    forecastError.value = "Impossible de récupérer les prévisions"
  } finally {
    forecastLoading.value = false
  }
}

function formatDay(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric'
  })
}

function getMoonPhase(timestamp: number): string {
  const LUNAR_MONTH = 29.53059; // Durée moyenne d'un cycle lunaire en jours
  const KNOWN_NEW_MOON = 1692741600; // Timestamp d'une nouvelle lune connue (22 août 2023)
  
  const daysSinceNewMoon = (timestamp - KNOWN_NEW_MOON) / (24 * 3600);
  const phase = (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
  
  if (phase < 0.125) return "Nouvelle lune 🌑";
  if (phase < 0.25) return "Premier croissant 🌒";
  if (phase < 0.375) return "Premier quartier 🌓";
  if (phase < 0.5) return "Lune gibbeuse croissante 🌔";
  if (phase < 0.625) return "Pleine lune 🌕";
  if (phase < 0.75) return "Lune gibbeuse décroissante 🌖";
  if (phase < 0.875) return "Dernier quartier 🌗";
  return "Dernier croissant 🌘";
}

const temperature = useTransition(props.weather.main.temp)

function formatHour(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

function formatVisibility(meters: number): string {
  return (meters / 1000).toFixed(1) + ' km'
}

const qualityIndex = Math.round((props.weather.main.humidity + props.weather.clouds.all) / 2)
function getAirQuality() {
  if (qualityIndex < 30) return { text: 'Excellente', color: 'text-green-400' }
  if (qualityIndex < 50) return { text: 'Bonne', color: 'text-green-300' }
  if (qualityIndex < 70) return { text: 'Moyenne', color: 'text-yellow-300' }
  return { text: 'Médiocre', color: 'text-red-300' }
}

const airQuality = getAirQuality()

onMounted(getForecast)
</script>

<template>
  <div class="space-y-6">
    <!-- Carte principale -->
    <div class="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl sm:text-3xl font-bold">{{ weather.name }}</h2>
        <span class="text-lg">{{ weather.sys.country }}</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center">
          <WeatherIcon :type="weather.weather[0].main" />
          <div class="flex flex-col ml-4">
            <div class="text-5xl sm:text-6xl">{{ Math.round(temperature) }}°C</div>
            <div class="text-sm opacity-75 mt-1">
              Ressenti {{ Math.round(weather.main.feels_like) }}°C
            </div>
          </div>
        </div>
      
        <div class="space-y-4">
          <div class="text-xl capitalize text-center md:text-left">
            {{ weather.weather[0].description }}
            <div class="text-sm opacity-75 mt-1">
              Mise à jour : {{ new Date(weather.dt * 1000).toLocaleString('fr-FR') }}
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm opacity-75">Min</div>
              <div class="text-lg flex items-center">
                <svg class="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {{ Math.round(weather.main.temp_min) }}°C
              </div>
            </div>
            <div>
              <div class="text-sm opacity-75">Max</div>
              <div class="text-lg flex items-center">
                <svg class="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {{ Math.round(weather.main.temp_max) }}°C
              </div>
            </div>
          </div>
          
          <div class="text-sm opacity-75 border-t border-white/10 pt-4 mt-4">
            <div class="flex items-center justify-between">
              <span>Population</span>
              <span>{{ new Intl.NumberFormat('fr-FR').format(weather.population || 0) }} hab.</span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <span>Altitude</span>
              <span>{{ Math.round(weather.coord?.alt || 0) }} m</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisions -->
    <div class="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Prévisions 24h</h3>
        
        <div class="hidden lg:flex space-x-2">
          <button 
            @click="scrollHourlyForecast('left')"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Voir les prévisions précédentes"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            @click="scrollHourlyForecast('right')"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Voir les prévisions suivantes"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="forecastLoading" class="text-center py-4">
        Chargement des prévisions...
      </div>
      
      <div v-else-if="forecastError" class="text-red-200 text-center py-4">
        {{ forecastError }}
      </div>
      
      <div 
        v-else
        ref="hourlyForecastScroll"
        class="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-4 pb-4 -mb-4 rounded-lg snap-x snap-mandatory"
      >
        <div 
          v-for="item in forecast" 
          :key="item.dt"
          class="flex-none w-[130px] sm:w-[160px] p-3 sm:p-4 bg-white/5 rounded-lg snap-start"
        >
          <div class="text-center mb-2">
            {{ formatHour(item.dt_txt) }}
          </div>
          
          <div class="flex flex-col items-center">
            <WeatherIcon 
              :type="item.weather[0].main"
              class="scale-50 mb-2"
            />
            <div class="text-xl font-bold">
              {{ Math.round(item.main.temp) }}°C
            </div>
            <div class="text-xs mt-1">
              {{ Math.round(item.wind.speed * 3.6) }} km/h
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisions journalières -->
    <div class="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Prévisions 7 jours</h3>
        
        <div class="hidden lg:flex space-x-2">
          <button 
            @click="scrollDailyForecast('left')"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Voir les prévisions précédentes"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            @click="scrollDailyForecast('right')"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Voir les prévisions suivantes"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="forecastLoading" class="text-center py-4">
        Chargement des prévisions...
      </div>
      
      <div v-else-if="forecastError" class="text-red-200 text-center py-4">
        {{ forecastError }}
      </div>
      
      <div 
        v-else
        ref="dailyForecastScroll"
        class="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-4 pb-4 -mb-4 rounded-lg"
      >
        <div 
          v-for="item in dailyForecast" 
          :key="item.dt"
          class="flex-none w-[160px] sm:w-[200px] p-3 sm:p-4 bg-white/5 rounded-lg"
        >
          <div class="flex flex-col items-center sm:flex-row sm:justify-between mb-2">
            <div class="text-base capitalize">{{ formatDay(item.dt) }}</div>
            <WeatherIcon 
              :type="item.weather[0].main"
              class="scale-50 -my-2 sm:my-0"
            />
          </div>
          
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm opacity-75">Min</div>
              <div class="text-lg">{{ Math.round(item.temp.min) }}°C</div>
            </div>
            <div class="text-right">
              <div class="text-sm opacity-75">Max</div>
              <div class="text-lg">{{ Math.round(item.temp.max) }}°C</div>
            </div>
          </div>
          
          <div class="mt-2 text-sm">
            <div class="flex justify-between">
              <span class="opacity-75">Pluie</span>
              <span>{{ Math.round((item.pop || 0) * 100) }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="opacity-75">Vent</span>
              <span>{{ Math.round(item.speed * 3.6) }} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditions atmosphériques -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white">
        <h3 class="text-xl font-semibold mb-4">Conditions atmosphériques</h3>
        <div class="space-y-4">
          <div class="p-3 bg-white/5 rounded-lg">
            <div class="text-sm opacity-75 mb-1">Indice de confort</div>
            <div class="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-red-400"
                :style="{ width: `${(Math.round(weather.main.feels_like) - Math.round(weather.main.temp_min)) / (Math.round(weather.main.temp_max) - Math.round(weather.main.temp_min)) * 100}%` }"
              ></div>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="opacity-75">Ressenti</span>
            <span class="font-medium">{{ Math.round(weather.main.feels_like) }}°C</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Pression</span>
            <span class="font-medium">{{ weather.main.pressure }} hPa</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Humidité</span>
            <span class="font-medium">{{ weather.main.humidity }}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Visibilité</span>
            <span class="font-medium">{{ formatVisibility(weather.visibility) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Point de rosée</span>
            <span class="font-medium">{{ Math.round(weather.main.temp - ((100 - weather.main.humidity) / 5)) }}°C</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Probabilité de précipitations</span>
            <span class="font-medium">{{ Math.round(weather.clouds.all * 0.8) }}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Pression au niveau de la mer</span>
            <span class="font-medium">{{ weather.main.sea_level || weather.main.pressure }} hPa</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Pression au sol</span>
            <span class="font-medium">{{ weather.main.grnd_level || weather.main.pressure }} hPa</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Qualité de l'air</span>
            <span :class="['font-medium', airQuality.color]">
              {{ airQuality.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Vent et ensoleillement -->
      <div class="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg text-white">
        <h3 class="text-xl font-semibold mb-4">Vent et ensoleillement</h3>
        <div class="space-y-4">
          <div class="p-3 bg-white/5 rounded-lg">
            <div class="text-sm opacity-75 mb-2">Rose des vents</div>
            <div class="relative w-24 h-24 mx-auto">
              <div class="absolute inset-0 border-2 border-white/20 rounded-full"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="transform -rotate-45" :style="{ transform: `rotate(${weather.wind.deg}deg)` }">➜</div>
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Vitesse du vent</span>
            <span class="font-medium">{{ Math.round(weather.wind.speed * 3.6) }} km/h</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Direction</span>
            <span class="font-medium">{{ formatWindDirection(weather.wind.deg) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Rafales</span>
            <span class="font-medium">{{ Math.round((weather.wind.gust || weather.wind.speed) * 3.6) }} km/h</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Lever du soleil</span>
            <span class="font-medium">{{ formatTime(weather.sys.sunrise) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Coucher du soleil</span>
            <span class="font-medium">{{ formatTime(weather.sys.sunset) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-75">Durée du jour</span>
            <span class="font-medium">
              {{ Math.round((weather.sys.sunset - weather.sys.sunrise) / 3600) }}h
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>