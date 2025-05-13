<template>
  <div class="max-w-5xl mx-auto mt-6">
    <!-- Progress Steps -->
    <div class="flex justify-center text-lg mb-8 font-merriweather">
      <div class="text-[#00B14F] font-medium">1. Giỏ hàng</div>
      <div class="mx-2 text-gray-400">></div>
      <div class="text-gray-400">2. Thanh toán</div>
      <div class="mx-2 text-gray-400">></div>
      <div class="text-gray-400">3. Đặt hàng</div>
    </div>

    <n-card size="large" class="shadow-lg">
      <n-space vertical size="large">
        <template v-if="cart.items.length === 0">
          <n-empty description="Giỏ hàng trống" />
          <div class="flex justify-center mt-4">
            <NuxtLink to="/">
              <n-button size="medium">Tiếp tục mua hàng</n-button>
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <!-- Select All -->
          <div class="flex items-center gap-2 mb-2">
            <n-checkbox
              color="#00B14F"
              v-model:checked="selectAll"
              @update:checked="toggleSelectAll">
              Chọn tất cả ({{ selectedItems.length }}/{{ cart.items.length }})
            </n-checkbox>
          </div>

          <!-- Header -->
          <div class="grid grid-cols-14 pb-3 border-b text-gray-600">
            <div class="col-span-1"></div>
            <div class="col-span-4 text-center">Sản phẩm</div>
            <div class="col-span-2 text-center">Giá</div>
            <div class="col-span-3 text-center">Số lượng</div>
            <div class="col-span-2 text-right">Thành tiền</div>
            <div class="col-span-2 text-right"></div>
          </div>

          <!-- Product Items -->
          <div
            v-for="item in cart.items"
            :key="item.id"
            class="grid grid-cols-14 items-center py-4 border-b">
            <div class="col-span-1 flex justify-center">
              <n-checkbox
                color="#00B14F"
                :checked="isItemSelected(item.id)"
                @update:checked="
                  (checked) => toggleSelectItem(item.id, checked)
                ">
              </n-checkbox>
            </div>
            <div class="col-span-4 flex items-center gap-4">
              <img
                :src="item.image"
                alt="product"
                class="w-20 h-20 object-cover" />
              <div class="font-medium flex-1">{{ item.name }}</div>
            </div>

            <div class="col-span-2 text-center">
              {{ formatPrice(item.price) }}
            </div>

            <div class="col-span-3 flex flex-col items-center">
              <n-input-number
                v-model:value="item.quantity"
                class="text-center"
                button-placement="both"
                :disabled="isLoading"
                :max="item.stock"
                :min="1"
                @update:value="(value) => changeQuantity(item.id, value)">
              </n-input-number>
              <div class="text-xs text-gray-500 mt-1">
                Còn {{ item.stock }} sản phẩm
              </div>
            </div>

            <div class="col-span-2 text-right">
              <div>{{ formatPrice(item.price * item.quantity) }}</div>
            </div>
            <div class="col-span-2 text-right">
              <n-button
                type="error"
                class="text-gray-400 hover:text-gray-700"
                @click="removeItem(item.id)">
                X
              </n-button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between mt-6">
            <NuxtLink to="/">
              <n-button
                class="bg-gray-600 text-white px-6 py-2 flex items-center">
                <span class="mr-2">←</span> TIẾP TỤC MUA SẮM
              </n-button>
            </NuxtLink>
          </div>

          <!-- Proceed to Checkout -->
          <div class="mt-8 flex justify-end">
            <n-button
              type="primary"
              size="large"
              :loading="isLoading"
              :disabled="getSelectedCartItems() === 0"
              @click="proceedToPayment">
              TIẾN HÀNH THANH TOÁN
            </n-button>
          </div>
        </template>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { useCheckoutStore } from "@/stores/checkout";
import { useNotification } from "naive-ui";
import { ref, computed, watch, onMounted } from "vue";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";
import { useFormatPrice } from "~/composables/utils/useFormatters";

const cart = useCartStore();
const checkout = useCheckoutStore();
const isLoading = ref(false);
const token = localStorage.getItem("authToken");

const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

const notification = useNotification();
const { formatPrice } = useFormatPrice();

// Track selected items - array of IDs
const selectedItems = ref([]);

// Computed property for Select All checkbox
const selectAll = computed({
  get: () =>
    selectedItems.value.length === cart.items.length && cart.items.length > 0,
  set: (val) => toggleSelectAll(val),
});

const toggleSelectAll = (checked) => {
  if (checked) {
    selectedItems.value = cart.items.map((item) => item.id);
  } else {
    selectedItems.value = [];
  }
};

const isItemSelected = (id) => {
  return selectedItems.value.includes(id);
};

const toggleSelectItem = (id, checked) => {
  if (checked) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value = selectedItems.value.filter((itemId) => itemId !== id);
  }
};

// Get selected cart items for checkout
const getSelectedCartItems = () => {
  return cart.items
    .filter((item) => selectedItems.value.includes(item.id))
    .map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));
};

// Handle quantity changes
const changeQuantity = async (id, qty) => {
  if (qty <= 0) return;
  isLoading.value = true;
  await cart.updateCartItem(id, qty);
  await cart.fetchCart();
  isLoading.value = false;
};

// Remove item from cart
const removeItem = async (id) => {
  isLoading.value = true;
  // Remove from selected items if needed
  selectedItems.value = selectedItems.value.filter((itemId) => itemId !== id);
  await cart.removeFromCart(id);
  await cart.fetchCart();
  isLoading.value = false;
};

// Payment processing
const proceedToPayment = () => {
  // Check if items are selected
  const selectedCartItems = getSelectedCartItems();
  if (selectedCartItems.length === 0) {
    notification.warning({
      title: "Chưa chọn sản phẩm",
      content: "Vui lòng chọn ít nhất một sản phẩm để thanh toán",
      duration: 3000,
    });
    return;
  }

  // Get full item details for checkout
  const selectedItemsWithDetails = cart.items
    .filter((item) => selectedItems.value.includes(item.id))
    .map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.image,
    }));

  // Save selected items to checkout store and navigate
  checkout.setSelectedItems(selectedItemsWithDetails);
  checkout.nextStep();
  navigateTo("/checkout");
};

onMounted(() => {
  cart.fetchCart();
});

watch(isLoading, (val) => {
  document.body.style.cursor = val ? "wait" : "";
});
</script>
