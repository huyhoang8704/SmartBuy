<template>
  <n-card
    title="🛒 Giỏ hàng của bạn"
    size="large"
    class="max-w-3xl mx-auto mt-6 shadow-lg">
    <n-space vertical size="large">
      <template v-if="cart.items.length === 0">
        <n-empty description="Giỏ hàng trống" />
        <div class="flex justify-center mt-4">
          <NuxtLink to="/">
            <n-button size="medium" round>Tiếp tục mua hàng</n-button>
          </NuxtLink>
        </div>
      </template>

      <template v-else>
        <!-- Select All -->
        <div class="flex items-center gap-2">
          <n-checkbox
            v-model:checked="selectAll"
            @update:checked="toggleSelectAll">
            Chọn tất cả ({{ selectedItems.length }}/{{ cart.items.length }})
          </n-checkbox>
        </div>

        <n-list bordered>
          <n-list-item
            v-for="item in cart.items"
            :key="item.id"
            class="flex flex-row items-center gap-4">
            <!-- Product Image + Checkbox Grouped Together -->
            <div class="flex items-center gap-3 min-w-[80px]">
              <n-checkbox
                :checked="isItemSelected(item.id)"
                @update:checked="(val) => toggleSelectItem(item.id, val)" />

              <img
                :src="item.image"
                alt="product"
                class="w-16 h-16 object-cover rounded border" />
            </div>

            <!-- Product Info + Quantity -->
            <div class="flex-1">
              <div class="font-medium text-base">{{ item.name }}</div>
              <div class="text-sm text-gray-500 mb-1">
                Đơn giá: {{ item.price.toLocaleString() }} đ
              </div>
              <n-input-number
                v-model:value="item.quantity"
                :min="1"
                size="small"
                @update:value="(val) => changeQuantity(item.id, val)"
                class="text-center"
                :disabled="isLoading"
                button-placement="both"
                style="width: 100px" />
            </div>

            <!-- Total per item -->
            <div class="text-right font-bold text-red-600 whitespace-nowrap">
              {{ (item.price * item.quantity).toLocaleString() }} đ
            </div>
          </n-list-item>
        </n-list>

        <!-- Total and Checkout -->
        <div class="flex justify-between items-center mt-6">
          <div class="text-xl font-semibold">Tổng cộng:</div>
          <div class="text-2xl font-bold text-green-600">
            {{ totalSelectedPrice.toLocaleString() }} đ
          </div>
        </div>

        <n-button
          type="primary"
          size="large"
          block
          :loading="isLoading"
          :disabled="selectedItems.length === 0"
          @click="checkout">
          Thanh toán {{ selectedItems.length }} sản phẩm
        </n-button>
      </template>
    </n-space>
  </n-card>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { useNotification } from "naive-ui";
import { ref, computed, watch } from "vue";

const cart = useCartStore();
const isLoading = ref(false);
const token = localStorage.getItem("authToken");

const notification = useNotification();

// Track selected items
const selectedItems = ref([]); // [{ productId: string, quantity: number }]

const selectAll = computed({
  get: () => selectedItems.value.length === cart.items.length,
  set: (val) => toggleSelectAll(val),
});

const toggleSelectAll = (checked) => {
  selectedItems.value = checked
    ? cart.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))
    : [];
};

const toggleSelectItem = (id, checked) => {
  const existingIndex = selectedItems.value.findIndex(
    (item) => item.productId === id
  );
  if (checked && existingIndex === -1) {
    const item = cart.items.find((item) => item.id === id);
    if (item) {
      selectedItems.value.push({ productId: id, quantity: item.quantity });
    }
  } else if (!checked && existingIndex !== -1) {
    selectedItems.value.splice(existingIndex, 1);
  }
};

// Handle quantity changes
const changeQuantity = async (id, qty) => {
  if (qty <= 0) return;
  isLoading.value = true;
  await cart.updateCartItem(id, qty);
  await cart.fetchCart();
  isLoading.value = false;

  // Sync quantity in selectedItems if selected
  const selected = selectedItems.value.find((item) => item.productId === id);
  if (selected) {
    selected.quantity = qty;
  }
};

// Total price of selected
const totalSelectedPrice = computed(() => {
  return selectedItems.value.reduce((sum, selectedItem) => {
    const cartItem = cart.items.find(
      (item) => item.id === selectedItem.productId
    );
    return sum + (cartItem?.price || 0) * selectedItem.quantity;
  }, 0);
});

// For checkbox binding
const isItemSelected = (id) => {
  return selectedItems.value.some((item) => item.productId === id);
};

// Checkout simulation
const checkout = async () => {
  isLoading.value = true;
  const data = await $fetch("http://localhost:4000/order", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
    body: JSON.stringify({
      selectedItems: selectedItems.value,
      paymentMethod: "cash",
    }),
    onResponse({ response }) {
      isLoading.value = false;
      if (response.status !== 201) {
        console.log(response);
        notification.error({
          title: "Order Failed",
          content: "Something went wrong, please try again!",
        });
      } else {
        notification.success({
          title: "Order Success",
          content: "Your order has been placed successfully!",
          duration: 3000,
        });
        cart.fetchCart();
        navigateTo("/");
      }
    },
  });
};

watch(isLoading, (val) => {
  document.body.style.cursor = val ? "wait" : "";
});
</script>
