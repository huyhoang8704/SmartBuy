<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider placement="bottom-right">
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
    primaryColor: "#00B14F",
    primaryColorPressed: "#008F3E", // Slightly darker green when pressed
  },
  Button: {
    colorHover: "#00C853", // Brighter green on hover
    textColorHover: "#ffffff", // White text on hover
    borderHover: "1px solid #00B14F", // Green border on hover
    colorPressed: "#008F3E", // Slightly darker green when pressed
    textColorPressed: "#ffffff", // White text when pressed
    borderPressed: "1px solid #008F3E", // Darker green border when pressed
  },
};

useHead({
  title: "FastBuy - Online Shopping",
  titleTemplate: "%s | FastBuy",
  meta: [
    {
      name: "description",
      content: "FastBuy - Your One-Stop Online Shopping Destination",
    },
  ],
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
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Tektur:wght@400..900&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap",
    },
  ],
});
</script>
<style></style>
