<template>
  <card
    @click="onClick"
    class="bg-white text-black hover:text-white hover:cursor-pointer hover:bg-black text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 w-64">
    <div class="flex justify-center relative">
      <div class="w-full aspect-square p-4 flex items-center justify-center">
        <img
          :src="product.thumbnail_url"
          :alt="product.name"
          class="max-h-full object-contain"
          @error="handleImageError" />
      </div>
    </div>

    <!-- Product Content -->
    <div class="px-4 pb-6">
      <h3 class="uppercase text-sm font-semibold tracking-wide line-clamp-1">
        {{ product.name || "Unnamed Product" }}
      </h3>

      <p class="text-lg font-semibold">
        {{ formatPrice(product.price) }}
      </p>

      <!-- <button
        class="w-full mt-4 py-2 text-sm font-semibold text-white bg-black hover:bg-white hover:text-black transition duration-100"
        @click="onClick">
        VIEW PRODUCT
      </button> -->
    </div>
  </card>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: "green", // green, orange, yellow
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
  emit("click", product);
};

// Tailwind color mappings
const colorMap = {
  green: {
    dot: "bg-teal-500",
    button: "bg-teal-500 hover:bg-teal-600",
    price: "text-teal-600",
  },
  orange: {
    dot: "bg-orange-500",
    button: "bg-orange-500 hover:bg-orange-600",
    price: "text-orange-600",
  },
  yellow: {
    dot: "bg-yellow-500",
    button: "bg-yellow-500 hover:bg-yellow-600",
    price: "text-yellow-600",
  },
};

const priceColor = colorMap[props.color]?.price || "text-gray-800";
</script>
