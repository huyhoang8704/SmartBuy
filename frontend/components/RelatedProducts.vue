<template>
  <div v-if="items?.length" class="mt-10">
    <h2 class="text-xl font-bold text-gray-900 mb-5">Sản phẩm liên quan</h2>
    <n-carousel
      :slides-per-view="slidesPerView"
      draggable="true"
      :show-dots="false"
      autoplay
      :interval="3000"
      class="product-carousel">
      <n-carousel-item v-for="item in items" :key="item._id">
        <!-- Use ProductCard Component -->
        <ProductCard
          :product="item"
          :key="item._id"
          @click="viewProduct(item)" />
      </n-carousel-item>
    </n-carousel>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { NCarousel, NCarouselItem } from "naive-ui";
import ProductCard from "~/components/ProductCard.vue";
import { useFormatPrice } from "~/composables/utils/useFormatters";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

// Get formatPrice helper
const { formatPrice } = useFormatPrice();

// Responsive slides per view based on screen width
const slidesPerView = computed(() => {
  if (typeof window === "undefined") return 4;

  const width = window.innerWidth;
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return 3;
  return 4;
});

const handleImageError = (e) => {
  e.target.src = "/placeholder-image.png";
};

function viewProduct(product) {
  console.log("Clicked!", product);

  useTrackBehavior("view", {
    selectedItems: [{ productId: product._id, quantity: 1 }],
  })
    .then((success) => console.log("Tracked:", success))
    .catch((err) => console.warn("Tracking failed:", err));

  navigateTo(`/product/${product.slug}`);
}
</script>

<style scoped></style>
