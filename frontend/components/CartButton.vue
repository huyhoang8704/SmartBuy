<template>
  <div class="relative cart-dropdown-container">
    <NuxtLink to="/cart">
      <n-button
        type="primary"
        round
        @mouseenter="showDropdown = true"
        @mouseleave="handleMouseLeave">
        🛒 Giỏ hàng
        <span
          v-if="cart.totalItems > 0"
          class="absolute -top-4 -right-4 bg-red-600 text-white text-xs rounded-full px-1.5">
          {{ cart.totalItems }}
        </span>
      </n-button>
    </NuxtLink>

    <!-- Hover dropdown -->
    <div
      v-show="showDropdown && cart.items.length > 0"
      class="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg z-50 p-3 cart-dropdown"
      @mouseenter="clearTimeout"
      @mouseleave="showDropdown = false">
      <h3 class="text-sm font-medium mb-2 border-b pb-1">Giỏ hàng của bạn</h3>

      <div class="overflow-y-auto cart-items-container">
        <div
          v-for="item in cart.items.slice(0, 5)"
          :key="item.id"
          class="flex py-2 border-b">
          <div class="w-10 h-10 mr-2 flex-shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              class="w-full h-full object-cover rounded"
              :alt="item.name" />
          </div>
          <div class="flex-1 text-sm">
            <div class="font-medium line-clamp-2">{{ item.name }}</div>
            <div class="flex justify-between">
              <span class="text-gray-600"
                >{{ item.quantity }}x
                <span class="text-xs">(còn {{ item.stock }})</span></span
              >
              <span class="font-semibold">{{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="cart.items.length > 5"
          class="text-center text-sm text-gray-500 mt-2 py-1">
          +{{ cart.items.length - 5 }} sản phẩm khác
        </div>
      </div>

      <div class="mt-3 pt-2 border-t flex justify-between items-center">
        <div class="font-semibold">
          Tổng: {{ formatPrice(cart.totalPrice) }}
        </div>
        <NuxtLink to="/cart">
          <n-button size="small" type="primary" round>Xem giỏ hàng</n-button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useCartStore } from "@/stores/cart";
import { useFormatPrice } from "@/composables/utils/useFormatters";

const cart = useCartStore();
const showDropdown = ref(false);
const isCartOpen = ref(false);
const { formatPrice } = useFormatPrice();

// Small delay to prevent flashing when moving between button and dropdown
const leaveTimeout = ref(null);

const handleMouseLeave = () => {
  leaveTimeout.value = setTimeout(() => {
    showDropdown.value = false;
  }, 100);
};

const clearTimeout = () => {
  if (leaveTimeout.value) {
    window.clearTimeout(leaveTimeout.value);
    leaveTimeout.value = null;
  }
};

onMounted(() => {
  cart.fetchCart();
});
</script>

<style scoped>
/* Optional animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Text clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure dropdown appears over other content */
.cart-dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 90vh; /* Prevent dropdown from exceeding viewport height */
  display: flex;
  flex-direction: column;
}

.cart-items-container {
  max-height: 300px; /* Set a fixed max height for the items container */
  overflow-y: auto;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent; /* Firefox */
}

/* Styling for webkit browsers (Chrome, Safari) scrollbars */
.cart-items-container::-webkit-scrollbar {
  width: 4px;
}

.cart-items-container::-webkit-scrollbar-track {
  background: transparent;
}

.cart-items-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.cart-dropdown-container {
  z-index: 100;
}
</style>
