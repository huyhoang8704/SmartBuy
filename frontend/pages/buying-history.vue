<template>
  <div class="max-w-5xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">
      Lịch sử mua hàng
    </h1>

    <div
      v-if="orders.length === 0"
      class="flex justify-center items-center h-40 bg-gray-50 rounded-lg shadow-inner">
      <n-empty description="Bạn chưa có đơn hàng nào" />
    </div>

    <div class="space-y-6" v-else>
      <div
        v-for="order in orders"
        :key="order._id"
        class="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-lg transition">
        <!-- Order Summary -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <div class="font-semibold text-lg text-gray-800">
              Đơn hàng #ORD-{{ order._id.slice(-6).toUpperCase() }}
            </div>
            <div class="text-sm text-gray-500">
              Ngày đặt:
              {{ new Date(order.createdAt).toLocaleDateString("vi-VN") }}
            </div>
            <div class="text-base text-red-500 font-semibold mt-2">
              Tổng: {{ formatPrice(order.totalAmount) }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- <span
              class="text-sm px-3 py-1 rounded-full font-medium"
              :class="{
                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                'bg-green-100 text-green-700': order.status === 'completed',
                'bg-red-100 text-red-600': order.status === 'cancelled',
                'bg-blue-100 text-blue-700': order.status === 'processing',
              }">
              {{ order.status }}
            </span> -->
            <n-button
              @click="toggleExpand(order._id)"
              size="medium"
              type="primary">
              {{
                expandedOrders.has(order._id) ? "Ẩn chi tiết" : "Xem chi tiết"
              }}
            </n-button>
          </div>
        </div>

        <!-- Order Details -->
        <transition name="fade">
          <div
            v-if="expandedOrders.has(order._id)"
            class="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
            <div
              v-for="item in order.items"
              :key="item._id"
              class="flex gap-4 items-start border-t pt-4">
              <img
                :src="item.productId.thumbnail_url"
                alt="product image"
                class="w-20 h-20 object-cover rounded-lg shadow-sm" />
              <div>
                <h2 class="font-medium text-base text-gray-900">
                  {{ item.productId.name }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ item.quantity }} x {{ formatPrice(item.price) }}
                </p>
              </div>
            </div>

            <!-- Payment and Total -->
            <div class="flex justify-between items-center pt-3 border-t">
              <span class="text-sm text-gray-500">
                Phương thức thanh toán:
                {{
                  order.paymentMethod === "cash"
                    ? "Tiền mặt"
                    : order.paymentMethod
                }}
              </span>
              <span class="font-semibold text-lg text-red-500">
                Tổng: {{ formatPrice(order.totalAmount) }}
              </span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useFormatPrice } from "~/composables/utils/useFormatters";

const orders = ref([]);
const loading = ref(true);
const expandedOrders = ref(new Set());
const { formatPrice } = useFormatPrice();
const token = localStorage.getItem("authToken");
const serverUrl = process.env.SERVER_URL || "http://localhost:4000";
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated); // Make it reactive
onMounted(() => {
  if (!isAuthenticated) {
    navigateTo("/");
  }
});
// Separate watch for authentication state
watch(isAuthenticated, async (newAuth, oldAuth) => {
  if (newAuth !== oldAuth) {
    console.log("Authentication state changed:", newAuth);
    navigateTo("/");
  }
});

const fetchOrders = async () => {
  const data = await $fetch(`${serverUrl}/order/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onResponse({ response }) {
      if (response.status !== 200) {
        console.log(response);
      }
    },
  });
  orders.value = data.orders;
};

const toggleExpand = (orderId) => {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId);
  } else {
    expandedOrders.value.add(orderId);
  }
};

await fetchOrders();
</script>
