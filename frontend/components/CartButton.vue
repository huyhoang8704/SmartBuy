<template>
  <div>
    <button
      @click="isOpen = true"
      class="relative bg-green-600 text-white py-2 px-4 rounded">
      🛒 Giỏ hàng
      <span
        v-if="cart.totalItems > 0"
        class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
        {{ cart.totalItems }}
      </span>
    </button>

    <CartPopup :isOpen="isOpen" @close="isOpen = false" />
  </div>
</template>

<script setup>
import CartPopup from "./CartPopup.vue";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const isOpen = ref(false);
</script>
