import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

export function addProductToCart(items: CartItem[], product: Product, quantity = 1): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);

  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    },
  ];
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeCartItem(items, productId);
  }

  return items.map((item) => (item.productId === productId ? { ...item, quantity } : item));
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function countCartItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
