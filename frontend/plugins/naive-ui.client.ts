import { defineNuxtPlugin } from "#app";
import NaiveUI from "naive-ui";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(NaiveUI);
});
