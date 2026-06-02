<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Selamat pagi, {{ shop.name }}</h1>
        <p>Kelola toko Anda dengan mudah hari ini.</p>
      </div>
      <div class="actions">
        <span class="badge badge--muted">7 hari terakhir</span>
        <RouterLink :to="`/toko/${shop.slug}`" target="_blank"><AppButton>Lihat Toko</AppButton></RouterLink>
      </div>
    </div>

    <div class="grid grid-4">
      <div v-for="metric in metrics" :key="metric.label" class="card card-pad stat-card">
        <span class="badge">{{ metric.label }}</span>
        <h2>{{ metric.value }}</h2>
        <p>{{ metric.helper }}</p>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <div class="card card-pad chart-card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px">
          <h3 style="margin:0">Kesiapan Toko</h3>
          <span class="badge badge--muted">{{ readinessScore }}%</span>
        </div>
        <div style="margin-top:18px">
          <div class="progress-row">
            <strong>Skor kesiapan</strong>
            <span>{{ readinessScore }}%</span>
            <div class="progress-bar"><span :style="{ width: `${readinessScore}%` }"></span></div>
          </div>
          <div v-for="item in readinessItems" :key="item.label" class="activity-item" style="grid-template-columns:34px 1fr auto; margin-top:10px">
            <span class="activity-dot">{{ item.done ? '✓' : '!' }}</span>
            <div>
              <strong>{{ item.label }}</strong>
              <div style="color:var(--color-muted); font-size:13px">{{ item.helper }}</div>
            </div>
            <span class="badge" :class="item.done ? 'badge--success' : 'badge--muted'">{{ item.done ? 'Siap' : 'Perlu' }}</span>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px">
          <h3 style="margin:0">Aktivitas Terbaru</h3>
          <span class="badge badge--muted">Live</span>
        </div>
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.title" class="activity-item">
            <span class="activity-dot">{{ activity.icon }}</span>
            <div>
              <strong>{{ activity.title }}</strong>
              <div style="color:var(--color-muted); font-size:13px">{{ activity.text }}</div>
            </div>
            <small>{{ activity.time }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-3" style="margin-top:18px">
      <div class="card card-pad">
        <h3 style="margin-top:0">QR Toko & Link</h3>
        <p style="color:var(--color-muted)">Tempel QR di kemasan, meja kasir, bio, atau story.</p>
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code toko" class="qr-box" />
        <div class="field" style="margin-top:12px">
          <span class="field__label">Link Toko</span>
          <input class="input" :value="shopUrl" readonly />
        </div>
        <div class="actions" style="margin-top:12px">
          <AppButton variant="secondary" @click="copyLink">Salin Link</AppButton>
          <a v-if="qrDataUrl" :href="qrDataUrl" download="qr-code-toko.png"><AppButton variant="ghost">Unduh QR</AppButton></a>
        </div>
      </div>

      <div class="card card-pad">
        <h3 style="margin-top:0">Produk Aktif</h3>
        <div v-for="product in products.slice(0, 5)" :key="product.id" class="activity-item" style="grid-template-columns:46px 1fr auto">
          <img :src="product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="product.name" class="product-thumb" />
          <div>
            <strong>{{ product.name }}</strong>
            <div style="color:var(--color-muted); font-size:13px">{{ formatCurrency(product.price) }}</div>
          </div>
          <span class="badge" :class="product.isAvailable ? 'badge--success' : 'badge--muted'">{{ product.isAvailable ? 'Ada' : 'Habis' }}</span>
        </div>
        <EmptyState v-if="products.length === 0" title="Belum ada produk" description="Tambahkan produk pertama." icon="0" />
      </div>

      <div class="card card-pad">
        <h3 style="margin-top:0">Mobile Admin Quick View</h3>
        <div class="mobile-preview">
          <div class="mobile-preview__top">
            <strong>Dashboard</strong>
            <div style="font-size:26px; font-weight:950; margin-top:14px">{{ products.length }}</div>
            <small>Produk aktif</small>
          </div>
          <div class="mobile-preview__body">
            <div v-for="product in products.slice(0, 3)" :key="product.id" style="display:flex; align-items:center; gap:10px">
              <img :src="product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="product.name" class="product-thumb" />
              <div>
                <strong style="font-size:13px">{{ product.name }}</strong>
                <div style="color:var(--color-muted); font-size:12px">{{ formatCurrency(product.price) }}</div>
              </div>
            </div>
            <RouterLink to="/admin/produk"><AppButton block>Kelola Produk</AppButton></RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import type { Category, Product, StoreStats } from '@/core/domain/entities';
import { env } from '@/core/config/env';
import { repositories } from '@/infrastructure/supabase/repositories';
import AppButton from '@/shared/components/AppButton.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import { useQrCode } from '@/shared/composables/useQrCode';
import { formatCurrency } from '@/core/utils/formatters';
import { getStoreStats } from '@/application/usecases/stats/GetStoreStats';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop } = context;
const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const stats = ref<StoreStats | null>(null);
const { qrDataUrl, generate } = useQrCode();
const shopUrl = computed(() => shop.value ? `${env.publicSiteUrl}/toko/${shop.value.slug}` : '');

const activeProducts = computed(() => products.value.filter((product) => product.isAvailable).length);
const metrics = computed(() => [
  { label: 'Kunjungan Toko', value: String(stats.value?.visits ?? 0), helper: '30 hari terakhir' },
  { label: 'Klik WhatsApp', value: String(stats.value?.checkoutClicks ?? 0), helper: 'Checkout tercatat' },
  { label: 'Produk Aktif', value: String(activeProducts.value), helper: `${products.value.length} total produk` },
  { label: 'Kategori', value: String(categories.value.length), helper: 'Kategori katalog' },
]);

const readinessItems = computed(() => [
  { label: 'Profil toko lengkap', helper: 'Nama, deskripsi, WhatsApp, dan jam buka', done: Boolean(shop.value?.name && shop.value?.description && shop.value?.whatsappNumber && shop.value?.openingHours) },
  { label: 'Produk tersedia', helper: 'Minimal satu produk aktif untuk dibeli', done: activeProducts.value > 0 },
  { label: 'Kategori tersusun', helper: 'Katalog lebih mudah dipindai pembeli', done: categories.value.length > 0 },
  { label: 'Link toko siap dibagikan', helper: 'QR dan URL toko sudah tersedia', done: Boolean(shopUrl.value) },
]);

const readinessScore = computed(() => {
  const doneCount = readinessItems.value.filter((item) => item.done).length;
  return Math.round((doneCount / readinessItems.value.length) * 100);
});

const activities = computed(() => [
  { icon: 'P', title: 'Lengkapi produk unggulan', text: products.value.length ? `${products.value.length} produk siap ditampilkan` : 'Tambahkan produk pertama untuk mulai menerima pesanan', time: 'Produk' },
  { icon: 'K', title: 'Rapikan kategori', text: categories.value.length ? `${categories.value.length} kategori aktif` : 'Kategori membantu pembeli menemukan produk lebih cepat', time: 'Katalog' },
  { icon: 'W', title: 'Uji checkout WhatsApp', text: 'Pastikan nomor WhatsApp toko aktif dan pesan checkout terbaca rapi', time: 'WA' },
  { icon: 'Q', title: 'Bagikan QR toko', text: 'Gunakan QR untuk kemasan, meja kasir, bio, dan story', time: 'QR' },
]);

async function load() {
  if (!shop.value) return;
  [categories.value, products.value, stats.value] = await Promise.all([
    repositories.categories.listByShop(shop.value.id),
    repositories.products.listByShop(shop.value.id),
    getStoreStats(shop.value.id),
  ]);
  await generate(shopUrl.value);
}

function copyLink() {
  navigator.clipboard.writeText(shopUrl.value);
}

watch(shop, load, { immediate: true });
onMounted(load);
</script>
