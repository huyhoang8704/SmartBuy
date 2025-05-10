<template>
  <div class="min-h-screen bg-gray-50 flex flex-col be-vietnam-pro">
    <!-- Header - Full width with minimal outer padding -->
    <header
      class="sticky top-0 z-10 w-full p-4 bg-white shadow-lg items-center border-b-1">
      <div class="w-full rounded-2xl p-4 bg-white">
        <div class="flex items-center justify-between">
          <!-- Logo with bubbly effect -->
          <div class="text-2xl font-bold">
            <n-button text class="text-red-500 text-2xl font-bold rounded-full">
              <span class="flex items-center">
                <NuxtLink class="font-nunito text-4xl" to="/">FastBuy</NuxtLink>
              </span>
            </n-button>
          </div>
          <div class="hidden md:block flex-1 max-w-md mx-6 relative">
            <n-input-group>
              <n-input
                v-model:value="searchQuery"
                placeholder="Tìm kiếm..."
                size="medium"
                @keyup.enter="navigateToSearch" />
              <n-button type="primary" @click="navigateToSearch">
                <Icon
                  name="material-symbols:search-rounded"
                  style="color: white" />
              </n-button>
            </n-input-group>
          </div>
          <!-- Navigation with bubbly buttons -->
          <div class="flex items-center space-x-5 flex-row">
            <CartButton v-if="authStore.isAuthenticated" />
            <div>
              <n-button v-if="authStore.isAuthenticated" @click="logOut">
                Đăng xuất
              </n-button>
              <n-button v-else @click="logIn"> Đăng nhập </n-button>
            </div>
            <!-- Mobile menu toggle -->
            <!-- <n-button circle class="md:hidden">
              <Icon name="ooui:user-avatar" size="large"> </Icon>
            </n-button> -->
            <AvatarMenu v-if="authStore.isAuthenticated" />
          </div>
        </div>
      </div>
    </header>
    <!-- Main Content Area - Full width with minimal padding -->
    <div class="flex-1 w-full p-4">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Main Content - Bubbly card -->
        <main class="flex-1">
          <n-card class="rounded-2xl shadow-md">
            <slot />
            <!-- Placeholder content -->
            <div v-if="!$slots.default" class="text-center py-12 text-gray-400">
              <NuxtIcon name="shopping-bag" class="h-16 w-16 mx-auto mb-4" />
              <p class="text-xl">Your products will appear here</p>
            </div>
          </n-card>
        </main>
      </div>
    </div>
    <!-- Footer - Full width with minimal padding -->
    <footer class="w-full p-4">
      <div class="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Top part with bubbly sections -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <!-- Shop -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-3">MyShop</h3>
            <p class="text-gray-600">
              Shop the latest trends with our curated selection of products
            </p>
          </div>
          <!-- Quick Links -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-3">Quick Links</h3>
            <div class="flex flex-wrap gap-2">
              <n-button size="small" round ghost>Home</n-button>
              <n-button size="small" round ghost>Products</n-button>
              <n-button size="small" round ghost>About</n-button>
              <n-button size="small" round ghost>Contact</n-button>
            </div>
          </div>
          <!-- Contact -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-3">Contact Us</h3>
            <p class="text-gray-600">hello@myshop.com</p>
            <p class="text-gray-600">(123) 456-7890</p>
          </div>
        </div>
        <!-- Copyright -->
        <div class="bg-gray-100 py-3 px-6 text-center text-gray-500 text-sm">
          © 2025 MyShop. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import CartButton from "~/components/CartButton.vue";
import { useTrackBehavior } from "~/composables/api/useTrackBehavior";

const searchQuery = ref("");

const navigateToSearch = async () => {
  if (searchQuery.value.trim() === "") {
    navigateTo("/");
    return;
  } else {
    useTrackBehavior("search", {
      keyword: searchQuery.value,
    })
      .then((success) => console.log("Tracked:", success))
      .catch((err) => console.warn("Tracking failed:", err));

    // Navigate to index page with search query parameter instead of separate search page
    navigateTo({
      path: "/",
      query: {
        search: searchQuery.value.trim(),
      },
    });
    searchQuery.value = "";
  }
};

const authStore = useAuthStore();

const logOut = () => {
  authStore.logOut(); // Log out and update state
  // navigateTo("/");
};

const logIn = () => {
  localStorage.setItem("currentPageTrack", useRoute().path);
  navigateTo("/login");
  return;
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

:deep(.bubbly-menu .n-menu-item) {
  border-radius: 0.75rem;
  margin-bottom: 0.25rem;
  transition: transform 0.15s ease;
}

:deep(.bubbly-menu .n-menu-item:hover) {
  transform: scale(1.02);
}
</style>
