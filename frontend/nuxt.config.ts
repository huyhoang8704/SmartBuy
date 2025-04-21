import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  // Explicitly set SSR mode
  ssr: true,

  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/icon", "@pinia/nuxt"],

  build: {
    transpile:
      process.env.NODE_ENV === "production"
        ? [
            "naive-ui",
            "vueuc",
            "@css-render/vue3-ssr",
            "@juggle/resize-observer",
          ]
        : ["@juggle/resize-observer"],
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include:
        process.env.NODE_ENV === "development"
          ? [
              "naive-ui",
              "vueuc",
              "@css-render/vue3-ssr",
              "@juggle/resize-observer",
            ]
          : [],
    },
    // Add this to avoid CSS modules conflicting with Naive UI
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/variables.scss" as *;',
        },
      },
    },
  },

  // Your CSS imports
  css: ["~/assets/css/main.css"],

  // Add auto-imports for Naive UI components
  imports: {
    dirs: ["components"],
  },

  compatibilityDate: "2025-04-17",
});