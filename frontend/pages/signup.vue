<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Main Content Area -->
    <div class="flex-1 w-full p-4 flex items-center justify-center">
      <!-- Sign Up Card -->
      <n-card class="rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Tạo Tài Khoản</h2>
          <p class="text-gray-600 mt-2">Đăng ký tài khoản NeoBuy mới</p>
        </div>

        <!-- Loading Spinner Wrap -->
        <n-spin :show="loading" size="large" class="relative w-full">
          <n-form class="w-full" label-placement="top">
            <!-- Name Field -->
            <n-form-item label="Họ và Tên" class="w-full">
              <n-input
                v-model:value="fullName"
                type="text"
                placeholder="Nhập họ và tên của bạn"
                round
                class="w-full" />
            </n-form-item>

            <!-- Email Field -->
            <n-form-item label="Email" class="w-full">
              <n-input
                v-model:value="email"
                type="email"
                placeholder="Nhập email của bạn"
                round
                class="w-full" />
            </n-form-item>

            <!-- Password Field -->
            <n-form-item label="Mật Khẩu" class="w-full">
              <n-input
                v-model:value="password"
                type="password"
                placeholder="Nhập mật khẩu"
                show-password-on="click"
                class="w-full" />
            </n-form-item>

            <!-- Confirm Password -->
            <n-form-item label="Xác Nhận Mật Khẩu" class="w-full">
              <n-input
                v-model:value="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu của bạn"
                show-password-on="click"
                class="w-full" />
            </n-form-item>

            <!-- Sign Up Button -->
            <n-button
              tag="a"
              type="success"
              block
              round
              class="text-lg font-medium w-full"
              @click="signUp">
              Đăng Ký
            </n-button>

            <!-- Divider -->
            <div class="py-4 flex items-center">
              <div class="flex-1 border-t border-gray-200" />
              <span class="px-4 text-sm text-gray-400">HOẶC</span>
              <div class="flex-1 border-t border-gray-200" />
            </div>

            <!-- Login Link -->
            <div class="text-center text-gray-600">
              Đã có tài khoản?
              <NuxtLink to="/login" class="underline hover:text-green-600">
                Đăng Nhập
              </NuxtLink>
            </div>
          </n-form>
        </n-spin>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from "naive-ui";
import { ref } from "vue";
import { useSignUp } from "~/composables/api/useSignUp";

definePageMeta({ layout: "blank" });
const notification = useNotification();

// Form data
const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const signUp = async () => {
  if (
    !fullName.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    notification.error({
      content: "Vui lòng điền đầy đủ tất cả các trường.",
      duration: 3000,
    });
    return;
  }
  if (password.value !== confirmPassword.value) {
    notification.error({ content: "Mật khẩu không khớp.", duration: 3000 });
    return;
  }

  loading.value = true;
  const result = await useSignUp({
    name: fullName.value,
    email: email.value,
    password: password.value,
  });

  loading.value = false;

  if (result.success) {
    localStorage.getItem("currentPageTrack")
      ? navigateTo(`${localStorage.getItem("currentPageTrack")}`)
      : navigateTo("/");
  } else {
    notification.error({ content: result.message, duration: 3000 });
  }
};
</script>

<style scoped>
:deep(.n-card) {
  border-radius: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.n-button) {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

:deep(.n-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.n-input) {
  border-radius: 1rem;
}

:deep(.n-form-item .n-form-item-label) {
  font-weight: 500;
  color: #4b5563;
}

.n-spin {
  position: absolute;
}
:deep(.n-form-item) {
  width: 100%;
}

:deep(.n-input) {
  width: 100%;
  border-radius: 1rem;
}
</style>
