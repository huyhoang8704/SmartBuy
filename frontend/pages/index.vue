<template>
  <div class="w-full h-full flex flex-col md:flex-row gap-6">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 flex-shrink-0">
      <n-card class="rounded-2xl shadow-md h-full">
        <template #header>
          <div class="text-lg font-bold px-2">Categories</div>
        </template>
        <n-menu
          :options="menuItems"
          :value="selectedCategory === 'all' ? null : selectedCategory"
          class="bubbly-menu"
          @update:value="onCategorySelect" />
      </n-card>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow space-y-8">
      <!-- Filter & Sort Bar -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 flex-wrap md:hidden">
          <n-select
            v-model:value="selectedCategory"
            :options="categoryOptions"
            placeholder="Category"
            class="w-full md:w-48"
            round />
        </div>
        <div class="hidden md:block flex-1 max-w-md mx-6">
          <n-input-group>
            <n-input
              v-model:value="searchQuery"
              placeholder="Search..."
              round
              size="medium" />

            <n-button type="primary" round>
              <Icon
                name="material-symbols:search-rounded"
                style="color: black" />
            </n-button>
          </n-input-group>
        </div>
        <div class="flex items-center gap-3 ml-auto">
          <span class="text-sm text-gray-600">Sort by:</span>
          <n-select
            v-model:value="sortOption"
            :options="sortOptions"
            class="w-48"
            round />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="!productData" class="flex justify-center py-12">
        <n-spin size="large" />
      </div>

      <!-- Product Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <n-card
          v-for="product in displayedProducts"
          :key="product._id"
          class="rounded-2xl shadow-md transition hover:shadow-xl hover:scale-[1.01] cursor-pointer">
          <div
            class="relative w-full pb-[100%] bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="absolute top-0 left-0 w-full h-full object-cover"
              @error="(e) => handleImageError(e)" />
            <div
              v-else
              class="absolute top-0 left-0 w-full h-full bg-gray-300 flex items-center justify-center">
              <span class="text-gray-500 text-sm">No image</span>
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
              <span class="text-red-500 font-bold">
                {{ formatPrice(product.price) }}
              </span>
              <n-button size="small" type="primary" round>Add to Cart</n-button>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Empty state -->
      <div
        v-if="productData && displayedProducts.length === 0"
        class="text-center py-12">
        <p class="text-gray-500">No products found matching your filters</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="productData && displayedProducts.length > 0"
        class="flex justify-center pt-6">
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProducts } from "~/composables/api/useProducts";

const { data: productData } = useProducts();
const searchQuery = ref("");

// Get unique categories from the data
const uniqueCategories = computed(() => {
  if (!productData.value) return [];

  // Extract unique categories from products
  const categories = [
    ...new Set(productData.value.map((product) => product.category)),
  ];
  return categories;
});

// For the category dropdown selector
const categoryOptions = computed(() => {
  return [
    { label: "All Categories", value: "all" },
    ...uniqueCategories.value.map((category) => ({
      label: category,
      value: category,
    })),
  ];
});

// For the sidebar menu - formatted for Naive UI menu
const menuItems = computed(() => {
  return [
    {
      label: "All Categories",
      key: "all",
      onClick: () => (selectedCategory.value = "all"),
    },
    ...uniqueCategories.value.map((category) => ({
      label: category,
      key: category,
      onClick: () => (selectedCategory.value = category),
    })),
  ];
});

// Sort options
const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

// State variables
const selectedCategory = ref("all");
const sortOption = ref("price-asc");
const currentPage = ref(1);
const pageSize = ref(8);

// Handle category selection from sidebar menu
const onCategorySelect = (key) => {
  selectedCategory.value = key || "all";
};

// Filter products based on selections
const filteredProducts = computed(() => {
  if (!productData.value) return [];

  let result = [...productData.value];

  // Apply category filter
  if (selectedCategory.value !== "all") {
    result = result.filter(
      (product) => product.category === selectedCategory.value
    );
  }

  // Apply search filter
  if (searchQuery.value.trim() !== "") {
    const keyword = searchQuery.value.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword)
    );
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
  if (!filteredProducts.value) return 1;
  return Math.ceil(filteredProducts.value.length / pageSize.value);
});

// Get products for current page
const displayedProducts = computed(() => {
  if (!filteredProducts.value) return [];

  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredProducts.value.slice(startIndex, startIndex + pageSize.value);
});

// Update page when page size changes
const onPageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // Reset to first page
};

// Format price to Vietnamese currency
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Handle image loading errors
const handleImageError = (e) => {
  e.target.src =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22300%22 height%3D%22300%22 viewBox%3D%220 0 300 300%22%3E%3Crect fill%3D%22%23e0e0e0%22 width%3D%22300%22 height%3D%22300%22%2F%3E%3C%2Fsvg%3E";
  e.target.onerror = null;
};
</script>

<style scoped>
/* Optional: Add consistent scale/bubbly hover effects */
:deep(.n-card:hover) {
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* Add some styling for the menu */
:deep(.bubbly-menu .n-menu-item) {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.bubbly-menu .n-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.bubbly-menu .n-menu-item-content--selected) {
  border-radius: 8px;
}
</style>
