<template>
  <div v-if="compact === 'mobile'" class="mobile-store-preview">
    <div class="mobile-status">9:41</div>
    <section class="mobile-store-hero">
      <div class="mobile-logo">Dapur<br />Nona</div>
      <div class="mobile-hero-art">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="mobile-hero-copy">
        <h2>Dapur Nona</h2>
        <p>Aneka kue dan camilan rumahan khas dengan bahan pilihan dan cita rasa istimewa.</p>
      </div>
    </section>

    <div class="mobile-search">Cari produk...</div>

    <div class="mobile-categories">
      <div v-for="category in mobileCategories" :key="category.label">
        <span>{{ category.icon }}</span>
        <strong>{{ category.label }}</strong>
      </div>
    </div>

    <div class="mobile-product-list">
      <article v-for="(product, index) in mobileProducts" :key="product.name">
        <div class="mobile-product-thumb" :class="`mobile-product-thumb--${index + 1}`"></div>
        <strong>{{ product.name }}</strong>
        <span>{{ product.price }}</span>
      </article>
    </div>
  </div>

  <div v-else class="store-preview store-preview--desktop">
    <header class="store-preview__top">
      <strong>Cekel Store</strong>
      <button>Pesan Sekarang</button>
    </header>

    <section class="store-preview__hero">
      <div class="preview-logo">Dapur<br />Nona</div>
      <div>
        <h2>Dapur Nona</h2>
        <p>Aneka kue dan camilan rumahan dengan checkout langsung via WhatsApp.</p>
        <div class="preview-badges">
          <span>Jakarta</span>
          <span>08.00 - 20.00</span>
          <span>Siap kirim</span>
        </div>
      </div>
      <button>Chat via WhatsApp</button>
    </section>

    <section class="store-preview__body">
      <div class="preview-search">Cari produk...</div>
      <div class="preview-filter">
        <span>Semua</span>
        <span>Kue Kering</span>
        <span>Camilan</span>
      </div>
      <div class="preview-products">
        <article v-for="(product, index) in products" :key="product.name">
          <div class="preview-photo" :class="`preview-photo--${index + 1}`"></div>
          <strong>{{ product.name }}</strong>
          <span>{{ product.price }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ compact?: 'desktop' | 'mobile' }>(), {
  compact: 'desktop',
});

const products = [
  { name: 'Nastar Premium', price: 'Rp 60.000' },
  { name: 'Brownies', price: 'Rp 45.000' },
  { name: 'Kastengel', price: 'Rp 55.000' },
  { name: 'Keripik Pisang', price: 'Rp 28.000' },
];

const mobileCategories = [
  { label: 'Semua', icon: '\u2318' },
  { label: 'Kue Kering', icon: '\u{1F36A}' },
  { label: 'Camilan', icon: '\u{1F968}' },
  { label: 'Minuman', icon: '\u{1F964}' },
  { label: 'Hampers', icon: '\u{1F381}' },
];

const mobileProducts = [
  { name: 'Nastar', price: 'Rp 60.000' },
  { name: 'Brownies', price: 'Rp 45.000' },
  { name: 'Kastengel', price: 'Rp 55.000' },
];
</script>
