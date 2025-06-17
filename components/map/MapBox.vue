<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
  center: {
    type: Array,
    default: () => [25.2744, 55.3082],
  },
  zoom: {
    type: Number,
    default: 10,
  },
});

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const roadsLayer = ref<L.GeoJSON | null>(null);

// Стили для дорог
const roadStyle = {
  color: "#555",
  weight: 3,
  opacity: 0.7,
};

// Загрузка данных о дорогах
async function loadRoadsData() {
  try {
    // URL для данных HOT OSM Roads для ОАЭ (можете заменить на нужный регион)
    const response = await fetch(
      "https://data.humdata.org/dataset/hotosm_are_roads/resource/8d2f0e6c-8b50-4bde-9a3a-6f2b4b1a8f1f/download/are_roads.geojson"
    );

    if (!response.ok) throw new Error("Failed to fetch roads data");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading roads data:", error);
    return null;
  }
}

onMounted(async () => {
  if (!mapContainer.value) return;

  // Инициализация карты
  map.value = L.map(mapContainer.value).setView(props.center, props.zoom);

  // Добавление базового слоя
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  // Загрузка и добавление данных о дорогах
  const roadsData = await loadRoadsData();
  if (roadsData) {
    roadsLayer.value = L.geoJSON(roadsData, {
      style: roadStyle,
      onEachFeature: (feature, layer) => {
        // Добавляем всплывающую подсказку с информацией о дороге
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(
            `<b>${feature.properties.name}</b><br>Тип: ${
              feature.properties.highway || "не указан"
            }`
          );
        }
      },
    }).addTo(map.value);

    // Автоматическое изменение границ карты под загруженные данные
    map.value.fitBounds(roadsLayer.value.getBounds());
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>
<style>
.map-container {
  width: 100%;
  height: 600px;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

/* Исправление для корректного отображения иконок маркеров */
:global(.leaflet-marker-icon),
:global(.leaflet-div-icon) {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="%23ff0000"><path d="M16 2a12 12 0 0 0-12 12c0 10 12 20 12 20s12-10 12-20a12 12 0 0 0-12-12zm0 17a5 5 0 1 1 5-5 5 5 0 0 1-5 5z"/></svg>') !important;
}
</style>
