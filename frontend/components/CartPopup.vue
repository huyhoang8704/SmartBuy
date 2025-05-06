<template>
  <div v-show="isOpen" class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-show="isOpen"
        class="absolute inset-0 bg-black/40 transition-opacity duration-300"
        @click="closeCart"></div>
    </transition>

    <!-- Cart Panel -->
    <transition name="slide">
      <div
        v-show="isOpen"
        ref="panelRef"
        :class="[
          'absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg p-4 flex flex-col transform transition-transform duration-300 ease-in-out',
          isLoading ? 'cursor-wait' : '',
        ]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">🛒 Giỏ hàng</h2>
          <button
            @click="closeCart"
            class="text-gray-500 hover:text-black text-2xl">
            &times;
          </button>
        </div>

        <div v-if="!cart.items.length" class="text-gray-500 text-center mt-10">
          Giỏ hàng trống.
        </div>

        <div v-else class="space-y-4 overflow-y-auto flex-1">
          <div
            v-for="item in cart.items"
            :key="item.id"
            class="flex gap-4 items-center border-b pb-4">
            <img
              v-if="item.image"
              :src="item.image"
              alt="Product Image"
              class="w-16 h-16 object-cover rounded border" />

            <div class="flex-1">
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-sm text-gray-600">
                Số lượng: {{ item.quantity }}
                <span class="text-xs text-gray-500"
                  >(Còn {{ item.stock }} sản phẩm)</span
                >
              </div>

              <button
                @click="removeItem(item.id)"
                :disabled="isLoading"
                class="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Xóa sản phẩm
              </button>

              <div class="text-red-600 font-semibold mt-1">
                Giá: {{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="pt-4 border-t mt-4 font-bold flex items-center justify-between">
          Tổng cộng: {{ formatPrice(cart.totalPrice) }}
          <NuxtLink to="/cart">
            <n-button type="primary" block> Xem giỏ hàng </n-button>
          </NuxtLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { onClickOutside, useEventListener } from "@vueuse/core";
import { useCartStore } from "@/stores/cart";
import { useFormatPrice } from "~/composables/utils/useFormatters";

const cart = useCartStore();
const { formatPrice } = useFormatPrice();
const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close"]);
const panelRef = ref(null);
const isLoading = ref(false);

const closeCart = () => emit("close");

// fetch current cart on mount
onMounted(() => {
  cart.fetchCart();
});

// close when clicking outside or pressing Escape
onClickOutside(panelRef, closeCart);
useEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

// remove a single item
const removeItem = async (productId) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await cart.removeFromCart(productId);
  } catch (err) {
    console.error("Failed to remove item:", err);
  } finally {
    isLoading.value = false;
  }
};

// change cursor when loading
watch(isLoading, (val) => {
  document.body.style.cursor = val ? "wait" : "";
});
</script>

<style scoped>
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
