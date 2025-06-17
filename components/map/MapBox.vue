<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const routingControl = ref<any>(null);

const startInput = ref("");
const endInput = ref("");
const startResults = ref<any[]>([]);
const endResults = ref<any[]>([]);

const routeInfo = ref<{ distance: number; time: number } | null>(null);

function clearRoute() {
  if (routingControl.value) {
    routingControl.value.remove();
    routingControl.value = null;
  }
  routeInfo.value = null;
  startInput.value = "";
  endInput.value = "";
}

async function searchAddress(type: "start" | "end") {
  const query = type === "start" ? startInput.value : endInput.value;
  if (query.length < 3) {
    if (type === "start") startResults.value = [];
    else endResults.value = [];
    return;
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  if (type === "start") startResults.value = data;
  else endResults.value = data;
}

function setWaypoint(type: "start" | "end", place: any) {
  if (!map.value) return;
  const latlng = L.latLng(place.lat, place.lon);
  if (!routingControl.value) {
    routingControl.value = L.Routing.control({
      waypoints: [],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }],
      },
      show: false,
      addWaypoints: true,
      draggableWaypoints: true,
      routeWhileDragging: true,
    }).addTo(map.value);
  }

  let waypoints = routingControl.value.getWaypoints();

  if (type === "start") {
    waypoints[0] = latlng;
  } else {
    waypoints[1] = latlng;
  }

  routingControl.value.setWaypoints(waypoints);
  routeInfo.value = null;
}

watch(startInput, async (val) => {
  if (
    startResults.value.length === 1 &&
    val === startResults.value[0].display_name
  ) {
    setWaypoint("start", startResults.value[0]);
  }
});

watch(endInput, async (val) => {
  if (
    endResults.value.length === 1 &&
    val === endResults.value[0].display_name
  ) {
    setWaypoint("end", endResults.value[0]);
  }
});

onMounted(() => {
  if (!mapContainer.value) return;
  map.value = L.map(mapContainer.value).setView([25.2744, 55.3082], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap contributors",
  }).addTo(map.value);

  // Listen for routing events to update info panel
  map.value.on("routingroutefound", (e: any) => {
    if (!e.route) return;
    routeInfo.value = {
      distance: e.route.summary.totalDistance,
      time: e.route.summary.totalTime,
    };
  });
});
</script>
<template>
  <div class="map-box">
    <div class="map-box__controls">
      <!-- <input
        type="text"
        v-model="startInput"
        @input="searchAddress('start')"
        placeholder="Введите старт"
        list="start-list"
      /> -->
      <BaseInput
        v-model="startInput"
        @input="searchAddress('start')"
        placeholder="Введите старт"
        list="start-list"
      />
      <datalist id="start-list">
        <option
          v-for="item in startResults"
          :key="item.place_id"
          :value="item.display_name"
        />
      </datalist>

      <!-- <input
        type="text"
        v-model="endInput"
        @input="searchAddress('end')"
        placeholder="Введите финиш"
        list="end-list"
      /> -->
      <BaseInput
        v-model="endInput"
        @input="searchAddress('end')"
        placeholder="Введите старт"
        list="end-list"
      />
      <datalist id="end-list">
        <option
          v-for="item in endResults"
          :key="item.place_id"
          :value="item.display_name"
        />
      </datalist>

      <BaseButton label="Очистить маршрут" @click="clearRoute" style="width: 100%;" />
    </div>

    <div ref="mapContainer" class="map-container"></div>

    <div v-if="routeInfo" class="route-info">
      <p>Расстояние: {{ (routeInfo.distance / 1000).toFixed(2) }} км</p>
      <p>Время: {{ (routeInfo.time / 60).toFixed(0) }} мин</p>
    </div>
  </div>
</template>
<style scoped lang="scss">
.map-box {
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: 30px;

  &__controls {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}

.map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.route-info {
  margin-top: 10px;
  font-weight: bold;
}
</style>
