<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header - Full width with minimal outer padding -->

    <!-- Main Content Area - Full width with minimal padding -->
    <div class="flex-1 w-full p-4 flex items-center justify-center">
      <!-- Login Card -->
      <n-card class="rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Chào mừng trở lại</h2>
          <p class="text-gray-600 mt-2">
            Đăng nhập vào tài khoản NeoBuy của bạn
          </p>
        </div>

        <n-form>
          <!-- Email Field -->
          <n-form-item label="Email">
            <n-input
              v-model:value="email"
              type="email"
              placeholder="Nhập email của bạn"
              round
              class="login-input"
              @keyup.enter="logIn" />
          </n-form-item>

          <!-- Password Field -->
          <n-form-item label="Mật khẩu">
            <n-input
              v-model:value="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              class="login-input"
              show-password-on="click"
              @keyup.enter="logIn" />
          </n-form-item>

          <!-- Remember Me & Forgot Password -->
          <!-- <div class="flex justify-between items-center mb-6">
            <n-checkbox>Ghi nhớ đăng nhập</n-checkbox>
            <n-button text class="text-red-500 text-sm"
              >Quên mật khẩu?</n-button
            >
          </div> -->

          <!-- Login Button -->

          <n-button
            type="primary"
            block
            class="text-lg font-medium"
            @click="logIn">
            Đăng nhập
          </n-button>

          <!-- Divider -->
          <div class="py-4 flex items-center">
            <div class="flex-1 border-t border-gray-200" />
            <span class="px-4 text-sm text-gray-400">HOẶC</span>
            <div class="flex-1 border-t border-gray-200" />
          </div>

          <!-- Sign Up Link -->
          <div class="text-center text-gray-600">
            Bạn chưa có tài khoản?
            <NuxtLink to="/signup" class="underline hover:text-orange-600">
              Đăng ký
            </NuxtLink>
          </div>
        </n-form>
      </n-card>
    </div>

    <!-- Footer - Full width with minimal padding -->
  </div>
</template>

<script setup>
import { useNotification } from "naive-ui";
import { ref } from "vue";
import { useLogIn } from "~/composables/api/useLogIn";

definePageMeta({ layout: "blank" });
const notification = useNotification();

// Form data
const email = ref("");
const password = ref("");
const loading = ref(false);

const validateForm = () => {
  if (!email.value || !password.value) {
    notification.error({
      content: "Vui lòng điền đầy đủ các trường bắt buộc.",
      duration: 3000,
    });
    return false;
  }
  return true;
};

const logIn = async () => {
  if (!validateForm()) return;

  loading.value = true;
  const result = await useLogIn({
    email: email.value,
    password: password.value,
  });
  if (result.success) {
    const redirectPath = localStorage.getItem("currentPageTrack");

    if (redirectPath) {
      localStorage.removeItem("currentPageTrack");
      navigateTo(redirectPath);
    } else {
      navigateTo("/"); // Or dashboard, etc.
    }
  } else {
    notification.error({
      content: result.message,
      duration: 3000,
    });
  }
  loading.value = false;
};
</script>

<style scoped>
/* Bubbly effect styles */
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

social-btn:hover {
  background-color: #f9fafb;
}

:deep(.n-form-item .n-form-item-label) {
  font-weight: 500;
  color: #4b5563;
}
</style>
