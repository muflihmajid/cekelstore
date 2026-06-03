<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Kelola Produk</h1>
        <p>Tambah, edit, hapus produk, upload foto, kategori, stok, dan status tersedia.</p>
      </div>
      <AppButton @click="openCreate">Tambah Produk</AppButton>
    </div>
    <AlertMessage :message="error" type="error" />

    <div class="grid" :class="{ 'grid-2': showForm }">
      <div class="card card-pad">
        <div class="store-toolbar">
          <div class="grid grid-3">
            <input v-model="search" class="input" placeholder="Cari produk..." />
            <select v-model="filterCategory" class="input">
              <option value="all">Semua Kategori</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
            <select v-model="filterStatus" class="input">
              <option value="all">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="habis">Habis</option>
              <option value="pre-order">Pre-order</option>
            </select>
          </div>
        </div>

        <EmptyState v-if="filteredProducts.length === 0" title="Belum ada produk" description="Tambahkan produk pertama agar toko bisa dibagikan." icon="0" />
        <table v-else class="table">
          <thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td><div style="display:flex; align-items:center; gap:12px"><img :src="product.imageUrl || '/assets/cekel-store-icon.svg'" :alt="product.name" class="product-thumb" /><strong>{{ product.name }}</strong></div></td>
              <td>{{ categoryName(product.categoryId) }}</td>
              <td>{{ formatCurrency(product.price) }}</td>
              <td><span class="badge" :class="statusBadgeClass(product.status)">{{ statusLabel(product.status) }}</span></td>
              <td><div class="actions"><AppButton variant="secondary" @click="edit(product)">Edit</AppButton><AppButton variant="danger" @click="remove(product.id)">Hapus</AppButton></div></td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex; justify-content:space-between; align-items:center; color:var(--color-muted); font-size:13px; margin-top:14px">
          <span>Menampilkan {{ filteredProducts.length }} dari {{ products.length }} produk</span>
          <span class="badge badge--muted">1</span>
        </div>
      </div>

      <div v-if="showForm" class="card card-pad">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px">
          <h3 style="margin:0">{{ form.id ? 'Edit Produk' : 'Tambah Produk' }}</h3>
          <button class="category-chip" type="button" @click="closeForm">Tutup</button>
        </div>
        <form class="grid" style="margin-top:18px" @submit.prevent="submit">
          <div class="field">
            <span class="field__label">Foto Produk</span>
            <div style="display:flex; gap:12px; align-items:center">
              <img v-if="form.imageUrl" :src="form.imageUrl" class="product-thumb" style="width:96px; height:96px" />
              <input class="input" type="file" accept="image/*" @change="onImageChange" />
            </div>
          </div>
          <AppInput v-model="form.name" label="Nama produk" />
          <AppInput v-model="form.price" label="Harga" type="number" />
          <label class="field">
            <span class="field__label">Kategori</span>
            <select v-model="form.categoryId" class="input">
              <option :value="null">Tanpa kategori</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <AppInput v-model="form.description" label="Deskripsi singkat" textarea />
          <label class="field">
            <span class="field__label">Status</span>
            <select v-model="form.status" class="input">
              <option value="tersedia">Tersedia</option>
              <option value="habis">Habis</option>
              <option value="pre-order">Pre-order</option>
            </select>
          </label>
          <AppInput v-model="form.stock" label="Stok opsional" type="number" />
          <AppButton :loading="loading">Simpan Produk</AppButton>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, watch } from 'vue';
import type { Category, Product, ProductStatus } from '@/core/domain/entities';
import { saveProduct } from '@/application/usecases/product/SaveProduct';
import { repositories } from '@/infrastructure/supabase/repositories';
import { formatCurrency } from '@/core/utils/formatters';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AppInput from '@/shared/components/AppInput.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop } = context;
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const showForm = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const imageFile = ref<File | null>(null);
const search = ref('');
const filterCategory = ref('all');
const filterStatus = ref('all');

const form = reactive({ id: undefined as string | undefined, name: '', description: '', price: 0, categoryId: null as string | null, imageUrl: '', status: 'tersedia' as ProductStatus, stock: null as number | null });

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return products.value.filter((product) => {
    const matchSearch = !keyword || product.name.toLowerCase().includes(keyword);
    const matchCategory = filterCategory.value === 'all' || product.categoryId === filterCategory.value;
    const matchStatus = filterStatus.value === 'all' || product.status === filterStatus.value;
    return matchSearch && matchCategory && matchStatus;
  });
});

async function load() {
  if (!shop.value) return;
  [products.value, categories.value] = await Promise.all([
    repositories.products.listByShop(shop.value.id), repositories.categories.listByShop(shop.value.id),
  ]);
}

function resetForm() { form.id = undefined; form.name = ''; form.description = ''; form.price = 0; form.categoryId = null; form.imageUrl = ''; form.status = 'tersedia'; form.stock = null; imageFile.value = null; }
function openCreate() { resetForm(); showForm.value = true; }
function closeForm() { showForm.value = false; resetForm(); }
function edit(product: Product) { form.id = product.id; form.name = product.name; form.description = product.description || ''; form.price = product.price; form.categoryId = product.categoryId; form.imageUrl = product.imageUrl || ''; form.status = product.status; form.stock = product.stock; imageFile.value = null; showForm.value = true; }
function onImageChange(event: Event) { const target = event.target as HTMLInputElement; imageFile.value = target.files?.[0] || null; if (imageFile.value) form.imageUrl = URL.createObjectURL(imageFile.value); }
function categoryName(id: string | null) { return categories.value.find((category) => category.id === id)?.name || '-'; }
function statusLabel(status: ProductStatus) { return status === 'pre-order' ? 'Pre-order' : status === 'habis' ? 'Habis' : 'Tersedia'; }
function statusBadgeClass(status: ProductStatus) { return status === 'pre-order' ? 'badge--warning' : status === 'habis' ? 'badge--muted' : 'badge--success'; }

async function submit() {
  if (!shop.value) return;
  loading.value = true; error.value = null;
  try {
    await saveProduct({ id: form.id, shopId: shop.value.id, name: form.name, description: form.description || null, price: Number(form.price), categoryId: form.categoryId, imageUrl: form.imageUrl || null, status: form.status, stock: form.stock ? Number(form.stock) : null, imageFile: imageFile.value });
    await load(); closeForm();
  } catch (err) { error.value = getErrorMessage(err); }
  finally { loading.value = false; }
}
async function remove(id: string) { if (!confirm('Hapus produk ini?')) return; await repositories.products.remove(id); await load(); }
watch(shop, load, { immediate: true });
</script>
