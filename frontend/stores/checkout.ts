import { defineStore } from "pinia";

// Define the selected item type
interface SelectedCartItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    selectedItems: [] as SelectedCartItem[],
    step: 1, // 1: Cart, 2: Checkout confirmation, 3: Order complete
  }),

  getters: {
    hasSelectedItems: (state) => state.selectedItems.length > 0,
    totalSelectedItems: (state) =>
      state.selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.selectedItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      ),
  },

  actions: {
    setSelectedItems(items: SelectedCartItem[]) {
      this.selectedItems = items;
    },

    clearSelectedItems() {
      this.selectedItems = [];
    },

    nextStep() {
      if (this.step < 3) {
        this.step++;
      }
    },

    previousStep() {
      if (this.step > 1) {
        this.step--;
      }
    },

    resetCheckout() {
      this.selectedItems = [];
      this.step = 1;
    },
  },
});
