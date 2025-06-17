<script setup lang="ts">
import * as L from "leaflet";

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const markers = ref<L.Marker[]>([]); // Теперь храним массив маркеров
const line = ref<L.Polyline | null>(null); // Для линии между точками

function clearMarkers() {
  markers.value.forEach((marker) => marker.remove());
  markers.value = [];
  if (line.value) {
    line.value.remove();
    line.value = null;
  }
}

function updateLine() {
  if (line.value) {
    line.value.remove();
  }

  if (markers.value.length === 2) {
    const latlngs = markers.value.map((marker) => marker.getLatLng());
    line.value = L.polyline(latlngs, { color: "red" }).addTo(map.value!);
  }
}

onMounted(() => {
  if (!mapContainer.value) return;

  map.value = L.map(mapContainer.value, {
    scrollWheelZoom: true,
    zoomControl: true,
  }).setView([55.751244, 37.618423], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map.value);

  map.value.on("click", async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    const data = await reverseGeocode(lat, lng);
    const address = data.address;
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "Неизвестно";

    console.log("Город или местность:", city);

    // Если уже есть 2 маркера, очищаем перед добавлением нового
    if (markers.value.length >= 2) {
      clearMarkers();
    }

    // Добавляем новый маркер
    const newMarker = L.marker([lat, lng])
      .addTo(map.value!)
      .bindPopup(`Местность: ${city}`)
      .openPopup();

    markers.value.push(newMarker);

    // Обновляем линию между точками
    updateLine();
  });
});
</script>

<template>
  <div ref="mapContainer" class="leaflet-map"></div>

  <div v-if="markers.length > 0">
    <h3>Точки:</h3>
    <div v-for="(marker, index) in markers" :key="index">
      Точка {{ index + 1 }}: {{ marker.getLatLng().lat.toFixed(4) }},
      {{ marker.getLatLng().lng.toFixed(4) }}
    </div>
  </div>

  <BaseButton label="Очистить точки" @click="clearMarkers" />
</template>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 500px;
}
</style>
