// stores/cart.ts
import { defineStore } from "pinia";

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
    // Action to add an item to the cart
    async addToCart(product) {
      const existing = this.items.find((item) => item.id === product._id);

      // If the item already exists, we increase the quantity
      if (existing) {
        existing.quantity++;
        await this.updateCartItem(existing.id, existing.quantity); // Update the cart on the server
      } else {
        // If the item doesn't exist, we add it to the cart
        this.items.push({
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.thumbnail_url,
        });
        await this.createCartItem(product, 1); // Add the item to the cart on the server
      }
      // After updating the cart, fetch the latest cart data
      await this.fetchCart();
    },

    // Action to remove an item from the cart
    async removeFromCart(productId: string) {
      // Remove the item from the local store
      this.items = this.items.filter((item) => item.id !== productId);

      // Call API to remove the item from the cart on the server
      await this.deleteCartItem(productId);

      // Fetch the latest cart data
      await this.fetchCart();
    },

    // Action to clear the entire cart
    async clearCart() {
      this.items = [];

      // Call the API to clear the cart on the server
      // await this.clearCartAPI();

      // Fetch the latest cart data
      // await this.fetchCart();
    },

    // Fetch the cart data from the server and update the store
    async fetchCart() {
      const userId = localStorage.getItem("userId");

      if (userId) {
        const response = await $fetch(`http://localhost:4000/cart/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          onResponse({ response }) {
            console.log(response._data);
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
      }
    },

    // Helper method to create a new cart item on the server
    async createCartItem(product, quantity) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await $fetch(`http://localhost:4000/cart/add-product`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            userId: userId,
            productId: product._id,
            quantity: quantity,
          }),
        });
      }
    },

    // Helper method to update a cart item on the server
    async updateCartItem(productId: string, quantity: number) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await $fetch(`http://localhost:4000/cart/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        });
      }
    },

    // Helper method to delete a cart item on the server
    async deleteCartItem(productId: string) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await $fetch(`http://localhost:4000/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            userId,
          }),
        });
      }
    },

    // Helper method to clear the entire cart on the server
    // async clearCartAPI() {
    //   const userId = localStorage.getItem("userId");
    //   if (userId) {
    //     await $fetch(`http://localhost:4000/cart/${userId}/clear`, {
    //       method: "DELETE",
    //     });
    //   }
    // },
  },
});
