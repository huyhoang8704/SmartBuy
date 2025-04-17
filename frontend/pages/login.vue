<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header - Full width with minimal outer padding -->

    <!-- Main Content Area - Full width with minimal padding -->
    <div class="flex-1 w-full p-4 flex items-center justify-center">
      <!-- Login Card -->
      <n-card class="rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p class="text-gray-600 mt-2">Log in to your MyShop account</p>
        </div>

        <n-form>
          <!-- Email Field -->
          <n-form-item label="Email">
            <n-input
              v-model:value="email"
              type="email"
              placeholder="Enter your email"
              round
              class="login-input" />
          </n-form-item>

          <!-- Password Field -->
          <n-form-item label="Password">
            <n-input
              v-model:value="password"
              type="password"
              placeholder="Enter your password"
              class="login-input"
              show-password-on="click" />
          </n-form-item>

          <!-- Remember Me & Forgot Password -->
          <div class="flex justify-between items-center mb-6">
            <n-checkbox>Remember me</n-checkbox>
            <n-button text class="text-red-500 text-sm"
              >Forgot Password?</n-button
            >
          </div>

          <!-- Login Button -->

          <n-button
            tag="a"
            type="primary"
            block
            round
            color="#ff4d4f"
            class="text-lg font-medium">
            Login
          </n-button>

          <!-- Divider -->
          <div class="py-4 flex items-center">
            <div class="flex-1 border-t border-gray-200" />
            <span class="px-4 text-sm text-gray-400">OR</span>
            <div class="flex-1 border-t border-gray-200" />
          </div>

          <!-- Sign Up Link -->
          <div class="text-center text-gray-600">
            Don't have an account?
            <NuxtLink to="/signup">
              <n-button text class="text-red-500">Sign Up</n-button>
            </NuxtLink>
          </div>
        </n-form>
      </n-card>
    </div>

    <!-- Footer - Full width with minimal padding -->
  </div>
</template>

<script setup>
import { ref } from "vue";

definePageMeta({ layout: "blank" });

// Form data
const email = ref("");
const password = ref("");

// Navigation function (placeholder)
const navigateHome = () => {
  // This would use router.push('/') in a real implementation
  console.log("Navigate to home");
};

// Category menu kept for reference if needed
const categoryOptions = [
  {
    label: "Electronics",
    key: "electronics",
  },
  {
    label: "Fashion",
    key: "fashion",
  },
  {
    label: "Home & Garden",
    key: "home",
  },
  {
    label: "Sports",
    key: "sports",
  },
  {
    label: "Books",
    key: "books",
  },
];
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

.social-btn:hover {
  background-color: #f9fafb;
}

:deep(.n-form-item .n-form-item-label) {
  font-weight: 500;
  color: #4b5563;
}
</style>
