export const useLogIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  let status = {
    success: false,
    message: "",
  };
  const authStore = useAuthStore();
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

  try {
    const response = await $fetch(`${serverUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    authStore.logIn(response.token, response.user._id);
    status.success = true;
    status.message = "Login successful.";
  } catch (error) {
    status.success = false;

    // Try to extract a meaningful error message
    if (error.response && error.response._data) {
      status.message = error.response._data.message || "Login failed.";
    } else {
      status.message = error.message || "Network error. Please try again.";
    }
  }

  return status;
};
