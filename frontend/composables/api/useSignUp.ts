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
  let success = false;
  try {
    const serverUrl = process.env.SERVER_URL || "http://localhost:4000";

    const data = await $fetch(`${serverUrl}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json", // Ensure proper content type
      },
      onResponse({ response }) {
        // Check the response status code and handle accordingly
        if (response._data.status === 201) {
          success = true;
          // After successful sign-up, attempt to log in
        } else {
          console.error("Sign-up failed:", response._data);
        }
      },
    });
  } catch (err) {
    console.error("Error during sign-up:", err);
  }
  success = await useLogIn({ email, password });

  return success;
};
