<script setup lang="ts">
import { computed, ref } from 'vue';
import CartDrawer from './CartDrawer.vue';
import CategoryFilter from './CategoryFilter.vue';
import ProductGrid from './ProductGrid.vue';
import SearchBar from './SearchBar.vue';
import {
  addProductToCart,
  countCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from '../helpers/cart';
import { themePresetToStyle } from '../themes/presets';
import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';
import type { StoreProfile } from '../types/store';

const props = defineProps<{
  store: StoreProfile;
  products: Product[];
}>();

const search = ref('');
const selectedCategory = ref<string>();
const cartOpen = ref(false);
const cartItems = ref<CartItem[]>([]);

const categories = computed(() => {
  return Array.from(new Set(props.products.map((product) => product.category).filter(Boolean) as string[]));
});

const visibleProducts = computed(() => {
  const query = search.value.trim().toLowerCase();

  return props.products.filter((product) => {
    const matchesCategory = selectedCategory.value ? product.category === selectedCategory.value : true;
    const matchesSearch = query
      ? [product.name, product.description, product.category].filter(Boolean).join(' ').toLowerCase().includes(query)
      : true;

    return matchesCategory && matchesSearch;
  });
});

const themeStyle = computed(() => themePresetToStyle(props.store.themeId));

function addProduct(product: Product): void {
  cartItems.value = addProductToCart(cartItems.value, product);
}

function setQuantity(productId: string, quantity: number): void {
  cartItems.value = updateCartItemQuantity(cartItems.value, productId, quantity);
}

function removeItem(productId: string): void {
  cartItems.value = removeCartItem(cartItems.value, productId);
}
</script>

<template>
  <section class="cekel-storefront" :style="themeStyle">
    <header class="cekel-storefront__header">
      <div class="cekel-storefront__identity">
        <img v-if="store.logoUrl" class="cekel-storefront__logo" :src="store.logoUrl" :alt="store.name" />
        <div>
          <h1 class="cekel-storefront__title">{{ store.name }}</h1>
          <p v-if="store.description" class="cekel-storefront__description">{{ store.description }}</p>
          <p v-if="store.address || store.openingHours" class="cekel-storefront__meta">
            <span v-if="store.address">{{ store.address }}</span>
            <span v-if="store.address && store.openingHours"> · </span>
            <span v-if="store.openingHours">{{ store.openingHours }}</span>
          </p>
        </div>
      </div>

      <button class="cekel-button" type="button" @click="cartOpen = true">
        Cart ({{ countCartItems(cartItems) }})
      </button>
    </header>

    <div class="cekel-storefront__toolbar">
      <SearchBar v-model="search" />
      <CategoryFilter v-model="selectedCategory" :categories="categories" />
    </div>

    <ProductGrid :products="visibleProducts" @add="addProduct" />

    <CartDrawer
      :open="cartOpen"
      :items="cartItems"
      :store-name="store.name"
      :whatsapp-number="store.whatsappNumber"
      @close="cartOpen = false"
      @update-quantity="setQuantity"
      @remove="removeItem"
    />
  </section>
</template>
