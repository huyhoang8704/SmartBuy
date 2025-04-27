<template>
  <n-dropdown
    :options="menuOptions"
    placement="bottom-end"
    trigger="click"
    @select="handleSelect">
    <n-button quaternary circle class="md:hidden" style="success">
      <Icon name="ooui:user-avatar" size="large"> </Icon>
    </n-button>
  </n-dropdown>
</template>

<script setup>
const emit = defineEmits(["navigate"]);

const menuOptions = [
  {
    label: "Purchase History",
    key: "history",
  },
];

function handleSelect(key) {
  emit("navigate", key);
}
</script>
