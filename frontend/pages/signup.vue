<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Main Content Area -->
    <div class="flex-1 w-full p-4 flex items-center justify-center">
      <!-- Sign Up Card -->
      <n-card class="rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Create Account</h2>
          <p class="text-gray-600 mt-2">Sign up for a new MyShop account</p>
        </div>

        <n-form>
          <!-- Name Field -->
          <n-form-item label="Full Name">
            <n-input
              v-model:value="fullName"
              type="text"
              placeholder="Enter your full name"
              round
              class="login-input" />
          </n-form-item>

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
              placeholder="Create a password"
              show-password-on="click"
              class="login-input" />
          </n-form-item>

          <!-- Confirm Password -->
          <n-form-item label="Confirm Password">
            <n-input
              v-model:value="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              show-password-on="click"
              class="login-input" />
          </n-form-item>

          <!-- Sign Up Button -->
          <n-button
            tag="a"
            type="primary"
            block
            round
            color="#ff4d4f"
            class="text-lg font-medium">
            Sign Up
          </n-button>

          <!-- Divider -->
          <div class="py-4 flex items-center">
            <div class="flex-1 border-t border-gray-200" />
            <span class="px-4 text-sm text-gray-400">OR</span>
            <div class="flex-1 border-t border-gray-200" />
          </div>

          <!-- Login Link -->
          <div class="text-center text-gray-600">
            Already have an account?
            <NuxtLink to="/login">
              <n-button text class="text-red-500">Login</n-button>
            </NuxtLink>
          </div>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

definePageMeta({ layout: "blank" });

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
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
</style>
