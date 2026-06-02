<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <RouterLink to="/" class="brand-row">
        <img src="/assets/cekel-store-icon.svg" alt="Cekel Store" class="brand-logo" />
        <div>
          <strong>Cekel Store</strong><br />
          <small>by Cekel Works</small>
        </div>
      </RouterLink>
      <nav class="sidebar-nav">
        <RouterLink to="/admin"><span class="sidebar-icon">D</span>Dashboard</RouterLink>
        <RouterLink to="/admin/profil"><span class="sidebar-icon">P</span>Profil Toko</RouterLink>
        <RouterLink to="/admin/produk"><span class="sidebar-icon">B</span>Produk</RouterLink>
        <RouterLink to="/admin/kategori"><span class="sidebar-icon">K</span>Kategori</RouterLink>
        <RouterLink to="/admin/statistik"><span class="sidebar-icon">S</span>Statistik</RouterLink>
      </nav>
      <div style="margin-top:auto" class="grid">
        <div v-if="shop" style="display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.84)">
          <img :src="shop.logoUrl || '/assets/cekel-store-icon.svg'" alt="Logo toko" class="brand-logo" />
          <div>
            <strong>{{ shop.name }}</strong><br />
            <small>Pemilik Toko</small>
          </div>
        </div>
        <RouterLink v-if="shop" :to="`/toko/${shop.slug}`" target="_blank"><AppButton variant="secondary" block>Lihat Toko</AppButton></RouterLink>
        <AppButton variant="ghost" block @click="logout">Logout</AppButton>
      </div>
    </aside>

    <main class="admin-main">
      <div v-if="loading" class="card card-pad">Menyiapkan toko...</div>
      <AlertMessage v-else-if="error" :message="error" type="error" />
      <RouterView v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Shop } from '@/core/domain/entities';
import { getOrCreateMyShop } from '@/application/usecases/shop/GetOrCreateMyShop';
import { supabase } from '@/infrastructure/supabase/client';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import { adminContextKey } from './adminContext';

const router = useRouter();
const shop = ref<Shop | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function reloadShop() {
  shop.value = await getOrCreateMyShop();
}

async function bootstrap() {
  loading.value = true;
  try {
    await reloadShop();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function logout() {
  await supabase.auth.signOut();
  await router.push('/login');
}

provide(adminContextKey, { shop, reloadShop });
onMounted(bootstrap);
</script>
