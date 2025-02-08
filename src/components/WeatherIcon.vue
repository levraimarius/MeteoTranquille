<script setup lang="ts">
const props = defineProps<{
  type: string;
}>();

defineExpose({
  getWeatherIcon,
});

function getWeatherIcon(type: string) {
  const weatherType = type.toLowerCase();

  if (weatherType.includes("clear")) {
    return `<svg class="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" fill="currentColor"/>
      <path stroke-linecap="round" stroke-width="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`;
  }

  if (weatherType.includes("cloud")) {
    return `<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
    </svg>`;
  }

  if (weatherType.includes("rain")) {
    return `<svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
      <path stroke-linecap="round" stroke-width="2" d="M8 19v2M16 19v2M12 19v2"/>
    </svg>`;
  }

  if (weatherType.includes("thunder")) {
    return `<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
      <path fill="currentColor" stroke="none" d="M13 10l-4 6h4l-2 4 6-7h-4l2-3z"/>
    </svg>`;
  }

  if (weatherType.includes("snow")) {
    return `<svg class="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
      <path stroke-linecap="round" stroke-width="2" d="M8 17h.01M12 17h.01M16 17h.01M8 20h.01M12 20h.01M16 20h.01"/>
    </svg>`;
  }

  // Par défaut, retourner une icône de soleil
  return `<svg class="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
    <path stroke-linecap="round" stroke-width="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>`;
}
</script>

<template>
  <div v-html="getWeatherIcon(type)" class="weather-icon"></div>
</template>

<style scoped>
.weather-icon :deep(svg) {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}
</style>
