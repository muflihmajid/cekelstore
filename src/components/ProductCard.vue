<script setup lang="ts">
import type { Product } from '../types/product';
import { formatRupiah } from '../helpers/currency';

defineProps<{
  product: Product;
  addLabel?: string;
}>();

const emit = defineEmits<{
  add: [product: Product];
}>();
</script>

<template>
  <article class="cekel-product-card">
    <img
      v-if="product.imageUrl"
      class="cekel-product-card__image"
      :src="product.imageUrl"
      :alt="product.name"
      loading="lazy"
    />
    <div v-else class="cekel-product-card__image" aria-hidden="true" />

    <div class="cekel-product-card__body">
      <div>
        <h3 class="cekel-product-card__name">{{ product.name }}</h3>
        <p v-if="product.description" class="cekel-product-card__description">
          {{ product.description }}
        </p>
      </div>

      <div class="cekel-product-card__footer">
        <span class="cekel-product-card__price">{{ formatRupiah(product.price) }}</span>
        <button
          class="cekel-button"
          type="button"
          :disabled="product.available === false"
          @click="emit('add', product)"
        >
          {{ product.available === false ? 'Sold out' : addLabel ?? 'Add' }}
        </button>
      </div>
    </div>
  </article>
</template>
