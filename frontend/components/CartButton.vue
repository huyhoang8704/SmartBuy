<template>
  <div>
    <n-button @click="isOpen = true" type="primary" round>
      🛒 Giỏ hàng
      <span
        v-if="cart.totalItems > 0"
        class="absolute -top-4 -right-4 bg-red-600 text-white text-xs rounded-full px-1.5">
        {{ cart.totalItems }}
      </span>
    </n-button>

    <CartPopup :isOpen="isOpen" @close="isOpen = false" />
  </div>
</template>

<script setup>
import CartPopup from "./CartPopup.vue";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const isOpen = ref(false);
</script>
