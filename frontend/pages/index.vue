<template>
  <ClientOnly>
    <div class="space-y-8">
      <!-- Filter & Sort Bar -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <n-select
            v-model:value="selectedCategory"
            :options="categoryOptions"
            placeholder="Category"
            class="w-full md:w-48"
            round />
          <n-select
            v-model:value="selectedBrand"
            :options="brandOptions"
            placeholder="Brand"
            class="w-fit"
            round />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">Sort by:</span>
          <n-select
            v-model:value="sortOption"
            :options="sortOptions"
            class="w-48"
            round />
        </div>
      </div>
      <!-- Product Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <n-card
          v-for="product in displayedProducts"
          :key="product.id"
          class="rounded-2xl shadow-md transition hover:shadow-xl hover:scale-[1.01] cursor-pointer">
          <div
            class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-xl overflow-hidden mb-4">
            <div
              class="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
              Product Image
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 truncate">
              {{ product.name }}
            </h3>
            <p class="text-gray-600 text-sm mt-1 truncate">
              {{ product.description }}
            </p>
            <div class="flex justify-between items-center mt-3">
              <span class="text-red-500 font-bold"
                >${{ product.price.toFixed(2) }}</span
              >
              <n-button size="small" type="primary" round>Add to Cart</n-button>
            </div>
          </div>
        </n-card>
      </div>
      <!-- Pagination -->
      <div class="flex justify-center pt-6">
        <n-pagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :page-size="pageSize"
          :page-sizes="[8, 16, 24]"
          size="large"
          show-size-picker
          round
          @update:page-size="onPageSizeChange" />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, computed } from "vue";

// Mock data for products
const products = ref([
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    description: "Premium wireless earbuds with noise cancellation",
    price: 129.99,
    category: "Electronics",
    brand: "SoundMax",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Track your activities with this advanced fitness watch",
    price: 89.99,
    category: "Electronics",
    brand: "FitTech",
  },
  {
    id: 3,
    name: "Leather Backpack",
    description: "Stylish and durable backpack for everyday use",
    price: 59.99,
    category: "Fashion",
    brand: "UrbanStyle",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    description: "Crisp sound quality with 12hr battery life",
    price: 49.99,
    category: "Electronics",
    brand: "SoundMax",
  },
  {
    id: 5,
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt for casual wear",
    price: 19.99,
    category: "Fashion",
    brand: "ComfortWear",
  },
  {
    id: 6,
    name: "Yoga Mat",
    description: "Non-slip yoga mat for home workouts",
    price: 29.99,
    category: "Sports",
    brand: "FitTech",
  },
  {
    id: 7,
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 79.99,
    category: "Home",
    brand: "HomePro",
  },
  {
    id: 8,
    name: "Gaming Mouse",
    description: "High-precision gaming mouse with RGB lighting",
    price: 45.99,
    category: "Electronics",
    brand: "GameTech",
  },
  {
    id: 9,
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp with multiple brightness levels",
    price: 34.99,
    category: "Home",
    brand: "HomePro",
  },
  {
    id: 10,
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned soles",
    price: 89.99,
    category: "Sports",
    brand: "SportStep",
  },
  {
    id: 11,
    name: "Water Bottle",
    description: "Insulated stainless steel water bottle",
    price: 24.99,
    category: "Sports",
    brand: "FitTech",
  },
  {
    id: 12,
    name: "Denim Jeans",
    description: "Classic denim jeans with stretch fabric",
    price: 49.99,
    category: "Fashion",
    brand: "UrbanStyle",
  },
  {
    id: 13,
    name: "Smart Bulb Set",
    description: "Color-changing smart bulbs with app control",
    price: 39.99,
    category: "Home",
    brand: "HomePro",
  },
  {
    id: 14,
    name: "Wireless Charger",
    description: "Fast wireless charger for smartphones",
    price: 29.99,
    category: "Electronics",
    brand: "TechCharge",
  },
  {
    id: 15,
    name: "Plant Pot Set",
    description: "Set of 3 decorative ceramic plant pots",
    price: 32.99,
    category: "Home",
    brand: "GreenLiving",
  },
  {
    id: 16,
    name: "Bluetooth Headphones",
    description: "Over-ear wireless headphones with mic",
    price: 79.99,
    category: "Electronics",
    brand: "SoundMax",
  },
]);

// Category filter options
const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Electronics", value: "Electronics" },
  { label: "Fashion", value: "Fashion" },
  { label: "Home", value: "Home" },
  { label: "Sports", value: "Sports" },
];

// Brand filter options
const brandOptions = [
  { label: "All Brands", value: "all" },
  { label: "SoundMax", value: "SoundMax" },
  { label: "FitTech", value: "FitTech" },
  { label: "UrbanStyle", value: "UrbanStyle" },
  { label: "ComfortWear", value: "ComfortWear" },
  { label: "HomePro", value: "HomePro" },
  { label: "GameTech", value: "GameTech" },
  { label: "SportStep", value: "SportStep" },
  { label: "TechCharge", value: "TechCharge" },
  { label: "GreenLiving", value: "GreenLiving" },
];

// Sort options
const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

// State variables
const selectedCategory = ref("all");
const selectedBrand = ref("all");
const sortOption = ref("price-asc");
const currentPage = ref(1);
const pageSize = ref(8);

// Filter products based on selections
const filteredProducts = computed(() => {
  let result = [...products.value];

  // Apply category filter
  if (selectedCategory.value !== "all") {
    result = result.filter(
      (product) => product.category === selectedCategory.value
    );
  }

  // Apply brand filter
  if (selectedBrand.value !== "all") {
    result = result.filter((product) => product.brand === selectedBrand.value);
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortOption.value) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return result;
});

// Calculate total pages
const pageCount = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value);
});

// Get products for current page
const displayedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredProducts.value.slice(startIndex, startIndex + pageSize.value);
});

// Update page when page size changes
const onPageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // Reset to first page
};
</script>

<style scoped>
/* Optional: Add consistent scale/bubbly hover effects */
:deep(.n-card:hover) {
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
</style>
