<script setup lang="ts">
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapContainer = ref<HTMLElement | null>(null); // ссылка на div с картой
const map = ref<L.Map | null>(null); // объект карты
const routingControl = ref<any>(null); // контрол маршрута

const startInput = ref(""); // значение поля "откуда"
const endInput = ref(""); // значение поля "куда"
const startResults = ref<any[]>([]); // список найденных адресов "откуда"
const endResults = ref<any[]>([]); // список найденных адресов "куда"

const routeInfo = ref<{ distance: number; time: number } | null>(null); // инфа о маршруте

let LRM: any; // сюда подгружается leaflet-routing-machine

// Очистка маршрута и полей
function clearRoute() {
  if (routingControl.value) {
    routingControl.value.remove(); // удаляем маршрут
    routingControl.value = null;
  }
  routeInfo.value = null;
  startInput.value = "";
  endInput.value = "";
}

// Поиск адресов через Nominatim
async function searchAddress(type: "start" | "end") {
  const query = type === "start" ? startInput.value : endInput.value;
  if (query.length < 3) {
    // Очищаем результаты, если слишком короткий запрос
    if (type === "start") startResults.value = [];
    else endResults.value = [];
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=15`;

  const res = await fetch(url);
  const data = await res.json();

  if (type === "start") startResults.value = data;
  else endResults.value = data;
}

// Установка точки маршрута
function setWaypoint(type: "start" | "end", place: any) {
  if (!map.value) return;
  const latlng = L.latLng(place.lat, place.lon);

  // Если маршрутизатор не создан — создаем
  if (!routingControl.value) {
    routingControl.value = LRM.Routing.control({
      waypoints: [], // изначально пусто
      router: LRM.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }],
      },
      show: false,
      addWaypoints: true,
      draggableWaypoints: true, // точки можно перетаскивать
      routeWhileDragging: true, // пересчет маршрута при перетаскивании
    }).addTo(map.value);
  }

  const waypoints = routingControl.value.getWaypoints();

  if (type === "start") {
    waypoints[0] = latlng;
  } else {
    waypoints[1] = latlng;
  }

  routingControl.value.setWaypoints(waypoints);
  routeInfo.value = null;
}

// Обработка выбора адреса из списка
function handleSelect(type: "start" | "end") {
  const list = type === "start" ? startResults.value : endResults.value;
  const query = type === "start" ? startInput.value : endInput.value;

  const found = list.find((item) => item.display_name === query);
  if (found) {
    setWaypoint(type, found);
  }
}

// Инициализация карты
onMounted(async () => {
  // Динамический импорт routing-machine (работает только в браузере)
  LRM = await import("leaflet-routing-machine");
  await import("leaflet-routing-machine/dist/leaflet-routing-machine.css");

  if (!mapContainer.value) return;

  // Центр карты — Москва, масштаб — 6 (Россия)
  map.value = L.map(mapContainer.value).setView([55.751244, 37.618423], 6);

  // Слой OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap contributors",
  }).addTo(map.value);

  // Обработка завершения маршрута
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
      <input
        v-model="startInput"
        @input="searchAddress('start')"
        @change="handleSelect('start')"
        placeholder="Откуда"
        list="start-list"
      />
      <datalist id="start-list">
        <option
          v-for="item in startResults"
          :key="item.place_id"
          :value="item.display_name"
        />
      </datalist>

      <input
        v-model="endInput"
        @input="searchAddress('end')"
        @change="handleSelect('end')"
        placeholder="Куда"
        list="end-list"
      />
      <datalist id="end-list">
        <option
          v-for="item in endResults"
          :key="item.place_id"
          :value="item.display_name"
        />
      </datalist>

      <!-- Кнопка очистки -->
      <button @click="clearRoute">Очистить маршрут</button>
    </div>

    <!-- Контейнер карты -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- Информация о маршруте -->
    <div v-if="routeInfo" class="route-info">
      <p>Расстояние: {{ (routeInfo.distance / 1000).toFixed(2) }} км</p>
      <p>Время: {{ (routeInfo.time / 60).toFixed(0) }} мин</p>
    </div>
  </div>
</template>

<style scoped>
.map-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.map-box__controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.route-info {
  font-weight: bold;
  margin-top: 10px;
}
</style>
