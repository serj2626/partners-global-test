<template>
  <div class="map container">
    <h1>Интерактивная карта</h1>
    <ClientOnly>
    <MapBox />
    </ClientOnly>
  </div>
</template>
<style lang="scss">
.map {
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
