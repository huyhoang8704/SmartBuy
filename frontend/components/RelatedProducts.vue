<template>
  <div v-if="items?.length" class="mt-10">
    <h2 class="text-xl font-bold text-gray-900 mb-5">Sản phẩm liên quan</h2>
    <n-carousel
      :slides-per-view="slidesPerView"
      show-arrow
      draggable="true"
      autoplay
      :interval="3000"
      class="product-carousel">
      <n-carousel-item v-for="item in items" :key="item._id">
        <n-card
          class="product-card hover:cursor-pointer"
          @click="navigateTo(`/product/${item.slug}`)">
          <div class="product-image-container">
            <img
              v-if="item.thumbnail_url"
              :src="item.thumbnail_url"
              :alt="item.name || 'Product image'"
              class="product-image"
              @error="handleImageError($event)" />
            <div v-else class="no-image">
              <span class="text-gray-500 text-xs">No image</span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h3 class="product-name" :title="item.name">
              {{ item.name || "Unnamed Product" }}
            </h3>

            <n-rate
              :value="item.rating || 0"
              readonly
              size="small"
              class="text-yellow-400 my-2" />

            <div class="flex justify-between items-center mt-2">
              <span class="product-price">
                {{ item.price ? formatPrice(item.price) : "N/A" }}
              </span>
              <!-- <n-button
                size="small"
                type="success"
                round
                @click.stop="handleAddToCart(item, $event)">
                Add
              </n-button> -->
            </div>
          </div>
        </n-card>
      </n-carousel-item>
    </n-carousel>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { NCarousel, NCarouselItem, NCard, NRate, NButton } from "naive-ui";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

// Responsive slides per view based on screen width
const slidesPerView = computed(() => {
  // Use window.innerWidth only if in browser environment
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

const handleAddToCart = (item, event) => {
  event.stopPropagation(); // Prevent navigating to product page when adding to cart
  // Add to cart logic would go here
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
</script>

<style scoped>
.product-carousel {
  --n-arrow-background-color: rgba(255, 255, 255, 0.9);
  --n-arrow-color: rgba(0, 0, 0, 0.6);
  --n-dot-color: rgba(0, 0, 0, 0.2);
  --n-dot-color-active: rgba(0, 0, 0, 0.5);
  min-height: 320px;
}

.n-carousel-item {
  padding: 8px;
  display: flex;
  justify-content: center;
}

.product-card {
  width: 100%;
  height: 100%;
  max-width: 220px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
}

.product-image-container {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  background-color: #f9f9f9;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.product-info {
  padding: 12px 8px;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}

.product-price {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e53e3e;
}

/* Making Naive UI buttons nicer */
:deep(.n-button) {
  font-weight: 500;
}

:deep(.n-button--primary-type) {
  background-color: #4f46e5;
}

:deep(.n-button--primary-type:hover) {
  background-color: #4338ca;
}
</style>
