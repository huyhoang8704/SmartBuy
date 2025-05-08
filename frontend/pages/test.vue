<template>
  <div class="flex flex-wrap gap-6 justify-center p-8">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :color="product.color" />
  </div>
</template>

<script setup>
import ProductCard from "~/components/ProductCard.vue";

definePageMeta({
  layout: "blank",
});

const products = [
  {
    id: 1,
    name: "Product 1",
    brand: "Garnier",
    description: "Hydrating Micellar Water for sensitive skin.",
    price: 59.99,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "green",
  },
  {
    id: 2,
    name: "Product 2",
    brand: "Nivea",
    description: "Gentle Face Wash for all skin types.",
    price: 45.5,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "orange",
  },
  {
    id: 3,
    name: "Product 3",
    brand: "Neutrogena",
    description: "Oil-free acne face wash.",
    price: 72.0,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "yellow",
  },
  {
    id: 4,
    name: "Product 4",
    brand: "L’Oréal",
    description: "Micellar cleansing water for waterproof makeup.",
    price: 60,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "green",
  },
  {
    id: 5,
    name: "Product 5",
    brand: "Pond’s",
    description: "Facial Foam Brightening Cleanser.",
    price: 38.9,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "orange",
  },
  {
    id: 6,
    name: "Product 6",
    brand: "Simple",
    description: "Kind to Skin Refreshing Facial Wash.",
    price: 50.0,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "yellow",
  },
  {
    id: 7,
    name: "Product 7",
    brand: "Cetaphil",
    description: "Daily facial cleanser for dry skin.",
    price: 88.0,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "green",
  },
  {
    id: 8,
    name: "Product 8",
    brand: "Biore",
    description: "Charcoal face cleanser.",
    price: 39.5,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "orange",
  },
  {
    id: 9,
    name: "Product 9",
    brand: "Clean & Clear",
    description: "Morning burst facial cleanser.",
    price: 29.99,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "yellow",
  },
  {
    id: 10,
    name: "Product 10",
    brand: "The Body Shop",
    description: "Tea Tree Skin Clearing Facial Wash.",
    price: 69.0,
    thumbnail_url: "https://via.placeholder.com/150",
    color: "green",
  },
];
</script>
