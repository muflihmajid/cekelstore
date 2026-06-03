<template>
  <main class="page">
    <div v-if="loading" class="container" style="padding:40px 0">Memuat toko...</div>
    <div v-else-if="!store" class="container" style="padding:40px 0">
      <EmptyState title="Toko tidak ditemukan" description="Link toko belum aktif atau slug salah." icon="?" />
    </div>
    <template v-else>
      <header class="store-header">
        <div class="container store-top">
          <RouterLink to="/" class="brand-row">
            <img src="/assets/cekel-store-icon.svg" alt="Cekel Store" class="brand-logo" />
            <span>Cekel Store</span>
          </RouterLink>
          <div class="actions">
            <button class="category-chip" @click="shareStore">Bagikan Toko</button>
            <button class="category-chip" @click="scrollToCart">Keranjang ({{ totalQuantity }})</button>
          </div>
        </div>
      </header>

      <section class="store-cover">
        <div class="store-profile">
          <img :src="store.shop.logoUrl || '/assets/cekel-store-icon.svg'" alt="Logo toko" class="store-avatar" />
          <div>
            <h1>{{ store.shop.name }}</h1>
            <p>{{ store.shop.description || 'Toko online ringan yang terhubung langsung ke WhatsApp.' }}</p>
            <div class="actions" style="margin-top:14px">
              <span v-if="store.shop.address" class="badge">{{ store.shop.address }}</span>
              <span v-if="store.shop.openingHours" class="badge">{{ store.shop.openingHours }}</span>
              <span class="badge">Checkout WhatsApp</span>
            </div>
          </div>
          <AppButton style="margin-left:auto" @click="scrollToCart">Chat via WhatsApp</AppButton>
        </div>
      </section>

      <section class="container store-layout">
        <div>
          <div class="store-toolbar">
            <input v-model="search" class="input" placeholder="Cari produk..." />
            <div class="category-row">
              <button class="category-chip" :class="{ 'is-active': selectedCategory === 'all' }" @click="selectedCategory = 'all'">Semua</button>
              <button v-for="category in store.categories" :key="category.id" class="category-chip" :class="{ 'is-active': selectedCategory === category.id }" @click="selectedCategory = category.id">{{ category.name }}</button>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px">
            <h2 style="margin:0; color:var(--color-primary-dark)">Produk Terbaru</h2>
            <span class="badge badge--muted">{{ filteredProducts.length }} produk</span>
          </div>

          <EmptyState v-if="filteredProducts.length === 0" title="Produk belum tersedia" description="Coba kata kunci atau kategori lain." icon="0" />
          <div v-else class="product-grid">
            <article v-for="product in filteredProducts" :key="product.id" class="card product-card">
              <img :src="product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="product.name" class="product-card__image" />
              <div class="product-card__body">
                <div>
                  <h3>{{ product.name }}</h3>
                  <p v-if="product.description" style="color:var(--color-muted); margin:6px 0 0; font-size:14px">{{ product.description }}</p>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px">
                  <div class="price">{{ formatCurrency(product.price) }}</div>
                  <span class="badge" :class="statusBadgeClass(product.status)">{{ statusLabel(product.status) }}</span>
                </div>
                <AppButton v-if="product.isAvailable" block @click="addToCart(product)">Tambah ke Keranjang</AppButton>
                <AppButton v-else block disabled variant="ghost">Stok Habis</AppButton>
              </div>
            </article>
          </div>
        </div>

        <aside ref="cartRef" class="cart-panel card card-pad">
          <h2 style="margin-top:0">Keranjang Belanja</h2>
          <EmptyState v-if="items.length === 0" title="Keranjang kosong" description="Tambahkan produk untuk mulai pesan." icon="0" />
          <div v-else>
            <div v-for="item in items" :key="item.product.id" class="cart-line">
              <img :src="item.product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="item.product.name" class="product-thumb" />
              <div>
                <strong>{{ item.product.name }}</strong>
                <div style="color:var(--color-muted); font-size:13px">{{ formatCurrency(item.product.price) }}</div>
                <div class="cart-controls" style="margin-top:8px">
                  <button class="qty-btn" @click="decrease(item.product.id)">-</button>
                  <strong>{{ item.quantity }}</strong>
                  <button class="qty-btn" @click="add(item.product)">+</button>
                  <button class="category-chip" style="padding:5px 9px" @click="remove(item.product.id)">Hapus</button>
                </div>
              </div>
              <strong>{{ formatCurrency(item.product.price * item.quantity) }}</strong>
            </div>
            <div class="field" style="margin-top:14px">
              <span class="field__label">Catatan untuk penjual (opsional)</span>
              <input class="input" placeholder="Contoh: tanpa kacang, dikirim sore." />
            </div>
            <div class="total-row"><span>Total</span><span>{{ formatCurrency(subtotal) }}</span></div>
            <AppButton block @click="checkout">Checkout via WhatsApp</AppButton>
            <p style="color:var(--color-muted); font-size:13px; text-align:center">Pesanan langsung terkirim ke WhatsApp toko.</p>
          </div>
        </aside>
      </section>

      <footer class="footer-brand">
        <div class="footer-inner">
          <span>Dibuat dengan Cekel Store by Cekel Works.</span>
          <strong>Ringan. Cepat. Langsung WhatsApp.</strong>
        </div>
      </footer>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Product, ProductStatus } from '@/core/domain/entities';
import { getPublicStore, type PublicStoreData } from '@/application/usecases/shop/GetPublicStore';
import { repositories } from '@/infrastructure/supabase/repositories';
import { applyThemeVars } from '@/core/utils/themes';
import { buildWhatsAppUrl, formatCurrency } from '@/core/utils/formatters';
import { useCart } from '@/shared/composables/useCart';
import AppButton from '@/shared/components/AppButton.vue';
import EmptyState from '@/shared/components/EmptyState.vue';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const store = ref<PublicStoreData | null>(null);
const loading = ref(true);
const search = ref('');
const selectedCategory = ref<string>('all');
const cartRef = ref<HTMLElement | null>(null);
const { items, subtotal, totalQuantity, add, decrease, remove, clear } = useCart(slug.value);

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return (store.value?.products || []).filter((product) => {
    const matchCategory = selectedCategory.value === 'all' || product.categoryId === selectedCategory.value;
    const matchSearch = !keyword || product.name.toLowerCase().includes(keyword);
    return matchCategory && matchSearch;
  });
});

async function loadStore() {
  loading.value = true;
  store.value = await getPublicStore(slug.value);
  if (store.value) {
    applyThemeVars(store.value.shop.themeKey);
    await repositories.analytics.track(store.value.shop.id, 'visit');
  }
  loading.value = false;
}

async function addToCart(product: Product) {
  add(product);
  if (store.value) await repositories.analytics.track(store.value.shop.id, 'product_click', product.id);
}

async function checkout() {
  if (!store.value || items.value.length === 0) return;
  await repositories.analytics.track(store.value.shop.id, 'checkout_click');
  const lines = items.value.map((item) => `${item.quantity}x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}`).join('\n');
  const message = `Halo Kak, saya mau pesan:\n\n${lines}\n\nTotal: ${formatCurrency(subtotal.value)}\n\nNama:\nAlamat:\nCatatan:`;
  window.open(buildWhatsAppUrl(store.value.shop.whatsappNumber, message), '_blank');
}

function scrollToCart() { cartRef.value?.scrollIntoView({ behavior: 'smooth' }); }
function statusLabel(status: ProductStatus) { return status === 'pre-order' ? 'Pre-order' : status === 'habis' ? 'Habis' : 'Tersedia'; }
function statusBadgeClass(status: ProductStatus) { return status === 'pre-order' ? 'badge--warning' : status === 'habis' ? 'badge--muted' : 'badge--success'; }
async function shareStore() {
  const url = window.location.href;
  if (navigator.share && store.value) await navigator.share({ title: store.value.shop.name, url });
  else await navigator.clipboard.writeText(url);
}

watch(() => route.params.slug, loadStore);
onMounted(loadStore);
</script>
