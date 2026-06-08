<script setup lang="ts">
import ProductCard from './ProductCard.vue';
import type { Product } from '../types/product';

defineProps<{
  products: Product[];
  addLabel?: string;
  emptyText?: string;
}>();

const emit = defineEmits<{
  add: [product: Product];
}>();
</script>

<template>
  <div v-if="products.length" class="cekel-product-grid">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :add-label="addLabel"
      @add="emit('add', $event)"
    />
  </div>
  <p v-else class="cekel-storefront__meta">{{ emptyText ?? 'No products found.' }}</p>
</template>
