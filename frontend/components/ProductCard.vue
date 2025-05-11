<template>
  <div
    class="product-card p-2 mx-1 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
    @click="onClick">
    <!-- Product Image -->
    <div class="relative w-full aspect-square overflow-hidden">
      <img
        :src="product.thumbnail_url"
        :alt="product.name || 'Product image'"
        class="w-full h-full object-cover"
        @error="handleImageError" />
    </div>

    <!-- Product Details -->
    <div class="p-4">
      <!-- Product Name -->
      <div
        class="text-lg font-bold font-merriweather text-gray-800 line-clamp-2">
        {{ product.name }}
      </div>
      <!-- Product Price -->
      <div class="be-vietnam-pro text-gray-900 mt-2">
        {{ formatPrice(product.price) }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

import { useFormatPrice } from "~/composables/utils/useFormatters";

const { formatPrice } = useFormatPrice();

const emit = defineEmits(["click"]);

const handleImageError = (e) => {
  e.target.src =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22300%22 height%3D%22300%22 viewBox%3D%220 0 300 300%22%3E%3Crect fill%3D%22%23f1f1f1%22 width%3D%22300%22 height%3D%22300%22%2F%3E%3C%2Fsvg%3E";
  e.target.onerror = null;
};

const onClick = () => {
  emit("click", props.product);
};
</script>
<style scoped>
.product-card {
  border: 1px solid rgba(229, 231, 235, 0.7);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  background-color: whitesmoke;
}

.product-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background-color: #000000; /* Grab brand color, adjust as needed */
  transition: width 0.3s ease, left 0.3s ease;
  transform: translateX(-50%);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: rgba(229, 231, 235, 0.1);
}

.product-card:hover::after {
  width: 95%;
}
</style>
