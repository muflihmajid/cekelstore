<template>
  <div class="store-preview" :class="`store-preview--${compact}`">
    <header class="store-preview__top">
      <strong>Cekel Store</strong>
      <nav>
        <span>Fitur</span>
        <span>Harga</span>
        <span>Contoh Toko</span>
        <span>Panduan</span>
      </nav>
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
</script>
