export const useLogIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  let success = false;
  const authStore = useAuthStore();
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";
  const data = await $fetch(`${serverUrl}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
    onResponse({ response }) {
      if (response._data) {
        console.log(response._data);
        // Store the token in localStorage
        authStore.logIn(response._data.token, response._data.user._id);
        success = true;
      } else {
        console.error("Login failed:", response._data);
      }
    },
  });

  return success;
};
