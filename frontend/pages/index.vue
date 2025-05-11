<template>
  <div class="w-full min-h-screen flex flex-col md:flex-row gap-6">
    <!-- Sidebar (Sticky, height fit to content) -->
    <aside
      class="w-full md:w-64 flex-shrink-0 sticky top-30 z-5 self-start px-1">
      <button
        class="md:hidden bg-gray-200 p-2 rounded mb-2"
        @click="isSidebarOpen = !isSidebarOpen">
        {{ isSidebarOpen ? "Ẩn danh mục" : "Hiện danh mục" }}
      </button>
      <div v-show="isSidebarOpen" class="transition-all duration-300">
        <CategoryMenu
          :selectedCategory="selectedCategory"
          @update:selectedCategory="(value) => (selectedCategory = value)" />
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow space-y-8">
      <!-- Filter & Sort Bar -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 ml-auto">
          <span class="text-sm text-gray-600">Sắp xếp theo:</span>
          <span>
            <n-select
              v-model:value="selectedSort"
              :options="sortOptions"
              class="min-w-[150px] w-auto"
              round
              :consistent-menu-width="false" />
          </span>
        </div>
      </div>

      <!-- Search Tag -->
      <div v-if="searchQuery" class="flex items-center">
        <div
          class="bg-gray-100 rounded-md py-1 px-3 flex items-center gap-2 text-sm">
          <span class="font-medium text-gray-600">Tìm kiếm:</span>
          <span class="text-primary">{{ searchQuery }}</span>
          <button
            @click="clearSearch"
            class="ml-2 text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Xóa tìm kiếm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Product Grid Container - Always rendered to prevent layout shifts -->
      <div class="grid-container">
        <!-- Skeleton Loader -->
        <div
          v-if="productGridLoading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8 h-fit">
          <template v-for="n in pageSize" :key="n">
            <div class="rounded-lg shadow-sm p-2 animate-pulse">
              <div
                class="w-full aspect-square bg-gray-200 rounded-md mb-2"></div>
              <div class="space-y-2 p-4">
                <div class="h-5 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </div>
            </div>
          </template>
        </div>

        <!-- No Products Found -->
        <div
          v-else-if="!productGridLoading && productsData.length === 0"
          class="text-center py-12">
          <p class="text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
          </p>
        </div>

        <!-- Product Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8 h-fit">
          <ProductCard
            v-for="product in productsData"
            :key="product._id"
            :product="product"
            @click="viewProduct(product)" />
        </div>
      </div>
      <!-- Pagination -->
      <div
        v-if="!productGridLoading && productsData.length > 0"
        class="flex justify-center mt-6">
        <n-pagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :page-size="pageSize"
          size="large"
          round />
      </div>
    </div>
  </div>

  <!-- Add a scroll-to-top button -->
  <nbutton
    v-if="showScrollToTop"
    @click="scrollToTop"
    class="fixed bottom-4 right-4 px-4 text-white hover:cursor-pointer hover:bg-gray-900 bg-black p-2 transition-transform transform hover:scale-110">
    Về đầu trang
  </nbutton>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useProducts } from "~/composables/api/useProducts";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";
import { useFormatPrice } from "~/composables/utils/useFormatters";
import CategoryMenu from "~/components/CategoryMenu.vue";
import ProductCard from "~/components/ProductCard.vue";

// Initialize route and router
const route = useRoute();
const router = useRouter();

const { $trackBehavior } = useNuxtApp();

// State variables
const productsData = ref([]);
const pageCount = ref(0);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedSort = ref("");
const currentPage = ref(1);
const pageSize = ref(16); // Initial value, will be updated based on screen size
const cart = useCartStore();
const { formatPrice } = useFormatPrice();
const authStore = useAuthStore(); // Access the auth store
const isAuthenticated = computed(() => authStore.isAuthenticated); // Make it reactive

const productGridLoading = ref(false);

// Calculate items per row and pageSize based on window width
const calculatePageSize = () => {
  if (typeof window === "undefined") return;

  const width = window.innerWidth;
  let itemsPerRow = 3; // Default for most screens (lg breakpoint)

  if (width < 640) {
    itemsPerRow = 1; // Small screens (mobile)
  } else if (width < 1024) {
    itemsPerRow = 2; // Medium screens (tablet)
  } else if (width >= 1280) {
    itemsPerRow = 4; // XL screens
  }

  // Update pageSize: 5 rows * items per row
  pageSize.value = 5 * itemsPerRow;
};

// Call on mount and on window resize
onMounted(() => {
  calculatePageSize();
  window.addEventListener("resize", calculatePageSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", calculatePageSize);
});

// Watch for route query changes to update the search query
watch(
  () => route.query.search,
  (newSearchQuery) => {
    if (newSearchQuery) {
      searchQuery.value = newSearchQuery;
    } else {
      searchQuery.value = "";
    }
  },
  { immediate: true }
);

// Sidebar state
const isSidebarOpen = ref(true);

// Sort options based on API parameters (sortKey: "price" or "rating", sortValue: "asc" or "desc")
const sortOptions = [
  { label: "Mặc định", value: "" }, // Updated value to null for default
  { label: "Giá: Thấp đến cao", value: "price-asc" },
  { label: "Giá: Cao đến Thấp", value: "price-desc" },
  { label: "Đánh giá: Thấp đến cao", value: "rating-asc" },
  { label: "Đánh giá: Cao đến Thấp", value: "rating-desc" },
];

// Split the selected sort option into sortKey and sortValue
const sortParams = computed(() => {
  if (selectedSort.value === "") {
    return null; // Return null for default sorting
  }
  const [key, value] = selectedSort.value.split("-");
  return { sortKey: key, sortValue: value };
});

// Scroll-to-top functionality
const showScrollToTop = ref(false);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.addEventListener("scroll", () => {
  showScrollToTop.value = window.scrollY > 300;
});

// Function to update URL query parameters without causing a page reload
const updateQueryParams = () => {
  const query = {};

  // Only include page in query if we're not on page 1
  if (currentPage.value > 1) {
    query.page = currentPage.value.toString();
  }

  if (selectedCategory.value && selectedCategory.value !== "all") {
    query.category = selectedCategory.value;
  }

  if (selectedSort.value) {
    query.sort = selectedSort.value;
  }

  // Preserve search query in URL if it exists
  if (searchQuery.value) {
    query.search = searchQuery.value;
  }

  // Replace current URL with new query parameters
  router.replace({ query });
};

// Fetch products from API
const fetchProducts = async () => {
  productGridLoading.value = true;

  try {
    const data = await useProducts({
      page: currentPage.value,
      limit: pageSize.value,
      sortKey: sortParams.value?.sortKey ?? null,
      sortValue: sortParams.value?.sortValue ?? null,
      category:
        selectedCategory.value === "all" ? null : selectedCategory.value,
      search: searchQuery.value,
    });

    productsData.value = data.products;
    pageCount.value = data.totalPages ?? 1;

    // Update URL query parameters
    updateQueryParams();
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    // Small delay before removing loading state to prevent flickering
    setTimeout(() => {
      productGridLoading.value = false;
    }, 100);
  }
};

// Watch for filter or sort changes to reset pagination to page 1
watch([selectedSort, selectedCategory, searchQuery], () => {
  // Reset to page 1 when any filter changes
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    // No need to call fetchProducts here as the watch on currentPage will trigger it
  }
});

// Watch for product-related changes
watch(
  [currentPage, pageSize, selectedSort, selectedCategory, searchQuery],
  async (
    [newPage, newLimit, newSort, newCategory, newSearch],
    [oldPage, oldLimit, oldSort, oldCategory, oldSearch]
  ) => {
    if (
      newPage !== oldPage ||
      newLimit !== oldLimit ||
      newSort !== oldSort ||
      newCategory !== oldCategory ||
      newSearch !== oldSearch
    ) {
      await fetchProducts();
      scrollToTop();
    }
  }
);

// Separate watch for authentication state
watch(isAuthenticated, async (newAuth, oldAuth) => {
  if (newAuth !== oldAuth) {
    console.log("Authentication state changed:", newAuth);
    await fetchProducts();
    scrollToTop();
  }
});

// Parse URL query parameters on initial load
onMounted(() => {
  // Extract values from URL query parameters
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page) || 1;
  }

  if (route.query.sort) {
    selectedSort.value = route.query.sort.toString();
  }

  if (route.query.category) {
    selectedCategory.value = route.query.category.toString();
  } else {
    selectedCategory.value = ""; // Default to "all" category
  }

  fetchProducts();
});

// Watch for route changes (including path and query params)
// This ensures products are refetched when user clicks the logo to go back to homepage
watch(
  () => route.fullPath,
  () => {
    // Reset search query when path changes to root without search param
    if (route.path === "/" && !route.query.search) {
      searchQuery.value = "";
    }

    // Read query parameters
    currentPage.value = parseInt(route.query.page) || 1;
    selectedSort.value = route.query.sort?.toString() || "";
    selectedCategory.value = route.query.category?.toString() || "";

    // Fetch products with new parameters
    fetchProducts();
  }
);

// Add automatic scroll-to-top after page change
watch(currentPage, () => {
  scrollToTop();
});

// Handle image loading errors
const handleImageError = (e) => {
  e.target.src =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22300%22 height%3D%22300%22 viewBox%3D%220 0 300 300%22%3E%3Crect fill%3D%22%23e0e0e0%22 width%3D%22300%22 height%3D%22300%22%2F%3E%3C%2Fsvg%3E";
  e.target.onerror = null;
};

function viewProduct(product) {
  // useTrackBehavior("view", {
  //   selectedItems: [{ productId: product._id, quantity: 1 }],
  // })
  //   .then((success) => console.log("Tracked:", success))
  //   .catch((err) => console.warn("Tracking failed:", err));
  $trackBehavior("view", {
    selectedItems: [{ productId: product._id, quantity: 1 }],
  });
  navigateTo(`/product/${product.slug}`);
}

// Clear search query and all filters
function clearSearch() {
  // Reset all filters and search
  searchQuery.value = "";
  selectedSort.value = "";
  selectedCategory.value = "all";
  currentPage.value = 1;

  // Update URL and refetch products
  updateQueryParams();
  fetchProducts();
}
</script>

<style scoped>
.grid-container {
  min-height: 400px; /* Ensures consistent minimum height */
}

/* Smoother transitions between states */
.grid-container > div {
  transition: opacity 0.2s ease-in-out;
}
</style>
