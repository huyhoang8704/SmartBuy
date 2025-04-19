// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt().override("nuxt/vue", {
  rules: {
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "never", // ⛔️ disallow <img />
          normal: "always",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
  },
});
