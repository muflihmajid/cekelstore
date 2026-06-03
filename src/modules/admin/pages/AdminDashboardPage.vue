<template>
  <section v-if="shop" class="dashboard-page">
    <div class="dashboard-hero">
      <div class="dashboard-greeting">
        <span class="dashboard-sun" aria-hidden="true"></span>
        <div>
          <h1>Selamat pagi, {{ shop.name }}</h1>
          <p>Kelola toko Anda dengan mudah hari ini.</p>
        </div>
      </div>
      <div class="dashboard-actions">
        <span class="dashboard-filter"><CalendarDays :size="18" /> 7 hari terakhir <ChevronDown :size="16" /></span>
        <RouterLink :to="`/toko/${shop.slug}`" target="_blank"><AppButton>Lihat Toko</AppButton></RouterLink>
      </div>
    </div>

    <div class="dashboard-stats">
      <article v-for="metric in metrics" :key="metric.label" class="dashboard-stat-card" :class="`dashboard-stat-card--${metric.tone}`">
        <span class="dashboard-stat-icon"><component :is="metric.icon" :size="28" stroke-width="2.1" /></span>
        <div>
          <strong>{{ metric.label }}</strong>
          <h2>{{ metric.value }}</h2>
          <p>{{ metric.helper }}</p>
        </div>
        <svg class="dashboard-spark" aria-hidden="true" viewBox="0 0 120 48" fill="none">
          <path class="dashboard-spark-fill" d="M4 38 C18 35 22 24 36 27 C48 30 53 39 66 33 C78 27 79 15 92 13 C104 11 108 24 116 18 L116 48 L4 48 Z" />
          <path class="dashboard-spark-line" d="M4 38 C18 35 22 24 36 27 C48 30 53 39 66 33 C78 27 79 15 92 13 C104 11 108 24 116 18" />
          <circle class="dashboard-spark-dot" cx="92" cy="13" r="3.2" />
          <circle class="dashboard-spark-dot" cx="116" cy="18" r="3.2" />
        </svg>
      </article>
    </div>

    <div class="dashboard-main-grid">
      <article class="dashboard-card dashboard-readiness-card">
        <div class="dashboard-card-head">
          <div>
            <h2>Kesiapan Toko</h2>
            <p>Pastikan toko siap menerima pesanan dari WhatsApp.</p>
          </div>
          <span class="dashboard-score">{{ readinessScore }}%</span>
        </div>
        <div class="dashboard-progress">
          <div>
            <strong>Skor kesiapan</strong>
            <span>{{ readinessScore }}%</span>
          </div>
          <div class="progress-bar"><span :style="{ width: `${readinessScore}%` }"></span></div>
        </div>
        <div class="dashboard-checklist">
          <div v-for="item in readinessItems" :key="item.label" class="dashboard-check-item" :class="{ 'is-ready': item.done }">
            <span class="dashboard-check-icon"><component :is="item.done ? Check : AlertCircle" :size="20" stroke-width="2.4" /></span>
            <div>
              <strong>{{ item.label }}</strong>
              <p>{{ item.helper }}</p>
            </div>
            <span class="dashboard-status" :class="item.done ? 'is-ready' : 'is-needed'">{{ item.done ? 'Siap' : 'Perlu' }}</span>
          </div>
        </div>
      </article>

      <article class="dashboard-card dashboard-activity-card">
        <div class="dashboard-card-head">
          <div>
            <h2>Aktivitas Terbaru</h2>
            <p>Langkah berikutnya agar toko makin siap jualan.</p>
          </div>
          <span class="dashboard-live"><span></span>Live</span>
        </div>
        <div class="dashboard-timeline">
          <div v-for="activity in activities" :key="activity.title" class="dashboard-timeline-item">
            <span class="dashboard-timeline-dot">{{ activity.icon }}</span>
            <div>
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.text }}</p>
            </div>
            <small>{{ activity.time }}</small>
          </div>
        </div>
      </article>
    </div>

    <div class="dashboard-bottom-grid">
      <article class="dashboard-card dashboard-qr-card">
        <div class="dashboard-card-title">
          <span><QrCode :size="22" /></span>
          <div>
            <h2>QR Toko & Link</h2>
            <p>Tempel QR di kemasan, meja kasir, bio, atau story.</p>
          </div>
        </div>
        <div class="dashboard-qr-content">
          <div class="dashboard-qr-stand">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code toko" />
          </div>
          <div class="dashboard-share-panel">
            <label>
              <span>Link Toko</span>
              <input :value="shopUrl" readonly />
            </label>
            <div class="actions">
              <AppButton variant="secondary" @click="copyLink">Salin Link</AppButton>
              <a v-if="qrDataUrl" :href="qrDataUrl" download="qr-code-toko.png"><AppButton variant="ghost">Unduh QR</AppButton></a>
            </div>
          </div>
        </div>
      </article>

      <article class="dashboard-card dashboard-products-card">
        <div class="dashboard-card-title">
          <span><ShoppingBag :size="22" /></span>
          <div>
            <h2>Produk Aktif</h2>
            <p>Kelola dan pantau produk yang aktif di toko.</p>
          </div>
        </div>
        <div class="dashboard-product-visual">
          <div class="dashboard-box-visual" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div>
            <strong>{{ activeProducts }}</strong>
            <p>Total produk aktif</p>
          </div>
        </div>
        <RouterLink to="/admin/produk"><AppButton variant="secondary" block>Kelola Produk</AppButton></RouterLink>
      </article>

      <article class="dashboard-card dashboard-mobile-card">
        <div class="dashboard-card-title">
          <span><Smartphone :size="22" /></span>
          <div>
            <h2>Mobile Admin Quick View</h2>
            <p>Ringkasan toko dalam genggaman.</p>
          </div>
        </div>
        <div class="dashboard-mobile-scene">
          <div class="mobile-preview dashboard-mobile-preview">
            <div class="mobile-preview__top">
              <strong>Dashboard</strong>
              <div>{{ activeProducts }}</div>
              <small>Produk aktif</small>
            </div>
            <div class="mobile-preview__body">
              <div v-for="product in products.slice(0, 2)" :key="product.id" class="dashboard-mobile-product">
                <img :src="product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="product.name" class="product-thumb" />
                <div>
                  <strong>{{ product.name }}</strong>
                  <span>{{ formatCurrency(product.price) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="dashboard-parcel-visual" aria-hidden="true"></div>
        </div>
      </article>
    </div>

    <div v-if="products.length === 0" class="dashboard-empty-wrap">
      <EmptyState title="Belum ada produk" description="Tambahkan produk pertama agar toko siap menerima pesanan." icon="0" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { AlertCircle, CalendarDays, Check, ChevronDown, MessageCircle, Package, QrCode, ShoppingBag, Smartphone, Store, Tags } from '@lucide/vue';
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
  { label: 'Kunjungan Toko', value: String(stats.value?.visits ?? 0), helper: '30 hari terakhir', icon: Store, tone: 'teal' },
  { label: 'Klik WhatsApp', value: String(stats.value?.checkoutClicks ?? 0), helper: 'Checkout tercatat', icon: MessageCircle, tone: 'green' },
  { label: 'Produk Aktif', value: String(activeProducts.value), helper: `${products.value.length} total produk`, icon: Package, tone: 'amber' },
  { label: 'Kategori', value: String(categories.value.length), helper: 'Kategori katalog', icon: Tags, tone: 'purple' },
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
