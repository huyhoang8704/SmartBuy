<template>
  <div class="max-w-5xl mx-auto mt-6">
    <!-- Progress Steps -->
    <div class="flex justify-center text-lg mb-8">
      <NuxtLink to="/cart">
        <div class="text-gray-400">1.Giỏ hàng</div>
      </NuxtLink>
      <div class="mx-2 text-gray-400">></div>
      <div class="text-[#00B14F] font-medium">2.Thanh toán</div>
      <div class="mx-2 text-gray-400">></div>
      <div class="text-gray-400">3.Đặt hàng</div>
    </div>

    <n-card size="large" class="shadow-lg">
      <template v-if="checkout.selectedItems.length === 0">
        <n-result
          status="warning"
          title="Không có sản phẩm nào được chọn"
          description="Vui lòng quay lại giỏ hàng và chọn sản phẩm">
          <template #footer>
            <NuxtLink to="/cart">
              <n-button type="primary"> Quay lại giỏ hàng </n-button>
            </NuxtLink>
          </template>
        </n-result>
      </template>

      <template v-else>
        <n-space vertical size="large">
          <div class="text-xl font-bold pb-4">Xác nhận đơn hàng</div>

          <!-- Selected Products (Read-only) -->
          <div class="border rounded-md p-4">
            <div class="text-lg font-semibold mb-4">Sản phẩm đã chọn</div>
            <div
              v-for="item in checkout.selectedItems"
              :key="item.productId"
              class="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0">
              <div class="col-span-2">
                <img
                  :src="item.image"
                  alt="product"
                  class="w-16 h-16 object-cover rounded" />
              </div>
              <div class="col-span-6 font-medium">
                <div>{{ item.name }}</div>
                <div class="text-sm text-gray-500">
                  Số lượng: {{ item.quantity }}
                </div>
              </div>
              <div class="col-span-4 text-right font-semibold">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>

            <div class="flex justify-between py-4 mt-2 font-bold text-lg">
              <div>Tổng tiền:</div>
              <div class="text-red-600">
                {{ formatPrice(checkout.totalPrice) }}
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="border rounded-md p-4">
            <div class="text-lg font-semibold mb-4">Thông tin khách hàng</div>
            <n-form
              :model="userInformation"
              :rules="customerRules"
              ref="formRef"
              label-placement="left"
              label-width="120px">
              <n-form-item label="Họ và tên" path="name">
                <n-input
                  v-model:value="userInformation.name"
                  placeholder="Nhập họ và tên" />
              </n-form-item>
              <n-form-item label="Số điện thoại" path="phone">
                <n-input
                  v-model:value="userInformation.phone"
                  placeholder="Nhập số điện thoại" />
              </n-form-item>
              <n-form-item label="Địa chỉ" path="address">
                <n-input
                  v-model:value="userInformation.address"
                  placeholder="Nhập địa chỉ giao hàng" />
              </n-form-item>
              <n-form-item label="Ghi chú" path="note">
                <n-input
                  v-model:value="userInformation.note"
                  type="textarea"
                  placeholder="Ghi chú đơn hàng (không bắt buộc)" />
              </n-form-item>
            </n-form>
          </div>

          <!-- Payment Methods -->
          <div class="border rounded-md p-4">
            <div class="text-lg font-semibold mb-4">Phương thức thanh toán</div>
            <n-radio-group v-model:value="paymentMethod">
              <n-space vertical>
                <n-radio value="cash">Thanh toán khi nhận hàng (COD)</n-radio>
                <n-radio value="banking">Chuyển khoản ngân hàng</n-radio>
              </n-space>
            </n-radio-group>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between mt-6">
            <NuxtLink to="/cart">
              <n-button class="bg-gray-600 text-white">
                <span class="mr-2">←</span> Quay lại giỏ hàng
              </n-button>
            </NuxtLink>
            <n-button
              type="primary"
              size="large"
              :loading="isLoading"
              @click="placeOrder">
              XÁC NHẬN ĐẶT HÀNG
            </n-button>
          </div>
        </n-space>
      </template>
    </n-card>
  </div>
</template>

<script setup>
import { useCheckoutStore } from "@/stores/checkout";
import { useCartStore } from "@/stores/cart";
import { useNotification } from "naive-ui";
import { ref, onMounted } from "vue";
import { useFormatPrice } from "~/composables/utils/useFormatters";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";

const checkout = useCheckoutStore();
const cart = useCartStore();
const notification = useNotification();
const { formatPrice } = useFormatPrice();
const isLoading = ref(false);
const formRef = ref(null);

// Token for API calls
const token = localStorage.getItem("authToken");
const userId = localStorage.getItem("userId");
const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

// Customer information
const userInformation = ref({
  name: "",
  phone: "",
  address: "",
  note: "",
});

// Fetch user data when component mounts
try {
  const userData = await $fetch(`${serverUrl}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Correctly assign fetched values to the ref
  userInformation.value = {
    name: userData.name || "",
    phone: userData.phone || "",
    address: userData.address || "",
    note: userInformation.value.note, // Preserve any existing note
  };
} catch (error) {
  console.error("Failed to fetch user data:", error);
}

// Form validation rules
const customerRules = {
  name: {
    required: true,
    message: "Vui lòng nhập họ và tên",
    trigger: "blur",
  },
  phone: {
    required: true,
    message: "Vui lòng nhập số điện thoại",
    trigger: "blur",
  },
  address: {
    required: true,
    message: "Vui lòng nhập địa chỉ giao hàng",
    trigger: "blur",
  },
};

// Payment method
const paymentMethod = ref("cash");

// Place order
const placeOrder = async () => {
  // Validate form first
  try {
    await formRef.value?.validate();
  } catch (errors) {
    return; // Form validation failed
  }

  isLoading.value = true;

  // Format the order data
  const orderData = {
    selectedItems: checkout.selectedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    paymentMethod: paymentMethod.value,
    userInformation: userInformation.value,
  };

  // Track user behavior
  useTrackBehavior("transaction", {
    selectedItems: orderData.selectedItems,
  }).catch((err) => console.warn("Tracking failed", err));

  // Submit order
  try {
    await $fetch(`${serverUrl}/order`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: orderData,
    });

    notification.success({
      title: "Đặt hàng thành công",
      content: "Đơn hàng của bạn đã được đặt thành công!",
      duration: 3000,
    });

    // Update cart and reset checkout
    await cart.fetchCart();
    checkout.resetCheckout();

    // Navigate to success page or home
    navigateTo("/");
  } catch (error) {
    console.error("Order failed:", error);
    notification.error({
      title: "Đặt hàng thất bại",
      content: "Đã xảy ra lỗi, vui lòng thử lại!",
      duration: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

// Check if we have items in checkout
onMounted(() => {
  if (checkout.selectedItems.length === 0) {
    notification.warning({
      title: "Không có sản phẩm",
      content: "Vui lòng chọn sản phẩm từ giỏ hàng trước",
      duration: 3000,
    });
  }
});
</script>
