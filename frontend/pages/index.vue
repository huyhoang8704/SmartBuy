<template>
  <div class="w-full min-h-screen flex flex-col md:flex-row gap-6">
    <!-- Sidebar (Sticky, height fit to content) -->
    <aside class="w-full md:w-64 flex-shrink-0 sticky top-30 z-5 self-start">
      <CategoryMenu
        :selectedCategory="selectedCategory"
        @update:selectedCategory="(value) => (selectedCategory = value)" />
    </aside>

    <!-- Main Content -->
    <div class="flex-grow space-y-8">
      <!-- Filter & Sort Bar -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
      <div
        v-if="productsData.length === 0 || productGridLoading"
        class="flex justify-center py-12">
        <n-spin size="large" />
      </div>

      <!-- Product Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 h-fit">
        <template v-for="product in productsData" :key="product._id">
          <n-card
            class="rounded-lg shadow-sm transition hover:shadow-md hover:scale-[1.01] cursor-pointer p-2">
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
              <button @click="viewProduct(product)" class="hover:underline">
                <h3
                  class="text-sm font-semibold text-gray-800 truncate min-h-[1.25rem] text-start">
                  {{ product.name || "Unnamed Product" }}
                </h3>
              </button>

              <p class="text-gray-600 text-xs mt-0.5 truncate min-h-[1.75rem]">
                {{ product.description || "No description available." }}
              </p>

              <n-rate
                :value="product.rating || 0"
                readonly
                size="small"
                class="text-yellow-400" />

              <div class="flex justify-between items-center mt-1">
                <span class="text-red-500 font-semibold text-xs">
                  {{ product.price ? formatPrice(product.price) : "N/A" }}
                </span>
                <!-- <n-button
                  size="small"
                  type="primary"
                  round
                  @click="handleAddToCart(product, $event)">
                  Add
                </n-button> -->
              </div>
            </div>
          </n-card>
        </template>
      </div>

      <div
        v-if="productsData.length && productsData.length === 0"
        class="text-center py-12">
        <p class="text-gray-500">No products found matching your filters</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="productsData.length && productsData.length > 0"
        class="flex justify-center">
        <n-pagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :page-size="pageSize"
          size="large"
          round
          @update:page-size="onPageSizeChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useProducts } from "~/composables/api/useProducts";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";
import CategoryMenu from "~/components/CategoryMenu.vue";

// State variables
const productsData = ref([]);
const pageCount = ref(0);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedSort = ref("rating-desc");
const currentPage = ref(1);
const pageSize = ref(16);
const cart = useCartStore();

const productGridLoading = ref(false);

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
  console.log(selectedCategory.value);
  productGridLoading.value = true;
  const { data } = await useProducts({
    page: currentPage.value,
    limit: pageSize.value,
    sortKey: sortParams.value.sortKey,
    sortValue: sortParams.value.sortValue,
    category: selectedCategory === "all" ? null : selectedCategory.value,
    search: searchQuery.value,
  });
  productsData.value = data.value.products;
  pageCount.value = data.value.totalPages ?? 1;
  productGridLoading.value = false;
};

// Watch for changes that require data refetching
watch(
  [currentPage, pageSize, selectedSort, searchQuery, selectedCategory],
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
  selectedCategory.value = ""; // Default to "all" category
  fetchProducts();
});

// Handle image loading errors
const handleImageError = (e) => {
  e.target.src =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22300%22 height%3D%22300%22 viewBox%3D%220 0 300 300%22%3E%3Crect fill%3D%22%23e0e0e0%22 width%3D%22300%22 height%3D%22300%22%2F%3E%3C%2Fsvg%3E";
  e.target.onerror = null;
};

// Add product to cart

function handleAddToCart(product) {
  cart.addToCart(product);
}

function viewProduct(product) {
  console.log("Clicked!", product);

  useTrackBehavior("view", {
    selectedItems: [{ productId: product._id, quantity: 1 }],
  })
    .then((success) => console.log("Tracked:", success))
    .catch((err) => console.warn("Tracking failed:", err));

  navigateTo(`/product/${product.slug}`);
}

function formatPrice(value) {
  if (typeof value !== "number") return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}
</script>

<style scoped>
/* Optional: Add consistent scale/bubbly hover effects */
:deep(.n-card:hover) {
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
</style>
