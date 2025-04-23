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

        <div
          v-if="cart.items.length === 0"
          class="text-gray-500 text-center mt-10">
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
              <div class="text-sm text-gray-500 mb-1">
                Số lượng:
                <button
                  @click="changeQuantity(item.id, item.quantity - 1)"
                  :disabled="isLoading"
                  class="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  -
                </button>

                {{ item.quantity }}
                <button
                  @click="changeQuantity(item.id, item.quantity + 1)"
                  :disabled="isLoading"
                  class="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  +
                </button>
              </div>
              <div class="text-red-600 font-semibold">
                Giá: {{ (item.price * item.quantity).toLocaleString() }} đ
              </div>
            </div>
          </div>
        </div>

        <div
          class="pt-4 border-t mt-4 font-bold flex items-center justify-between">
          Tổng cộng: {{ cart.totalPrice.toLocaleString() }} đ
          <div>
            <NuxtLink to="/checkout"
              ><n-button size="medium" type="primary" round @click="closeCart"
                >Đặt hàng</n-button
              ></NuxtLink
            >
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { onClickOutside, useEventListener } from "@vueuse/core";

const cart = useCartStore();
const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close"]);
const panelRef = ref(null);
const closeCart = () => emit("close");
const isLoading = ref(false);

onMounted(() => {
  cart.fetchCart();
});

onClickOutside(panelRef, closeCart);
useEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});
const changeQuantity = async (productId, newQty) => {
  isLoading.value = true;
  try {
    if (newQty <= 0) {
      await cart.removeFromCart(productId);
    } else {
      await cart.updateCartItem(productId, newQty);
      await cart.fetchCart();
    }
  } finally {
    isLoading.value = false;
  }
};

watch(isLoading, (val) => {
  if (val) {
    document.body.style.cursor = "wait";
  } else {
    document.body.style.cursor = "";
  }
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
