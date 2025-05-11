<template>
  <div class="max-w-6xl h-full mx-auto px-4 py-8">
    <div class="grid md:grid-cols-2 gap-10 items-start">
      <!-- Product Image - Reduced Size -->
      <div class="flex justify-center items-center">
        <div
          class="w-3/4 aspect-square bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
          <img
            v-if="product.thumbnail_url"
            :src="product.thumbnail_url"
            :alt="product.name"
            class="w-full h-full object-cover" />
          <div
            v-else
            class="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500">
            Không có ảnh
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-6">
        <h1 class="text-3xl font-bold text-gray-900 roboto-unique">
          {{ product.name }}
        </h1>

        <n-rate
          :value="product.rating"
          readonly
          size="medium"
          class="text-yellow-400" />

        <p class="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
          {{ product.description || "Không có mô tả cho sản phẩm này." }}
        </p>

        <div class="text-2xl font-extrabold text-red-500">
          {{ formatPrice(product.price) }}
        </div>

        <div class="space-y-2 text-sm text-gray-700 border-t pt-4">
          <p>
            <span class="font-medium text-gray-800">Thương hiệu:</span>
            {{ product.brand_name }}
          </p>
          <p>
            <span class="font-medium text-gray-800">Danh mục:</span>
            {{ product.category }}
          </p>
          <p>
            <span class="font-medium text-gray-800">Kho:</span>
            {{ product.stock }} sản phẩm
          </p>
        </div>

        <!-- Quantity Selector -->
        <div class="flex items-center gap-3 pt-2">
          <label class="text-sm font-medium text-gray-700">Số lượng:</label>
          <n-input-number
            v-model:value="quantity"
            :min="1"
            :max="product.stock"
            size="medium"
            class="w-28 text-center"
            button-placement="both" />
        </div>

        <n-button
          color="#00B14F"
          size="large"
          @click="handleAddToCart(product)">
          Thêm vào giỏ hàng
        </n-button>
      </div>
    </div>

    <!-- Related Products -->
    <RelatedProducts :items="relatedProducts" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSingleProduct } from "~/composables/api/useSingleProduct";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";
import { useFormatPrice } from "~/composables/utils/useFormatters";
import RelatedProducts from "~/components/RelatedProducts.vue";
import { useNotification } from "naive-ui";

const notification = useNotification();

// Get route params
const route = useRoute();
const slug = route.params.slug;
const cartStore = useCartStore();

// State variables
const product = ref(null);
const quantity = ref(1);
const isAddingToCart = ref(false);

// Import formatPrice helper
const { formatPrice } = useFormatPrice();

const { data } = await useSingleProduct({ slug });
const authStore = useAuthStore();

product.value = data.value.product;
console.log(data.value);
const relatedProducts = data.value.relatedProducts;

async function handleAddToCart(product) {
  if (!authStore.isAuthenticated) {
    localStorage.setItem("currentPageTrack", route.path);
    navigateTo("/login");
    return;
  }
  useTrackBehavior("addtocart", {
    selectedItems: [{ productId: product._id, quantity: quantity.value }],
  })
    .catch((err) => console.warn("Tracking failed:", err))
    .then((success) => console.log("Tracked:", success));

  const success = await cartStore.addToCart(product, quantity.value);
  if (success) {
    notification.success({
      content: "Thêm vào giỏ hàng thành công",
      duration: 3000,
    });
  }
}
</script>
