<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import gsap from "gsap";

const CLOUD_CONFIG = {
  duration: { min: 20, max: 35 },
  spacing: { min: -10, max: 50 },
  maxClouds: 4,
  spawnRate: 0.015,
};

const PARTICLE_CONFIG = {
  rain: {
    count: 80,
    speed: { min: 0.8, max: 1.5 },
    opacity: { min: 0.1, max: 0.3 },
  },
  snow: {
    count: 40,
    speed: { min: 2, max: 4 },
    opacity: { min: 0.2, max: 0.6 },
  },
  thunder: { lightningChance: 0.008, intensity: 0.9 },
};

const props = defineProps<{
  weatherType: string;
}>();

const animationContainer = ref<HTMLDivElement | null>(null);
const clouds = ref<HTMLElement[]>([]);
const particles: HTMLElement[] = [];

const weatherClass = computed(() => {
  const type = props.weatherType.toLowerCase();
  if (type.includes("clear")) return "clear";
  if (type.includes("cloud")) return "clouds";
  if (type.includes("rain")) return "rain";
  if (type.includes("thunder")) return "thunderstorm";
  if (type.includes("snow")) return "snow";
  return "clear";
});

// Création des particules de pluie optimisées
function createRainDrop() {
  const drop = document.createElement("div");
  drop.className = "rain-drop-modern";

  const config = PARTICLE_CONFIG.rain;
  drop.style.left = `${Math.random() * 100}%`;
  drop.style.height = `${Math.random() * 15 + 8}px`;
  drop.style.width = `${Math.random() * 1.5 + 0.5}px`;
  drop.style.animationDuration = `${
    Math.random() * (config.speed.max - config.speed.min) + config.speed.min
  }s`;
  drop.style.opacity = `${
    Math.random() * (config.opacity.max - config.opacity.min) +
    config.opacity.min
  }`;
  drop.style.animationDelay = `${Math.random() * 2}s`;

  return drop;
}

// Création d'éclairs subtils
function createLightning() {
  const lightning = document.createElement("div");
  lightning.className = "lightning-modern";
  lightning.style.left = `${Math.random() * 100}%`;
  lightning.style.width = `${Math.random() * 2 + 1}px`;
  lightning.style.opacity = "0";

  // Animation d'éclair plus subtile
  gsap
    .timeline()
    .to(lightning, {
      opacity: PARTICLE_CONFIG.thunder.intensity,
      duration: 0.05,
    })
    .to(lightning, { opacity: 0.3, duration: 0.1 })
    .to(lightning, { opacity: 0, duration: 0.05 })
    .call(() => lightning.remove());

  return lightning;
}

// Création de nuages fluides
function createCloud() {
  const cloud = document.createElement("div");
  cloud.className = "cloud-modern";

  const scale = Math.random() * 0.4 + 0.6;
  const opacity = Math.random() * 0.15 + 0.1;
  const top =
    Math.random() * (CLOUD_CONFIG.spacing.max - CLOUD_CONFIG.spacing.min) +
    CLOUD_CONFIG.spacing.min;

  cloud.style.top = `${top}%`;
  cloud.style.opacity = opacity.toString();
  cloud.style.transform = `scale(${scale})`;
  cloud.style.left = "-250px";

  return cloud;
}

// Animation fluide des nuages
function animateCloud(cloud: HTMLElement) {
  const duration =
    Math.random() * (CLOUD_CONFIG.duration.max - CLOUD_CONFIG.duration.min) +
    CLOUD_CONFIG.duration.min;

  // Animation horizontale principale
  gsap.to(cloud, {
    left: "calc(100% + 250px)",
    duration,
    ease: "none",
    onComplete: () => {
      cloud.remove();
      const index = clouds.value.indexOf(cloud);
      if (index > -1) clouds.value.splice(index, 1);
    },
  });

  // Mouvement vertical subtil
  gsap.to(cloud, {
    y: Math.random() * 30 - 15,
    duration: duration * 0.3,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });

  // Variation d'opacité douce
  gsap.to(cloud, {
    opacity:
      cloud.style.opacity === "0"
        ? 0.15
        : parseFloat(cloud.style.opacity) * 0.7,
    duration: duration * 0.2,
    yoyo: true,
    repeat: -1,
    ease: "power2.inOut",
  });
}

// Soleil simple sans rayons
function createSun() {
  const sun = document.createElement("div");
  sun.className = "sun-modern";
  return sun;
}

// Flocons de neige optimisés
function createSnowFlake() {
  const flake = document.createElement("div");
  flake.className = "snow-flake-modern";

  const chars = ["❄", "❅", "✻", "✦"];
  flake.textContent = chars[Math.floor(Math.random() * chars.length)];

  const config = PARTICLE_CONFIG.snow;
  flake.style.left = `${Math.random() * 100}%`;
  flake.style.fontSize = `${Math.random() * 12 + 6}px`;
  flake.style.animationDuration = `${
    Math.random() * (config.speed.max - config.speed.min) + config.speed.min
  }s`;
  flake.style.opacity = `${
    Math.random() * (config.opacity.max - config.opacity.min) +
    config.opacity.min
  }`;
  flake.style.animationDelay = `${Math.random() * 3}s`;

  return flake;
}

// Ajout intelligent de nuages
function addCloud() {
  if (
    !animationContainer.value ||
    clouds.value.length >= CLOUD_CONFIG.maxClouds
  )
    return;

  const cloud = createCloud();
  animationContainer.value.appendChild(cloud);
  clouds.value.push(cloud);
  animateCloud(cloud);
}

// Gestion des particules météo
function addWeatherParticles() {
  if (!animationContainer.value) return;

  const type = props.weatherType.toLowerCase();

  if (type.includes("rain") || type.includes("thunder")) {
    // Contrôle du nombre de gouttes
    if (particles.length < PARTICLE_CONFIG.rain.count) {
      const drop = createRainDrop();
      animationContainer.value.appendChild(drop);
      particles.push(drop);

      drop.addEventListener("animationend", () => {
        drop.remove();
        const index = particles.indexOf(drop);
        if (index > -1) particles.splice(index, 1);
      });
    }

    // Éclairs pour les orages
    if (
      type.includes("thunder") &&
      Math.random() < PARTICLE_CONFIG.thunder.lightningChance
    ) {
      const lightning = createLightning();
      animationContainer.value.appendChild(lightning);
    }
  } else if (type.includes("snow")) {
    // Contrôle du nombre de flocons
    if (particles.length < PARTICLE_CONFIG.snow.count) {
      const flake = createSnowFlake();
      animationContainer.value.appendChild(flake);
      particles.push(flake);

      flake.addEventListener("animationend", () => {
        flake.remove();
        const index = particles.indexOf(flake);
        if (index > -1) particles.splice(index, 1);
      });
    }
  }
}

// Gestion des nuages
function updateClouds() {
  if (!animationContainer.value) return;
  if (
    clouds.value.length < CLOUD_CONFIG.maxClouds &&
    Math.random() < CLOUD_CONFIG.spawnRate
  ) {
    addCloud();
  }
}

let particleInterval: number | null = null;
let cloudInterval: number | null = null;
let sunElement: HTMLElement | null = null;

onMounted(() => {
  const type = props.weatherType.toLowerCase();

  // Particules météo
  if (
    type.includes("rain") ||
    type.includes("thunder") ||
    type.includes("snow")
  ) {
    particleInterval = setInterval(addWeatherParticles, 150);
  }

  // Nuages pour temps nuageux/pluvieux
  if (
    type.includes("cloud") ||
    type.includes("rain") ||
    type.includes("thunder")
  ) {
    // Nuages initiaux
    setTimeout(() => addCloud(), 500);
    setTimeout(() => addCloud(), 1500);

    cloudInterval = setInterval(updateClouds, 2000);
  }

  // Soleil pour temps clair
  if (type.includes("clear")) {
    sunElement = createSun();
    if (animationContainer.value && sunElement) {
      animationContainer.value.appendChild(sunElement);
    }
  }
});

onUnmounted(() => {
  if (particleInterval) clearInterval(particleInterval);
  if (cloudInterval) clearInterval(cloudInterval);

  // Nettoyage des éléments
  [...particles, ...clouds.value].forEach((el) => el.remove());
  if (sunElement) sunElement.remove();

  particles.length = 0;
  clouds.value.length = 0;
});
</script>

<template>
  <div
    ref="animationContainer"
    class="weather-background-modern"
    :class="weatherClass"
  ></div>
</template>