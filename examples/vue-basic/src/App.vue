<script setup lang="ts">
import { CekelStorefront, type Product, type StoreProfile } from '../../../src';

const store: StoreProfile = {
  name: 'Warung Segar',
  description: 'Minuman dingin dan camilan rumahan, checkout langsung ke WhatsApp.',
  whatsappNumber: '081234567890',
  address: 'Bandung',
  openingHours: '09.00 - 20.00',
  themeId: 'fresh',
};

const products: Product[] = [
  {
    id: 'es-teh',
    name: 'Es Teh Manis',
    price: 10000,
    category: 'Minuman',
    description: 'Teh segar dengan gula asli.',
    available: true,
  },
  {
    id: 'kopi-susu',
    name: 'Kopi Susu',
    price: 18000,
    category: 'Minuman',
    description: 'Kopi susu ringan untuk teman kerja.',
    available: true,
  },
  {
    id: 'roti-bakar',
    name: 'Roti Bakar Cokelat',
    price: 15000,
    category: 'Snack',
    description: 'Roti bakar isi cokelat.',
    available: true,
  },
  {
    id: 'pisang-goreng',
    name: 'Pisang Goreng',
    price: 12000,
    category: 'Snack',
    description: 'Pisang goreng hangat per porsi.',
    available: false,
  },
];
</script>

<template>
  <main class="example-shell">
    <CekelStorefront :store="store" :products="products" />
  </main>
</template>

<style>
body {
  background: #eef3f2;
  margin: 0;
}

.example-shell {
  margin: 0 auto;
  max-width: 1120px;
  min-height: 100vh;
  padding: 24px;
}
</style>
