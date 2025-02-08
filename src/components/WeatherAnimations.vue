<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import gsap from 'gsap'

const CLOUD_DURATION = { min: 15, max: 25 } // Durée en secondes
const CLOUD_SPACING = { min: -20, max: 40 } // Espacement vertical en %
const MAX_CLOUDS = 6

const props = defineProps<{
  weatherType: string
}>()

const animationContainer = ref<HTMLDivElement | null>(null)
const elements: HTMLElement[] = []
const sunElement = ref<HTMLElement | null>(null)
const clouds = ref<HTMLElement[]>([])

const weatherClass = computed(() => {
  const type = props.weatherType.toLowerCase()
  if (type.includes('clear')) return 'clear'
  if (type.includes('cloud')) return 'clouds'
  if (type.includes('rain')) return 'rain'
  if (type.includes('thunder')) return 'thunderstorm'
  if (type.includes('snow')) return 'snow'
  return 'clear'
})

function createRainDrop() {
  const drop = document.createElement('div')
  drop.className = 'rain-drop'
  drop.style.left = `${Math.random() * 100}%`
  drop.style.height = `${Math.random() * 20 + 10}px`
  drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`
  drop.style.opacity = `${Math.random() * 0.3 + 0.1}`
  return drop
}

function createLightning() {
  const lightning = document.createElement('div')
  lightning.className = 'lightning'
  lightning.style.left = `${Math.random() * 100}%`
  lightning.style.animationDuration = '1s'
  lightning.style.opacity = '0'
  
  setTimeout(() => {
    lightning.style.opacity = '1'
    setTimeout(() => {
      lightning.style.opacity = '0'
      setTimeout(() => {
        lightning.remove()
      }, 150)
    }, 100)
  }, Math.random() * 3000)
  
  return lightning
}

function createCloud() {
  const cloud = document.createElement('div')
  cloud.className = 'cloud'
  const top = Math.random() * (CLOUD_SPACING.max - CLOUD_SPACING.min) + CLOUD_SPACING.min
  const scale = Math.random() * 0.5 + 0.5
  const opacity = Math.random() * 0.3 + 0.3
  
  cloud.style.top = `${top}%`
  cloud.style.opacity = opacity.toString()
  cloud.style.transform = `scale(${scale})`
  cloud.style.left = '-200px'
  
  return cloud
}

function animateCloud(cloud: HTMLElement) {
  const duration = Math.random() * (CLOUD_DURATION.max - CLOUD_DURATION.min) + CLOUD_DURATION.min
  
  gsap.to(cloud, {
    left: '120%',
    duration,
    ease: 'none',
    onComplete: () => {
      cloud.remove()
      const index = clouds.value.indexOf(cloud)
      if (index > -1) {
        clouds.value.splice(index, 1)
      }
    }
  })
  
  // Animation de flottement verticale
  gsap.to(cloud, {
    y: 20,
    duration: 3 + Math.random() * 2,
    yoyo: true,
    repeat: -1,
    ease: 'power1.inOut'
  })
}

function addCloud() {
  if (!animationContainer.value || clouds.value.length >= MAX_CLOUDS) return
  
  const cloud = createCloud()
  animationContainer.value.appendChild(cloud)
  clouds.value.push(cloud)
  animateCloud(cloud)
}

function createSunRay() {
  const ray = document.createElement('div')
  ray.className = 'sun-ray'
  return ray
}

function createSun() {
  const sun = document.createElement('div')
  sun.className = 'sun'
  
  // Ajouter des rayons autour du soleil
  for (let i = 0; i < 12; i++) {
    const ray = createSunRay()
    ray.style.transform = `rotate(${i * 30}deg)`
    sun.appendChild(ray)
  }
  
  return sun
}

function createSnowFlake() {
  const flake = document.createElement('div')
  flake.className = 'snow-flake'
  flake.textContent = '❄'
  flake.style.left = `${Math.random() * 100}%`
  flake.style.fontSize = `${Math.random() * 15 + 5}px`
  flake.style.animationDuration = `${Math.random() * 3 + 2}s`
  flake.style.opacity = `${Math.random() * 0.5 + 0.2}`
  return flake
}

function addElements() {
  if (!animationContainer.value) return
  const type = props.weatherType.toLowerCase()
  
  if (type.includes('rain') || type.includes('thunder')) {
    const drop = createRainDrop()
    animationContainer.value.appendChild(drop)
    elements.push(drop)
    
    drop.addEventListener('animationend', () => {
      drop.remove()
      const index = elements.indexOf(drop)
      if (index > -1) {
        elements.splice(index, 1)
      }
    })
    
    if (type.includes('thunder') && Math.random() < 0.1) {
      const lightning = createLightning()
      animationContainer.value.appendChild(lightning)
    }
  } else if (type.includes('snow')) {
    const flake = createSnowFlake()
    animationContainer.value.appendChild(flake)
    elements.push(flake)
    
    flake.addEventListener('animationend', () => {
      flake.remove()
      const index = elements.indexOf(flake)
      if (index > -1) {
        elements.splice(index, 1)
      }
    })
  }
}

function updateClouds() {
  if (!animationContainer.value) return
  if (clouds.value.length < MAX_CLOUDS && Math.random() < 0.02) {
    addCloud()
  }
}

let animationInterval: number | null = null
let cloudInterval: number | null = null

onMounted(() => {
  const type = props.weatherType.toLowerCase()
  
  if (type.includes('rain') || type.includes('thunder') || type.includes('snow')) {
    animationInterval = setInterval(addElements, 100)
  }
  
  if (type.includes('cloud') || type.includes('rain') || type.includes('thunder')) {
    // Ajouter quelques nuages initiaux
    for (let i = 0; i < 3; i++) {
      addCloud()
    }
    cloudInterval = setInterval(updateClouds, 1000)
  }
  
  if (type.includes('clear')) {
    sunElement.value = createSun()
    if (animationContainer.value && sunElement.value) {
      animationContainer.value.appendChild(sunElement.value)
    }
  }
})

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
  if (cloudInterval) {
    clearInterval(cloudInterval)
  }
  elements.forEach(element => {
    if ('element' in element) {
      element.element.remove()
    } else {
      element.remove()
    }
  })
  if (sunElement.value) {
    sunElement.value.remove()
  }
})
</script>

<template>
  <div 
    ref="animationContainer"
    class="weather-background"
    :class="weatherClass"
  ></div>
</template>