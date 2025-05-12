<template>
  <n-card
    class="rounded-2xl shadow-md h-[calc(100vh-20vh)] overflow-auto"
    :theme-overrides="{
      Card: {
        color: '#F0FAF5',
        borderColor: '#00B14F',
        titleTextColor: '#00B14F',
      },
    }">
    <template #header class="">
      <div class="category-card text-base font-bold px-2 text-[#00B14F]">
        Danh mục sản phẩm
      </div>
    </template>
    <n-menu
      color="#00B14F"
      :options="menuItems"
      :value="selectedCategory"
      class="bubbly-menu be-vietnam-pro"
      :theme-overrides="{
        common: {
          primaryColor: '#00B14F',
        },
      }"
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
:deep(.n-card) {
  background-color: #00b14f; /* Apply the desired background color */
  border-radius: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06); /* Soft shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.bubbly-menu .n-menu-item--active) {
  background-color: #00b14f; /* Highlight active item with green */
  color: white; /* Ensure text is readable */
  border-radius: 0.75rem; /* Match the menu item style */
}

:deep(.bubbly-menu .n-menu-item--active:hover) {
  background-color: #008f3e; /* Slightly darker green on hover */
}
</style>
