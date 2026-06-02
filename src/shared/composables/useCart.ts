import { computed, ref, watch } from 'vue';
import type { CartItem, Product } from '@/core/domain/entities';

export function useCart(slug: string) {
  const storageKey = `cekel-store-cart:${slug}`;
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem(storageKey) || '[]'));

  watch(items, (value) => localStorage.setItem(storageKey, JSON.stringify(value)), { deep: true });

  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));

  function add(product: Product) {
    const current = items.value.find((item) => item.product.id === product.id);
    if (current) current.quantity += 1;
    else items.value.push({ product, quantity: 1 });
  }

  function decrease(productId: string) {
    const current = items.value.find((item) => item.product.id === productId);
    if (!current) return;
    current.quantity -= 1;
    if (current.quantity <= 0) remove(productId);
  }

  function remove(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId);
  }

  function clear() {
    items.value = [];
  }

  return { items, subtotal, totalQuantity, add, decrease, remove, clear };
}
