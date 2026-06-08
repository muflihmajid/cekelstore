<script setup lang="ts">
import CartSummary from './CartSummary.vue';
import CheckoutButton from './CheckoutButton.vue';
import type { CartItem } from '../types/cart';
import { formatRupiah } from '../helpers/currency';

defineProps<{
  open: boolean;
  items: CartItem[];
  storeName: string;
  whatsappNumber: string;
}>();

const emit = defineEmits<{
  close: [];
  updateQuantity: [productId: string, quantity: number];
  remove: [productId: string];
}>();
</script>

<template>
  <aside v-if="open" class="cekel-cart-drawer" aria-label="Shopping cart">
    <div class="cekel-cart-drawer__header">
      <h2>Cart</h2>
      <button class="cekel-cart-drawer__close" type="button" aria-label="Close cart" @click="emit('close')">
        x
      </button>
    </div>

    <div class="cekel-cart-drawer__items">
      <p v-if="items.length === 0" class="cekel-storefront__meta">Your cart is empty.</p>

      <div v-for="item in items" :key="item.productId" class="cekel-cart-drawer__item">
        <div>
          <p class="cekel-cart-drawer__item-title">{{ item.name }}</p>
          <span class="cekel-storefront__meta">{{ formatRupiah(item.price) }}</span>
        </div>
        <div class="cekel-cart-drawer__quantity">
          <button type="button" aria-label="Decrease quantity" @click="emit('updateQuantity', item.productId, item.quantity - 1)">
            -
          </button>
          <strong>{{ item.quantity }}</strong>
          <button type="button" aria-label="Increase quantity" @click="emit('updateQuantity', item.productId, item.quantity + 1)">
            +
          </button>
          <button type="button" aria-label="Remove item" @click="emit('remove', item.productId)">
            Remove
          </button>
        </div>
      </div>
    </div>

    <CartSummary :items="items" />
    <CheckoutButton :store-name="storeName" :whatsapp-number="whatsappNumber" :items="items" />
  </aside>
</template>
