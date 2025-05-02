import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth"; // Adjust if path differs

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>,
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    async addToCart(product, quantity = 1): Promise<boolean> {
      try {
        const existing = this.items.find((item) => item.id === product._id);
        let success = false;

        if (existing) {
          existing.quantity += quantity;
          success = await this.updateCartItem(existing.id, existing.quantity);
        } else {
          this.items.push({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.thumbnail_url,
          });
          success = await this.createCartItem(product, quantity);
        }

        await this.fetchCart();
        return success;
      } catch (error) {
        console.error("Error in addToCart:", error);
        return false;
      }
    },
    async removeFromCart(productId: string): Promise<boolean> {
      this.items = this.items.filter((item) => item.id !== productId);
      const success = await this.deleteCartItem(productId);
      await this.fetchCart();
      return success;
    },

    async clearCart() {
      this.items = [];
      // Optionally: await this.clearCartAPI(); and then await this.fetchCart();
    },

    async fetchCart() {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");

      if (!userId || !token) {
        useAuthStore().logOut();
        return;
      }

      try {
        const response = await $fetch("http://localhost:4000/cart/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && Array.isArray(response.items)) {
          this.items = response.items.map((item) => ({
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            image: item.productId.thumbnail_url,
          }));
        } else {
          this.items = [];
        }
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          useAuthStore().logOut();
        }
        this.items = [];
      }
    },

    async createCartItem(product, quantity): Promise<boolean> {
      const userId = localStorage.getItem("userId");
      if (!userId) return false;

      try {
        await $fetch("http://localhost:4000/cart/add-product", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            userId,
            productId: product._id,
            quantity,
          }),
        });
        return true;
      } catch (error) {
        console.error("createCartItem error", error);
        return false;
      }
    },

    async updateCartItem(
      productId: string,
      quantity: number
    ): Promise<boolean> {
      const userId = localStorage.getItem("userId");
      if (!userId) return false;

      try {
        const response = await $fetch(`http://localhost:4000/cart/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        return true;
      } catch (error) {
        console.error("Update failed:", error);
        return false;
      }
    },
    async deleteCartItem(productId: string): Promise<boolean> {
      const userId = localStorage.getItem("userId");
      if (!userId) return false;

      try {
        await $fetch(`http://localhost:4000/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            userId,
          }),
        });
        return true;
      } catch (error) {
        console.error("deleteCartItem error", error);
        return false;
      }
    },
  },
});
