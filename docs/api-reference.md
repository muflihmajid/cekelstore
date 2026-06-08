# API Reference

## Components

### `CekelStorefront`

Props:

- `store: StoreProfile`
- `products: Product[]`

### `ProductCard`

Props:

- `product: Product`
- `addLabel?: string`

Emits:

- `add(product: Product)`

### `ProductGrid`

Props:

- `products: Product[]`
- `addLabel?: string`
- `emptyText?: string`

Emits:

- `add(product: Product)`

### `CategoryFilter`

Props:

- `categories: string[]`
- `modelValue?: string`
- `allLabel?: string`

Emits:

- `update:modelValue(value?: string)`

### `SearchBar`

Props:

- `modelValue: string`
- `placeholder?: string`

Emits:

- `update:modelValue(value: string)`

### `CartDrawer`

Props:

- `open: boolean`
- `items: CartItem[]`
- `storeName: string`
- `whatsappNumber: string`

Emits:

- `close()`
- `updateQuantity(productId: string, quantity: number)`
- `remove(productId: string)`

### `CartSummary`

Props:

- `items: CartItem[]`
- `subtotalLabel?: string`
- `itemLabel?: string`

### `CheckoutButton`

Props:

- `storeName: string`
- `whatsappNumber: string`
- `items: CartItem[]`
- `label?: string`
- `note?: string`

## Helpers

- `normalizeIndonesianPhoneNumber(input: string): string`
- `createWhatsAppUrl(phoneNumber: string, message: string): string`
- `createCheckoutMessage(payload: CheckoutPayload): string`
- `formatRupiah(value: number): string`
- `addProductToCart(items: CartItem[], product: Product, quantity?: number): CartItem[]`
- `updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[]`
- `removeCartItem(items: CartItem[], productId: string): CartItem[]`
- `calculateCartSubtotal(items: CartItem[]): number`
- `countCartItems(items: CartItem[]): number`

## Types

```ts
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  description?: string;
  available?: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface StoreProfile {
  name: string;
  description?: string;
  whatsappNumber: string;
  logoUrl?: string;
  address?: string;
  openingHours?: string;
  themeId?: string;
}
```
