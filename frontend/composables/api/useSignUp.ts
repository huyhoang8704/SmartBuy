// composables/useSignUp.ts
import { useLogIn } from "./useLogIn";

export const useSignUp = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

  let status = {
    success: false,
    message: "",
  };

  try {
    const response = await $fetch(`${serverUrl}/auth/register`, {
      method: "POST",
      body: { name, email, password },
    });

    // Attempt to log in after successful signup
    const loginStatus = await useLogIn({ email, password });
    status.success = loginStatus.success;
    status.message = loginStatus.success
      ? "Signup successful, you are now logged in."
      : loginStatus.message;
  } catch (error: any) {
    status.success = false;

    // Try to extract a meaningful error message
    if (error.response && error.response._data) {
      status.message = error.response._data.message || "Signup failed.";
    } else {
      status.message = error.message || "Network error. Please try again.";
    }
  }

  return status;
};
