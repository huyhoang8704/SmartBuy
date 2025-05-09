<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NNotificationProvider } from "naive-ui";

const themeOverrides = {
  common: {
    primaryColor: "#000000",
    primaryColorHover: "#444444",
  },
  Button: {
    colorHover: "#444444", // Background color on hover
    textColorHover: "#ffffff", // Text color on hover
    borderHover: "1px solid #666666", // Border color on hover
  },
};

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
    },
  ],
});
</script>
<style scoped></style>
