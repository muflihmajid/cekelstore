<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Statistik Dasar</h1>
        <p>Pantau kunjungan, klik checkout WhatsApp, dan produk populer.</p>
      </div>
      <span class="badge badge--muted">7 hari terakhir</span>
    </div>
    <AlertMessage :message="error" type="error" />

    <div v-if="stats" class="grid grid-4">
      <div class="card card-pad stat-card"><span class="badge">Jumlah Kunjungan</span><h2>{{ stats.visits }}</h2><p>30 hari terakhir</p></div>
      <div class="card card-pad stat-card"><span class="badge">Klik WhatsApp</span><h2>{{ stats.checkoutClicks }}</h2><p>Checkout tercatat</p></div>
      <div class="card card-pad stat-card"><span class="badge">Klik Produk</span><h2>{{ stats.productClicks }}</h2><p>Interaksi katalog</p></div>
      <div class="card card-pad stat-card"><span class="badge">Rasio Checkout</span><h2>{{ checkoutRate }}%</h2><p>Dari kunjungan ke WhatsApp</p></div>
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <div class="card card-pad">
        <h3 style="margin-top:0">Produk Terpopuler</h3>
        <EmptyState v-if="!stats || stats.popularProducts.length === 0" title="Belum ada data" description="Data akan muncul setelah pelanggan membuka toko dan menambahkan produk." icon="0" />
        <div v-else>
          <div v-for="(item, index) in stats.popularProducts" :key="item.productId" class="progress-row">
            <strong>{{ item.productName }}</strong>
            <span>{{ item.clicks }}</span>
            <div class="progress-bar"><span :style="{ width: `${Math.max(12, 100 - index * 16)}%` }"></span></div>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <h3 style="margin-top:0">Insight Operasional</h3>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-dot">V</span>
            <div>
              <strong>Kunjungan toko</strong>
              <div style="color:var(--color-muted); font-size:13px">Setiap pembeli membuka halaman toko, kunjungan akan tercatat.</div>
            </div>
            <span class="badge">{{ stats?.visits ?? 0 }}</span>
          </div>
          <div class="activity-item">
            <span class="activity-dot">W</span>
            <div>
              <strong>Checkout WhatsApp</strong>
              <div style="color:var(--color-muted); font-size:13px">Klik checkout membantu mengukur minat pembeli yang siap memesan.</div>
            </div>
            <span class="badge">{{ stats?.checkoutClicks ?? 0 }}</span>
          </div>
          <div class="activity-item">
            <span class="activity-dot">P</span>
            <div>
              <strong>Produk populer</strong>
              <div style="color:var(--color-muted); font-size:13px">Gunakan produk paling sering diklik untuk mengatur stok dan promosi.</div>
            </div>
            <span class="badge">{{ stats?.popularProducts.length ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import type { StoreStats } from '@/core/domain/entities';
import { getStoreStats } from '@/application/usecases/stats/GetStoreStats';
import { getErrorMessage } from '@/core/errors/AppError';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop } = context;
const stats = ref<StoreStats | null>(null);
const error = ref<string | null>(null);

const checkoutRate = computed(() => {
  if (!stats.value?.visits) return 0;
  return Math.round((stats.value.checkoutClicks / stats.value.visits) * 100);
});

async function load() {
  if (!shop.value) return;
  try { stats.value = await getStoreStats(shop.value.id); }
  catch (err) { error.value = getErrorMessage(err); }
}

watch(shop, load, { immediate: true });
</script>
