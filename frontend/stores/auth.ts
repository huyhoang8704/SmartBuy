import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"),
  }),

  actions: {
    logIn(token: string, userId: string) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);
      this.isAuthenticated = true;
    },

    logOut() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      this.isAuthenticated = false;
    },
  },
});
