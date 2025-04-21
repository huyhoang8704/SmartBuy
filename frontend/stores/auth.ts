import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"), // Initialize from localStorage
  }),

  actions: {
    logIn(token: string) {
      localStorage.setItem("authToken", token); // Save token to localStorage
      this.isAuthenticated = true;
    },

    logOut() {
      localStorage.removeItem("authToken"); // Remove token from localStorage
      this.isAuthenticated = false;
    },
  },
});
