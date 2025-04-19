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
        <div class="hidden md:block flex-1 max-w-md mx-6 relative">
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

          <!-- Suggestion dropdown -->
          <!-- <div
            v-if="searchSuggestions.length"
            class="absolute z-10 w-full bg-white border mt-1 rounded shadow">
            <div
              v-for="(product, index) in searchSuggestions"
              :key="index"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              @click="searchQuery = product.name">
              {{ product.name }}
            </div>
          </div> -->
        </div>

        <div class="flex items-center gap-3 ml-auto">
          <span class="text-sm text-gray-600">Sort by:</span>
          <n-select
            v-model:value="selectedSort"
            :options="sortOptions"
            class="w-48"
            round />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="productData.length === 0" class="flex justify-center py-12">
        <n-spin size="large" />
      </div>

      <!-- Product Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 h-fit">
        <n-card
          v-for="product in productData"
          :key="product._id"
          class="rounded-lg shadow-sm transition hover:shadow-md hover:scale-[1.01] cursor-pointer p-2">
          <!-- Product Image -->
          <div
            class="w-full aspect-square bg-gray-100 rounded-md overflow-hidden mb-2">
            <img
              v-if="product.thumbnail_url"
              :src="product.thumbnail_url"
              :alt="product.name || 'Product image'"
              class="w-full h-full object-cover"
              @error="(e) => handleImageError(e)" />

            <div
              v-else
              class="w-full h-full bg-gray-300 flex items-center justify-center">
              <span class="text-gray-500 text-xs">No image</span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-1 min-h-[90px] flex flex-col justify-between">
            <h3
              class="text-sm font-semibold text-gray-800 truncate min-h-[1.25rem]">
              {{ product.name || "Unnamed Product" }}
            </h3>
            <p class="text-gray-600 text-xs mt-0.5 truncate min-h-[1.75rem]">
              {{ product.description || "No description available." }}
            </p>
            <div class="flex justify-between items-center mt-1">
              <span class="text-red-500 font-semibold text-xs">
                {{ product.price ? formatPrice(product.price) : "N/A" }}
              </span>
              <n-button size="small" type="primary" round>Add</n-button>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Empty state -->
      <div
        v-if="productData.length && productData.length === 0"
        class="text-center py-12">
        <p class="text-gray-500">No products found matching your filters</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="productData.length && productData.length > 0"
        class="flex justify-center">
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
import { ref, computed, watch, onMounted } from "vue";
import { useProducts } from "~/composables/api/useProducts";

// State variables
const productData = ref([]);
const pageCount = ref(0);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedSort = ref("price-desc");
const currentPage = ref(1);
const pageSize = ref(8);

// Sort options based on API parameters (sortKey: "price" or "rating", sortValue: "asc" or "desc")
const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating: Low to High", value: "rating-asc" },
  { label: "Rating: High to Low", value: "rating-desc" },
];

// Split the selected sort option into sortKey and sortValue
const sortParams = computed(() => {
  const [key, value] = selectedSort.value.split("-");
  return { sortKey: key, sortValue: value };
});

// Fetch products from API
const fetchProducts = async () => {
  console.log("Calling fetchProducts");
  const { data } = await useProducts({
    page: currentPage.value,
    limit: pageSize.value,
    sortKey: sortParams.value.sortKey,
    sortValue: sortParams.value.sortValue,
    search: searchQuery.value,
  });

  watch(data, (newValue) => {
    if (newValue) {
      productData.value = newValue.products;
      pageCount.value = newValue.totalPages || 1;
    }
  });
};

// Watch for changes that require data refetching
watch(
  [currentPage, pageSize, selectedSort, searchQuery],
  (
    [newPage, newLimit, newSort, newSearch],
    [oldPage, oldLimit, oldSort, oldSearch]
  ) => {
    // Only trigger if search is empty or long enough
    if (
      typeof newSearch === "string" &&
      (newSearch.length > 2 || newSearch === "")
    ) {
      if (
        newLimit !== oldLimit ||
        newSearch !== oldSearch ||
        newSort !== oldSort
      ) {
        currentPage.value = 1; // Reset page if any of those change
      }
      fetchProducts();
    }
  },
  { immediate: true }
);
// Initial data load
onMounted(() => {
  fetchProducts();
});

// Get unique categories from the data
const uniqueCategories = computed(() => {
  if (!productData.value.length) return [];

  // Extract unique categories from products
  return [...new Set(productData.value.map((product) => product.category))];
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

// Handle category selection from sidebar menu
const onCategorySelect = (key) => {
  selectedCategory.value = key || "all";
};

// Update page when page size changes
const onPageSizeChange = (size) => {
  pageSize.value = size;
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
