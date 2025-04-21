<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="grid md:grid-cols-2 gap-8 items-start">
      <!-- Product Image -->
      <div
        class="w-fit aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-400">
        <img
          v-if="product.thumbnail_url"
          :src="product.thumbnail_url"
          :alt="product.name"
          class="w-full h-full object-cover" />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gray-300 text-gray-500">
          No Image
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-4">
        <h1 class="text-2xl font-semibold text-gray-800">
          {{ product.name }}
        </h1>

        <n-rate
          :value="product.rating"
          readonly
          size="medium"
          class="text-yellow-400" />

        <p class="text-gray-700 text-sm whitespace-pre-line">
          {{ product.description || "Không có mô tả cho sản phẩm này." }}
        </p>

        <div class="text-lg font-bold text-red-500">
          {{ formatPrice(product.price) }}
        </div>

        <div class="text-sm text-gray-600">
          <p>
            <span class="font-medium text-gray-700">Thương hiệu:</span>
            {{ product.brand_name }}
          </p>
          <p>
            <span class="font-medium text-gray-700">Danh mục:</span>
            {{ product.category }}
          </p>
          <p>
            <span class="font-medium text-gray-700">Kho:</span>
            {{ product.stock }} sản phẩm
          </p>
        </div>

        <n-button type="primary" size="large" round>
          Thêm vào giỏ hàng
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSingleProduct } from "~/composables/api/useSingleProduct";

const route = useRoute();
const { data } = await useSingleProduct({ slug: route.params.slug });
const product = data.value;

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
</script>
