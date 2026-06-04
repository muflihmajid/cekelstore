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
        <AppButton variant="secondary" @click="qrPopoverOpen = true"><QrCode :size="17" /> QR Toko</AppButton>
        <RouterLink :to="`/toko/${shop.slug}`" target="_blank"><AppButton>Lihat Toko</AppButton></RouterLink>
      </div>
    </div>

    <div v-if="qrPopoverOpen" class="dashboard-qr-popover" role="dialog" aria-modal="true" aria-label="QR Toko">
      <button class="dashboard-qr-backdrop" type="button" aria-label="Tutup QR Toko" @click="qrPopoverOpen = false"></button>
      <article class="dashboard-qr-panel">
        <div class="dashboard-qr-panel-head">
          <strong>QR Toko</strong>
          <button type="button" aria-label="Tutup QR Toko" @click="qrPopoverOpen = false">x</button>
        </div>
        <div class="dashboard-qr-panel-body">
          <div class="dashboard-qr-stand">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code toko" />
          </div>
          <label>
            <span>Link Toko</span>
            <input :value="shopUrl" readonly />
          </label>
        </div>
        <div class="dashboard-qr-panel-actions">
          <AppButton variant="secondary" @click="copyLink">Salin Link</AppButton>
          <a v-if="qrDataUrl" :href="qrDataUrl" download="qr-code-toko.png"><AppButton variant="ghost"><Download :size="15" /> Unduh QR</AppButton></a>
        </div>
      </article>
    </div>

    <div class="dashboard-stats">
      <article v-for="metric in metrics" :key="metric.label" class="dashboard-stat-card" :class="`dashboard-stat-card--${metric.tone}`">
        <span class="dashboard-stat-icon"><component :is="metric.icon" :size="22" stroke-width="2.2" /></span>
        <div class="dashboard-stat-content">
          <strong>{{ metric.label }}</strong>
          <h2>{{ metric.value }}</h2>
          <p>{{ metric.helper }}</p>
        </div>
        <Sparkline class="dashboard-stat-sparkline" />
      </article>
    </div>

    <div class="dashboard-main-grid" :class="{ 'is-complete': isSetupComplete }">
      <article v-if="!isSetupComplete" class="dashboard-card dashboard-readiness-card">
        <div class="dashboard-readiness-main">
          <div class="dashboard-readiness-copy">
            <span class="dashboard-kicker">Kesiapan toko</span>
            <h2>Toko kamu {{ readinessScore }}% siap menerima pesanan</h2>
            <p>Lengkapi langkah penting agar toko siap dibagikan dan menerima checkout WhatsApp.</p>
          </div>

          <div class="dashboard-readiness-score">
            <strong>{{ readinessScore }}%</strong>
            <span>Siap</span>
          </div>
        </div>

        <div class="dashboard-progress">
          <div>
            <strong>Progress setup</strong>
            <span>{{ readinessScore }}%</span>
          </div>
          <div class="progress-bar"><span :style="{ width: `${readinessScore}%` }"></span></div>
        </div>

        <div class="dashboard-readiness-grid">
          <div v-for="item in readinessItems" :key="item.label" class="dashboard-check-item" :class="{ 'is-ready': item.done }">
            <span class="dashboard-check-icon"><component :is="item.done ? Check : AlertCircle" :size="18" stroke-width="2.4" /></span>
            <div>
              <strong>{{ item.label }}</strong>
              <p>{{ item.helper }}</p>
            </div>
            <span class="dashboard-status" :class="item.done ? 'is-ready' : 'is-needed'">{{ item.done ? 'Siap' : 'Perlu' }}</span>
          </div>
        </div>

        <div class="dashboard-readiness-actions">
          <RouterLink to="/admin/produk"><AppButton>Tambah Produk</AppButton></RouterLink>
          <RouterLink to="/admin/kategori"><AppButton variant="secondary">Atur Kategori</AppButton></RouterLink>
        </div>
      </article>

      <article v-else class="dashboard-card dashboard-analytics-card">
        <div class="dashboard-card-head">
          <div>
            <h2>Laporan Penjualan</h2>
            <p>Ringkasan performa toko dari data analytics</p>
          </div>
          <div class="dashboard-filter-pills" aria-label="Filter laporan">
            <button
              v-for="option in reportOptions"
              :key="option.key"
              type="button"
              :class="{ 'is-active': reportRange === option.key }"
              @click="reportRange = option.key"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="dashboard-sales-summary">
          <div>
            <span>Estimasi nilai checkout</span>
            <strong>{{ estimatedSalesLabel }}</strong>
          </div>
          <div>
            <span>Total checkout</span>
            <strong>{{ estimatedOrders }}</strong>
          </div>
        </div>

        <div class="dashboard-sales-chart">
          <canvas ref="salesChartCanvas" aria-label="Grafik kunjungan, checkout, dan klik produk" role="img"></canvas>
        </div>
      </article>

      <article v-if="!isSetupComplete" class="dashboard-card dashboard-next-card">
        <div class="dashboard-next-head">
          <div>
            <h2>Langkah Berikutnya</h2>
            <p>Fokuskan pada hal yang paling berdampak dulu.</p>
          </div>
        </div>
        <div class="dashboard-next-list">
          <RouterLink v-for="action in nextActions" :key="action.title" :to="action.to" class="dashboard-next-item">
            <span><component :is="action.icon" :size="18" stroke-width="2.4" /></span>
            <div>
              <strong>{{ action.title }}</strong>
              <p>{{ action.text }}</p>
            </div>
          </RouterLink>
        </div>
      </article>

      <aside v-else class="dashboard-business-stack">
        <section class="dashboard-card dashboard-mini-panel dashboard-stock-panel">
          <div class="dashboard-mini-head">
            <div>
              <h3>Ringkasan Stok</h3>
              <p>Situasi katalog aktif saat ini.</p>
            </div>
            <RouterLink to="/admin/produk">Kelola Produk</RouterLink>
          </div>
          <div class="dashboard-stock-grid">
            <div><strong>{{ products.length }}</strong><span>Total produk</span></div>
            <div><strong>{{ lowStockProducts }}</strong><span>Stok menipis</span></div>
            <div><strong>{{ outOfStockProducts }}</strong><span>Stok habis</span></div>
          </div>
        </section>

        <section class="dashboard-card dashboard-mini-panel dashboard-repeat-panel">
          <div class="dashboard-mini-head">
            <div>
              <h3>Pelanggan Kembali</h3>
              <p>Data repeat order akan aktif setelah transaksi tercatat.</p>
            </div>
          </div>
          <div class="dashboard-repeat-summary">
            <strong>{{ repeatOrderCount }}</strong>
            <span>{{ repeatOrderRate }}% repeat order</span>
            <small>{{ repeatCheckoutCount }} checkout berulang</small>
          </div>
        </section>

        <section class="dashboard-card dashboard-mini-panel dashboard-orders-panel">
          <div class="dashboard-mini-head">
            <div>
              <h3>Pesanan Terbaru</h3>
              <p>Checkout WhatsApp terbaru akan tampil di sini.</p>
            </div>
            <span class="dashboard-live"><span></span>Live</span>
          </div>
          <div class="dashboard-order-empty">
            <MessageCircle :size="20" />
            <span>Belum ada pesanan tercatat</span>
          </div>
        </section>
      </aside>
    </div>

    <div v-if="products.length === 0" class="dashboard-empty-product">
      <div>
        <h3>Belum ada produk</h3>
        <p>Tambahkan produk pertama agar toko siap menerima pesanan.</p>
      </div>
      <RouterLink to="/admin/produk"><AppButton>Tambah Produk Pertama</AppButton></RouterLink>
    </div>

    <div v-else-if="!isSetupComplete" class="dashboard-quick-actions">
      <RouterLink v-for="action in quickActions" :key="action.title" :to="action.to" class="dashboard-card dashboard-quick-card">
        <span><component :is="action.icon" :size="19" stroke-width="2.4" /></span>
        <strong>{{ action.title }}</strong>
        <small>{{ action.text }}</small>
      </RouterLink>
    </div>

    <div v-else-if="isSetupComplete" class="dashboard-top-products">
      <div>
        <h3>Produk Terlaris</h3>
        <p>Top produk berdasarkan interaksi katalog.</p>
      </div>
      <div class="dashboard-top-products-list">
        <div v-for="product in topProducts" :key="product.name">
          <strong>{{ product.name }}</strong>
          <span>{{ product.count }} interaksi</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { AlertCircle, Check, Download, MessageCircle, Package, QrCode, Store, Tags } from '@lucide/vue';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';
import type { Category, Product, StoreStats } from '@/core/domain/entities';
import { env } from '@/core/config/env';
import { repositories } from '@/infrastructure/supabase/repositories';
import AppButton from '@/shared/components/AppButton.vue';
import Sparkline from '@/shared/components/Sparkline.vue';
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
const qrPopoverOpen = ref(false);
const salesChartCanvas = ref<HTMLCanvasElement | null>(null);
const { qrDataUrl, generate } = useQrCode();
const shopUrl = computed(() => shop.value ? `${env.publicSiteUrl}/toko/${shop.value.slug}` : '');
type ReportRange = '7d' | '30d' | 'month';
const reportRange = ref<ReportRange>('7d');
const reportOptions: Array<{ key: ReportRange; label: string }> = [
  { key: '7d', label: '7 hari' },
  { key: '30d', label: '30 hari' },
  { key: 'month', label: 'Bulan ini' },
];
let salesChart: Chart | null = null;

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
const isSetupComplete = computed(() => readinessScore.value === 100);
const filteredSeries = computed(() => {
  const series = stats.value?.dailySeries || [];
  if (reportRange.value === '7d') return series.slice(-7);
  if (reportRange.value === 'month') {
    const monthKey = new Date().toISOString().slice(0, 7);
    return series.filter((day) => day.date.startsWith(monthKey));
  }
  return series.slice(-30);
});
const estimatedOrders = computed(() => filteredSeries.value.reduce((sum, day) => sum + day.checkoutClicks, 0));
const estimatedSales = computed(() => {
  const averageProductPrice = products.value.length
    ? products.value.reduce((sum, product) => sum + product.price, 0) / products.value.length
    : 0;
  return Math.round(averageProductPrice * estimatedOrders.value);
});
const estimatedSalesLabel = computed(() => formatCurrency(estimatedSales.value));
const lowStockProducts = computed(() => products.value.filter((product) => product.stock !== null && product.stock > 0 && product.stock <= 5).length);
const outOfStockProducts = computed(() => products.value.filter((product) => product.status === 'habis' || product.stock === 0).length);
const repeatOrderCount = computed(() => 0);
const repeatOrderRate = computed(() => 0);
const repeatCheckoutCount = computed(() => 0);
const topProducts = computed(() => {
  const popular = stats.value?.popularProducts || [];
  if (popular.length) {
    return popular.slice(0, 3).map((product) => ({ name: product.productName, count: product.clicks }));
  }
  return products.value.slice(0, 3).map((product, index) => ({ name: product.name, count: Math.max(1, activeProducts.value - index) }));
});

const nextActions = computed(() => [
  {
    icon: Package,
    title: products.value.length ? 'Periksa produk aktif' : 'Tambah produk pertama',
    text: products.value.length ? `${products.value.length} produk sudah masuk katalog.` : 'Mulai dari produk unggulan yang paling siap dijual.',
    to: '/admin/produk',
  },
  {
    icon: Tags,
    title: 'Rapikan kategori',
    text: categories.value.length ? `${categories.value.length} kategori sudah tersedia.` : 'Bantu pembeli menemukan produk lebih cepat.',
    to: '/admin/kategori',
  },
  {
    icon: MessageCircle,
    title: 'Uji checkout WhatsApp',
    text: 'Pastikan nomor aktif dan format pesan terbaca rapi.',
    to: `/toko/${shop.value?.slug || ''}`,
  },
]);

const quickActions = computed(() => [
  { icon: Package, title: 'Tambah Produk', text: 'Lengkapi katalog toko.', to: '/admin/produk' },
  { icon: Tags, title: 'Buat Kategori', text: 'Susun katalog lebih rapi.', to: '/admin/kategori' },
  { icon: QrCode, title: 'QR Toko', text: 'Bagikan toko lebih cepat.', to: '/admin/qr' },
  { icon: Store, title: 'Profil Toko', text: 'Rapikan identitas toko.', to: '/admin/profil' },
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

function getChartGradient(context: CanvasRenderingContext2D, color: string) {
  const gradient = context.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, `${color}33`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
}

function renderSalesChart() {
  if (!isSetupComplete.value) {
    salesChart?.destroy();
    salesChart = null;
    return;
  }

  const canvas = salesChartCanvas.value;
  if (!canvas) return;

  const context2d = canvas.getContext('2d');
  if (!context2d) return;

  const labels = filteredSeries.value.map((day) => day.label);
  const visits = filteredSeries.value.map((day) => day.visits);
  const checkoutClicks = filteredSeries.value.map((day) => day.checkoutClicks);
  const productClicks = filteredSeries.value.map((day) => day.productClicks);

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Kunjungan',
          data: visits,
          borderColor: '#0F817E',
          backgroundColor: getChartGradient(context2d, '#0F817E'),
          borderWidth: 3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#0F817E',
          tension: 0.42,
        },
        {
          label: 'Checkout WA',
          data: checkoutClicks,
          borderColor: '#20AA6B',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#20AA6B',
          tension: 0.42,
        },
        {
          label: 'Klik Produk',
          data: productClicks,
          borderColor: '#D48142',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#D48142',
          tension: 0.42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxHeight: 8,
            boxWidth: 8,
            color: '#63787C',
            font: { family: 'Plus Jakarta Sans, Inter, sans-serif', size: 11, weight: 700 },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#12333B',
          padding: 12,
          titleFont: { family: 'Plus Jakarta Sans, Inter, sans-serif', size: 12, weight: 800 },
          bodyFont: { family: 'Plus Jakarta Sans, Inter, sans-serif', size: 12, weight: 600 },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: '#63787C', font: { family: 'Plus Jakarta Sans, Inter, sans-serif', size: 10, weight: 700 }, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: 'rgba(15, 118, 110, 0.08)' },
          ticks: { precision: 0, color: '#63787C', font: { family: 'Plus Jakarta Sans, Inter, sans-serif', size: 10, weight: 700 } },
        },
      },
    },
  };

  if (!salesChart) {
    salesChart = new Chart(canvas, config);
    return;
  }

  salesChart.data.labels = labels;
  salesChart.data.datasets.forEach((dataset, index) => {
    dataset.data = [visits, checkoutClicks, productClicks][index];
  });
  salesChart.update();
}

watch(shop, load, { immediate: true });
watch([filteredSeries, isSetupComplete], async () => {
  await nextTick();
  renderSalesChart();
}, { deep: true, immediate: true });
onMounted(load);
onBeforeUnmount(() => {
  salesChart?.destroy();
});
</script>
