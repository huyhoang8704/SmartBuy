import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: !!localStorage.getItem("authToken"),
  }),

  actions: {
    logIn(token: string, userId: string) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);
      const cart = useCartStore();
      cart.fetchCart();
      this.isAuthenticated = true;
    },

    logOut() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      const cart = useCartStore();
      cart.clearCart();
      this.isAuthenticated = false;
    },
  },
});
