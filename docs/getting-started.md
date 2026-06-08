# Getting Started

Cekel Storefront exposes Vue components, TypeScript types, and helpers for building a small storefront that checks out through WhatsApp.

## Install

```bash
npm install cekel-storefront
```

## Import Styles

```ts
import 'cekel-storefront/style.css';
```

The stylesheet defines base component styles and CSS variables. You can override variables globally or pass a theme preset through the storefront component.

## Render a Storefront

```vue
<script setup lang="ts">
import { CekelStorefront, type Product, type StoreProfile } from 'cekel-storefront';

const store: StoreProfile = {
  name: 'Warung Segar',
  whatsappNumber: '081234567890',
  themeId: 'fresh',
};

const products: Product[] = [
  { id: '1', name: 'Es Teh', price: 10000, category: 'Minuman' },
];
</script>

<template>
  <CekelStorefront :store="store" :products="products" />
</template>
```

## Data Source

This package does not prescribe a backend. Pass products and store data from your own CMS, static files, server, or database.
