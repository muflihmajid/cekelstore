<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Kategori Produk</h1>
        <p>Buat kategori seperti makanan, minuman, hampers, laundry, fashion, dan lainnya.</p>
      </div>
    </div>
    <AlertMessage :message="error" type="error" />
    <form class="card card-pad grid grid-2" style="margin-bottom:18px" @submit.prevent="submit">
      <AppInput v-model="name" label="Nama kategori" placeholder="Makanan" />
      <div style="display:flex; align-items:end; gap:8px">
        <AppButton :loading="loading">{{ editing ? 'Simpan' : 'Tambah Kategori' }}</AppButton>
        <AppButton v-if="editing" variant="ghost" type="button" @click="cancelEdit">Batal</AppButton>
      </div>
    </form>

    <div class="grid grid-4">
      <article v-for="category in categories" :key="category.id" class="card feature-card">
        <span class="feature-icon">{{ category.name.slice(0, 1).toUpperCase() }}</span>
        <div style="flex:1">
          <h3>{{ category.name }}</h3>
          <p>{{ productCount(category.id) }} produk</p>
          <div class="actions" style="margin-top:10px">
            <AppButton variant="secondary" @click="edit(category)">Edit</AppButton>
            <AppButton variant="danger" @click="remove(category.id)">Hapus</AppButton>
          </div>
        </div>
      </article>
    </div>
    <EmptyState v-if="categories.length === 0" title="Belum ada kategori" description="Tambahkan kategori agar katalog lebih rapi." icon="0" />
  </section>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { Category, Product } from '@/core/domain/entities';
import { saveCategory } from '@/application/usecases/category/SaveCategory';
import { repositories } from '@/infrastructure/supabase/repositories';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AppInput from '@/shared/components/AppInput.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop } = context;
const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const name = ref('');
const editing = ref<Category | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  if (!shop.value) return;
  [categories.value, products.value] = await Promise.all([
    repositories.categories.listByShop(shop.value.id),
    repositories.products.listByShop(shop.value.id),
  ]);
}

function productCount(categoryId: string) {
  return products.value.filter((product) => product.categoryId === categoryId).length;
}
function edit(category: Category) { editing.value = category; name.value = category.name; }
function cancelEdit() { editing.value = null; name.value = ''; }

async function submit() {
  if (!shop.value || !name.value.trim()) return;
  loading.value = true; error.value = null;
  try {
    await saveCategory(shop.value.id, name.value.trim(), editing.value || undefined);
    cancelEdit(); await load();
  } catch (err) { error.value = getErrorMessage(err); }
  finally { loading.value = false; }
}

async function remove(id: string) {
  if (!confirm('Hapus kategori ini? Produk yang memakai kategori ini akan menjadi tanpa kategori.')) return;
  await repositories.categories.remove(id); await load();
}

watch(shop, load, { immediate: true });
</script>
