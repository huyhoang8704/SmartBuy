<template>
  <div class="min-h-screen bg-gray-100 flex flex-col be-vietnam-pro">
    <!-- Header - Full width with minimal outer padding -->
    <header
      class="sticky top-0 z-10 mx-4 my-2 p-4 bg-[#D9FCDE] shadow-lg items-center border-b-1 rounded-2xl">
      <div class="w-full rounded-2xl p-4 bg-[#D9FCDE]">
        <div class="flex items-center justify-between">
          <!-- Logo with bubbly effect -->
          <div class="text-2xl font-bold">
            <span class="flex items-center">
              <NuxtLink class="font-tektur text-4xl flex flex-row" to="/">
                <p class="text-[#00B14F]">Smart</p>
                <p>Buy</p></NuxtLink
              >
            </span>
          </div>
          <div class="hidden md:block flex-1 max-w-md mx-6 relative">
            <n-input-group>
              <n-input
                v-model:value="searchQuery"
                placeholder="Tìm kiếm..."
                size="medium"
                @keyup.enter="navigateToSearch" />
              <n-button
                type="primary"
                color="#00B14F"
                @click="navigateToSearch">
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
              <n-button
                color="#00B14F"
                v-if="authStore.isAuthenticated"
                @click="logOut">
                Đăng xuất
              </n-button>
              <n-button v-else color="#00B14F" @click="logIn">
                Đăng nhập
              </n-button>
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
      <div class="rounded-2xl shadow-md px-4 py-2">
        <slot />
        <!-- Placeholder content -->
        <div v-if="!$slots.default" class="text-center py-12 text-gray-400">
          <NuxtIcon name="shopping-bag" class="h-16 w-16 mx-auto mb-4" />
          <p class="text-xl">Your products will appear here</p>
        </div>
      </div>
    </div>
    <!-- Footer - Full width with minimal padding -->
    <footer class="w-full p-4">
      <div class="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Top part with bubbly sections -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <!-- Shop -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-3">SmartBuy</h3>
            <p class="text-gray-600">
              Shop the latest trends with our curated selection of products
            </p>
          </div>
          <!-- Quick Links -->
          <div></div>
          <!-- Contact -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-3">Contact Us</h3>
            <p class="text-gray-600">hello@SmartBuy.com</p>
            <p class="text-gray-600">(123) 456-7890</p>
          </div>
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
