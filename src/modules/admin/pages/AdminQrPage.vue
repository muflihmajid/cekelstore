<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>QR Toko & Bagikan Link</h1>
        <p>Gunakan QR dan link toko untuk bio Instagram, kemasan, meja kasir, dan WhatsApp story.</p>
      </div>
      <RouterLink :to="`/toko/${shop.slug}`" target="_blank">
        <AppButton variant="secondary">Lihat Toko</AppButton>
      </RouterLink>
    </div>

    <div class="grid grid-3">
      <div class="card card-pad grid">
        <h3 style="margin:0">QR Toko Anda</h3>
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR toko" class="qr-box" />
        <strong>{{ shop.name }}</strong>
        <small style="color:var(--color-muted)">{{ storeUrl }}</small>
        <div class="actions">
          <AppButton variant="secondary" @click="copyLink">Salin Link</AppButton>
          <AppButton @click="downloadQr">Unduh QR</AppButton>
        </div>
      </div>

      <div class="card card-pad grid">
        <h3 style="margin:0">Bagikan ke WhatsApp</h3>
        <p style="color:var(--color-muted); margin:0">Kirim katalog toko ke pelanggan lewat chat atau status WhatsApp.</p>
        <a :href="whatsappShareUrl" target="_blank">
          <AppButton block>Bagikan ke WhatsApp</AppButton>
        </a>
      </div>

      <div class="card card-pad grid">
        <h3 style="margin:0">Contoh Penggunaan</h3>
        <div class="share-example"><span>IG</span><div><strong>Bio Instagram</strong><small>Arahkan follower ke katalog toko.</small></div></div>
        <div class="share-example"><span>PK</span><div><strong>Kemasan Produk</strong><small>Tempel QR di label dan box.</small></div></div>
        <div class="share-example"><span>KS</span><div><strong>Meja Kasir</strong><small>Pelanggan scan dan pesan cepat.</small></div></div>
        <div class="share-example"><span>WA</span><div><strong>WhatsApp Story</strong><small>Promosikan katalog harian.</small></div></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue';
import AppButton from '@/shared/components/AppButton.vue';
import { useQrCode } from '@/shared/composables/useQrCode';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop } = context;
const { qrDataUrl, generate } = useQrCode();

const storeUrl = computed(() => {
  if (!shop.value) return '';
  return `${window.location.origin}/toko/${shop.value.slug}`;
});
const whatsappShareUrl = computed(() => `https://wa.me/?text=${encodeURIComponent(`Halo, ini katalog ${shop.value?.name || 'toko kami'}: ${storeUrl.value}`)}`);

async function copyLink() {
  await navigator.clipboard.writeText(storeUrl.value);
}

function downloadQr() {
  if (!qrDataUrl.value || !shop.value) return;
  const link = document.createElement('a');
  link.href = qrDataUrl.value;
  link.download = `qr-${shop.value.slug}.png`;
  link.click();
}

watch(storeUrl, (value) => {
  if (value) void generate(value);
});

onMounted(() => {
  if (storeUrl.value) void generate(storeUrl.value);
});
</script>
