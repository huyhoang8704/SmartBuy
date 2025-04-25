<template>
  <div class="relative">
    <MenuButton @navigate="onNavigate" />
  </div>
</template>

<script setup>
import MenuButton from "./MenuButton.vue";

function onNavigate(key) {
  switch (key) {
    case "history":
      navigateTo("/buying-history");
      break;
  }
}
</script>
