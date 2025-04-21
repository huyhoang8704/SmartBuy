// stores/cart.ts
import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as Array<{
      id: string; // Change this to string
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
    addToCart(product) {
      const existing = this.items.find((item) => item.id === product._id); // Make sure you use _id from product
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({
          id: product._id, // Ensure the product's _id is used
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.thumbnail_url,
        });
      }
    },

    removeFromCart(productId: string) {
      // Ensure the id is string
      this.items = this.items.filter((item) => item.id !== productId);
    },

    clearCart() {
      this.items = [];
    },
  },
});
