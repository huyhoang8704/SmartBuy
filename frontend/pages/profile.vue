<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Chỉnh sửa hồ sơ</h2>

      <n-form @submit.prevent="submitChanges">
        <n-form-item label="Họ và tên">
          <n-input
            v-model:value="user.name"
            placeholder="Nhập họ và tên"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Email">
          <n-input
            v-model:value="user.email"
            disabled
            type="email"
            placeholder="Nhập email"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Số điện thoại">
          <n-input
            v-model:value="user.phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Địa chỉ">
          <n-input
            v-model:value="user.address"
            placeholder="Nhập địa chỉ"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Nghề nghiệp">
          <n-input
            v-model:value="user.occupation"
            placeholder="Nhập nghề nghiệp"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Tuổi">
          <n-input
            v-model:value="user.age"
            type="number"
            placeholder="Nhập tuổi"
            :clearable="true" />
        </n-form-item>

        <n-form-item label="Giới tính">
          <n-select
            v-model:value="user.gender"
            :options="genderOptions"
            placeholder="Chọn giới tính" />
        </n-form-item>

        <div class="mt-6 flex justify-end">
          <n-button
            :disabled="!isFormChanged"
            type="primary"
            :loading="loading"
            @click="submitChanges">
            Lưu thay đổi
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from "naive-ui";
import { ref, watch } from "vue";

const notification = useNotification();
const user = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  age: 0,
  gender: "other",
});

const originalUser = ref({});
const isFormChanged = ref(false);
const loading = ref(false);

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const userId = localStorage.getItem("userId");
const authToken = localStorage.getItem("authToken");
const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

const fetchUserData = async () => {
  const data = await $fetch(`${serverUrl}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    onResponse({ response }) {
      console.log(response);
    },
  });

  user.value = { ...data };
  originalUser.value = { ...data };
};
await fetchUserData(); // Called immediately after definition

watch(
  user,
  () => {
    isFormChanged.value =
      JSON.stringify(user.value) !== JSON.stringify(originalUser.value);
  },
  { deep: true }
);

const submitChanges = () => {
  loading.value = true;
  const data = $fetch(`${serverUrl}/user/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(user.value),
    onResponse({ response }) {
      console.log(response);
      if (response.status == 200) {
        notification.success({
          content: "Cập nhật thông tin thành công",
          duration: 3000,
        });
        fetchUserData();
        loading.value = false;
      } else {
        notification.error({
          content: "Cập nhật thông tin thất bại. Vui lòng thử lại",
          duration: 3000,
        });
        fetchUserData();
      }
    },
  });
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
