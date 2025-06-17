<template>
  <div class="map container">
    <ClientOnly>
    <MapBox />
    </ClientOnly>
  </div>
</template>
<style lang="scss">
.map {
  height: 100vh;
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
