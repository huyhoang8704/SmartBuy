<template>
  <div class="w-full min-h-screen flex flex-col md:flex-row gap-6">
    <!-- Sidebar (Sticky, height fit to content) -->
    <aside class="w-full md:w-64 flex-shrink-0 sticky top-30 z-5 self-start">
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

      <!-- Loading state -->
      <div v-if="productGridLoading" class="flex justify-center py-12">
        <n-spin size="large" />
      </div>

      <!-- Skeleton Loader -->
      <div
        v-if="productGridLoading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 h-fit">
        <template v-for="n in 8" :key="n">
          <div class="rounded-lg shadow-sm p-2 animate-pulse">
            <div class="w-full aspect-square bg-gray-200 rounded-md mb-2"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- No Products Found -->
      <div
        v-if="!productGridLoading && productsData.length === 0"
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

      <!-- Pagination -->
      <div
        v-if="productsData.length && productsData.length > 0"
        class="flex justify-center">
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
  <button
    v-if="showScrollToTop"
    @click="scrollToTop"
    class="fixed bottom-4 right-4 px-4 hover:bg-white hover: text-black text-white hover:cursor-pointer bg-black p-2 transition-transform transform hover:scale-110">
    Về đầu trang
  </button>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useProducts } from "~/composables/api/useProducts";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";
import { useFormatPrice } from "~/composables/utils/useFormatters";
import CategoryMenu from "~/components/CategoryMenu.vue";
import ProductCard from "~/components/ProductCard.vue";

// State variables
const productsData = ref([]);
const pageCount = ref(0);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedSort = ref("");
const currentPage = ref(1);
const pageSize = ref(16);
const cart = useCartStore();
const { formatPrice } = useFormatPrice();
const authStore = useAuthStore(); // Access the auth store
const isAuthenticated = computed(() => authStore.isAuthenticated); // Make it reactive

const productGridLoading = ref(false);

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

// Fetch products from API
const fetchProducts = async () => {
  productGridLoading.value = true;

  const data = await useProducts({
    page: currentPage.value,
    limit: pageSize.value,
    sortKey: sortParams.value?.sortKey ?? null,
    sortValue: sortParams.value?.sortValue ?? null,
    category: selectedCategory.value === "all" ? null : selectedCategory.value,
    search: searchQuery.value,
  });

  productsData.value = data.products;
  pageCount.value = data.totalPages ?? 1;
  productGridLoading.value = false;
};

// Watch for product-related changes
watch(
  [currentPage, pageSize, selectedSort, searchQuery, selectedCategory],
  async (
    [newPage, newLimit, newSort, newSearch, newCategory],
    [oldPage, oldLimit, oldSort, oldSearch, oldCategory]
  ) => {
    if (
      newPage !== oldPage ||
      newLimit !== oldLimit ||
      newSort !== oldSort ||
      newSearch !== oldSearch ||
      newCategory !== oldCategory
    ) {
      await fetchProducts();
    }
  }
);

// Separate watch for authentication state
watch(isAuthenticated, async (newAuth, oldAuth) => {
  if (newAuth !== oldAuth) {
    console.log("Authentication state changed:", newAuth);
    await fetchProducts();
  }
});
// Initial data load
onMounted(() => {
  selectedCategory.value = ""; // Default to "all" category
  fetchProducts();
});
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
