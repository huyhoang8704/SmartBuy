<template>
  <div class="max-w-5xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Lịch sử mua hàng</h1>

    <div
      v-if="orders.length === 0"
      class="flex justify-center items-center h-40">
      <n-empty description="Bạn chưa có đơn hàng nào" />
    </div>

    <div class="space-y-6" v-else>
      <div
        v-for="order in orders"
        :key="order._id"
        class="p-4 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition">
        <!-- Order Summary -->
        <div class="flex justify-between items-center mb-2">
          <div>
            <div class="font-semibold text-gray-800">
              Đơn hàng #ORD-{{ order._id.slice(-6).toUpperCase() }}
            </div>
            <div class="text-xs text-gray-500">
              Ngày đặt:
              {{ new Date(order.createdAt).toLocaleDateString("vi-VN") }}
            </div>
            <div class="text-sm text-red-500 font-semibold mt-1">
              Tổng: {{ order.totalAmount.toLocaleString() }}₫
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="{
                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                'bg-green-100 text-green-700': order.status === 'completed',
                'bg-red-100 text-red-600': order.status === 'cancelled',
                'bg-blue-100 text-blue-700': order.status === 'processing',
              }">
              {{ order.status }}
            </span>
            <n-button
              @click="toggleExpand(order._id)"
              round
              size="medium"
              type="success">
              {{
                expandedOrders.has(order._id) ? "Ẩn chi tiết" : "Xem chi tiết"
              }}
            </n-button>
          </div>
        </div>

        <!-- Order Details -->
        <div v-if="expandedOrders.has(order._id)" class="space-y-4 mt-3">
          <div
            v-for="item in order.items"
            :key="item._id"
            class="flex gap-4 items-start border-t pt-4">
            <img
              :src="item.productId.thumbnail_url"
              alt="product image"
              class="w-20 h-20 object-cover rounded-lg" />
            <div>
              <h2 class="font-medium text-base text-gray-900">
                {{ item.productId.name }}
              </h2>
              <p class="text-sm text-gray-500">
                {{ item.quantity }} x {{ item.price.toLocaleString() }}₫
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
              Tổng: {{ order.totalAmount.toLocaleString() }}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const orders = ref([]);
const expandedOrders = ref(new Set());
const token = localStorage.getItem("authToken");
const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

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
