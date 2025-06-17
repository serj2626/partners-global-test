// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["nuxt-icon", "nuxt3-leaflet"],
  css: ["@/assets/scss/global.scss"],
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
              @use '@/assets/scss/_vars.scss' as *;
              @use '@/assets/scss/_mixins.scss' as *;
              @use '@/assets/scss/_animations.scss' as *;
            `,
        },
      },
    },
  },
});
