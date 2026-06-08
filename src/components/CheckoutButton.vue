<script setup lang="ts">
import type { CartItem } from '../types/cart';
import { calculateCartSubtotal } from '../helpers/cart';
import { createCheckoutMessage, createWhatsAppUrl } from '../helpers/whatsapp';

const props = defineProps<{
  storeName: string;
  whatsappNumber: string;
  items: CartItem[];
  label?: string;
  note?: string;
}>();

function openCheckout(): void {
  const message = createCheckoutMessage({
    storeName: props.storeName,
    items: props.items,
    subtotal: calculateCartSubtotal(props.items),
    note: props.note,
  });

  window.open(createWhatsAppUrl(props.whatsappNumber, message), '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <button class="cekel-button" type="button" :disabled="items.length === 0" @click="openCheckout">
    {{ label ?? 'Checkout via WhatsApp' }}
  </button>
</template>
