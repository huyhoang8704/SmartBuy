<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-10 w-full p-4 bg-white shadow-lg">
      <div class="w-full bg-white rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div class="text-2xl font-bold">
            <n-button text class="text-red-500 text-2xl font-bold rounded-full">
              <NuxtLink to="/">SmartBuy</NuxtLink>
            </n-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main section with scroll -->
    <div class="flex-1 min-h-0 p-4 overflow-auto">
      <div class="flex flex-col md:flex-row gap-6">
        <main class="flex-1">
          <n-card class="rounded-2xl shadow-md">
            <slot />
            <div v-if="!$slots.default" class="text-center py-12 text-gray-400">
              <NuxtIcon name="shopping-bag" class="h-16 w-16 mx-auto mb-4" />
              <p class="text-xl">Your products will appear here</p>
            </div>
          </n-card>
        </main>
      </div>
    </div>

    <!-- Footer appears at bottom if content is short -->
    <footer class="w-full p-4 bg-white shadow-inner">
      <div class="text-center text-gray-400 text-sm">© 2025 SmartBuy</div>
    </footer>
  </div>
</template>
