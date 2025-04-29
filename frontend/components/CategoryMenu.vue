<template>
  <n-card class="rounded-2xl shadow-md">
    <template #header>
      <div class="text-lg font-bold px-2">Categories</div>
    </template>
    <n-menu
      :options="menuItems"
      :value="selectedCategory"
      class="bubbly-menu"
      @update:value="$emit('update:selectedCategory', $event)" />
  </n-card>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  selectedCategory: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:selectedCategory"]);

const menuItems = ref([]);

onMounted(async () => {
  try {
    const response = await $fetch("http://localhost:4000/category");
    menuItems.value = [
      {
        label: "All",
        key: "",
        onClick: () => emit("update:selectedCategory", ""),
      },
      ...response.map((item) => ({
        label: item.category,
        key: item.slugCategory,
        onClick: () => emit("update:selectedCategory", item.slugCategory),
      })),
    ];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
});
</script>

<style scoped>
:deep(.bubbly-menu .n-menu-item) {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.bubbly-menu .n-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.bubbly-menu .n-menu-item-content--selected) {
  border-radius: 8px;
}
</style>
