<template>
  <main class="landing-page">
    <section class="landing-hero">
      <div class="landing-shell">
        <nav class="landing-nav">
          <RouterLink to="/" class="landing-brand">Cekel Store</RouterLink>
          <div class="landing-links">
            <a href="#fitur">Fitur</a>
            <a href="#harga">Harga</a>
            <a href="#contoh">Contoh Toko</a>
            <a href="#panduan">Panduan</a>
          </div>
          <div class="landing-actions">
            <RouterLink to="/login">Masuk</RouterLink>
            <RouterLink to="/admin" class="landing-cta">Daftar Gratis</RouterLink>
          </div>
        </nav>

        <div class="landing-content">
          <div class="landing-copy">
            <h1>Toko online ringan yang langsung masuk WhatsApp</h1>
            <p>Cekel Store membantu UMKM menjual lebih mudah dengan toko online simpel dan checkout via WhatsApp.</p>
            <div class="landing-buttons">
              <RouterLink to="/admin" class="landing-cta landing-cta--large">Buat Toko Gratis</RouterLink>
              <a href="#contoh" class="landing-secondary">Lihat Contoh Toko</a>
            </div>
          </div>

          <div id="contoh" class="device-stage" aria-label="Preview toko Cekel Store">
            <div class="screen-device">
              <StorePreview compact="desktop" />
            </div>

            <div class="phone-device">
              <div class="phone-notch"></div>
              <StorePreview compact="mobile" />
            </div>
          </div>
        </div>

        <div id="fitur" class="benefit-row">
          <div v-for="benefit in benefits" :key="benefit.title" class="benefit-item">
            <span class="benefit-icon">{{ benefit.icon }}</span>
            <div>
              <strong>{{ benefit.title }}</strong>
              <small>{{ benefit.text }}</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="trust-bar">
      <p>Dipercaya oleh ribuan UMKM di Indonesia</p>
      <div class="trust-list">
        <span v-for="brand in trustedBrands" :key="brand">{{ brand }}</span>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import StorePreview from './StorePreview.vue';

const benefits = [
  { title: 'Tanpa biaya bulanan', text: 'Bayar jika perlu fitur premium', icon: 'B' },
  { title: 'Setup cepat', text: 'Toko jadi dalam 3 menit', icon: 'S' },
  { title: 'Langsung ke WhatsApp', text: 'Pesanan tidak terlewat', icon: 'W' },
];

const trustedBrands = ['Dapur Nona', 'Kopi Senja', 'Batik Lestari', 'Roti Bakoel', 'Craftify ID'];
</script>
