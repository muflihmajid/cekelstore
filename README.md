# Cekel Storefront

Cekel Storefront is an open-source storefront toolkit for WhatsApp-based small businesses. It helps developers build a simple product catalog, cart, and WhatsApp checkout flow with Vue 3, TypeScript, and lightweight CSS variables.

This repository is not the full Cekel Store SaaS product. The managed dashboard, order management, invoice PDF, analytics, hosting, billing, authentication, and premium features belong to Cekel Store Cloud and are intentionally not included here.

## Features

- Storefront UI components for Vue 3
- Product cards, grids, search, and category filtering
- Client-side cart components and helpers
- WhatsApp checkout URL and message helpers
- Indonesian phone number normalization
- Rupiah currency formatter
- CSS variable theme presets
- Basic Vue example app

## Install

```bash
npm install cekel-storefront
```

## Basic Usage

```vue
<script setup lang="ts">
import { CekelStorefront, type Product, type StoreProfile } from 'cekel-storefront';
import 'cekel-storefront/style.css';

const store: StoreProfile = {
  name: 'Warung Segar',
  description: 'Minuman dan camilan siap pesan lewat WhatsApp.',
  whatsappNumber: '081234567890',
  themeId: 'fresh',
};

const products: Product[] = [
  { id: 'esteh', name: 'Es Teh', price: 10000, category: 'Minuman', available: true },
  { id: 'roti', name: 'Roti Bakar', price: 15000, category: 'Snack', available: true },
];
</script>

<template>
  <CekelStorefront :store="store" :products="products" />
</template>
```

## Public Scope

Included:

- Reusable storefront components
- Product catalog components
- Cart utilities
- WhatsApp checkout helpers
- Theme presets and CSS variables
- Documentation and examples

Not included:

- Admin dashboard
- Order management
- Customer database
- Supabase config or migrations
- Secrets or `.env` values
- Invoice PDF generator
- Analytics dashboard
- Repeat customer logic
- Billing or subscription logic
- Authentication flow

## Documentation

- [Getting started](docs/getting-started.md)
- [Theming](docs/theming.md)
- [WhatsApp checkout](docs/whatsapp-checkout.md)
- [API reference](docs/api-reference.md)

## Development

```bash
npm install
npm run build
```

Run the example:

```bash
cd examples/vue-basic
npm install
npm run dev
```

## License

MIT
