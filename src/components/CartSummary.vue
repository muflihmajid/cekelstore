<script setup lang="ts">
import type { CartItem } from '../types/cart';
import { calculateCartSubtotal, countCartItems } from '../helpers/cart';
import { formatRupiah } from '../helpers/currency';

const props = defineProps<{
  items: CartItem[];
  subtotalLabel?: string;
  itemLabel?: string;
}>();
</script>

<template>
  <section class="cekel-cart-summary" aria-label="Cart summary">
    <div class="cekel-cart-summary__row">
      <span class="cekel-cart-summary__line">{{ itemLabel ?? 'Items' }}</span>
      <strong>{{ countCartItems(props.items) }}</strong>
    </div>
    <div class="cekel-cart-summary__row">
      <span class="cekel-cart-summary__line">{{ subtotalLabel ?? 'Subtotal' }}</span>
      <strong class="cekel-cart-summary__total">{{ formatRupiah(calculateCartSubtotal(props.items)) }}</strong>
    </div>
  </section>
</template>
