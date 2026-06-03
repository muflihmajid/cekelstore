<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Tema & Tampilan Toko</h1>
        <p>Pilih gaya warna yang cocok dengan brand toko dan preview langsung sebelum disimpan.</p>
      </div>
      <AppButton :loading="loading" @click="submit">Simpan Tema</AppButton>
    </div>

    <AlertMessage :message="error" type="error" />
    <AlertMessage :message="success" type="success" />

    <div class="grid grid-2">
      <div class="card card-pad grid">
        <h3 style="margin:0">Pilih Tema</h3>
        <button v-for="theme in themePresets" :key="theme.key" class="theme-card theme-card--wide" :class="{ 'is-active': selectedTheme === theme.key }" type="button" @click="selectTheme(theme.key)">
          <div class="theme-swatches">
            <span class="swatch" :style="{ background: theme.primary }"></span>
            <span class="swatch" :style="{ background: theme.primaryDark }"></span>
            <span class="swatch" :style="{ background: theme.accent }"></span>
            <span class="swatch" :style="{ background: theme.surface }"></span>
          </div>
          <div>
            <strong>{{ theme.label }}</strong>
            <p>{{ theme.description }}</p>
          </div>
        </button>
      </div>

      <div class="card card-pad grid">
        <h3 style="margin:0">Preview Toko</h3>
        <div class="store-cover" style="width:100%; margin:0; box-shadow:none">
          <div class="store-profile" style="padding:24px">
            <img :src="shop.logoUrl || '/assets/cekel-store-icon.svg'" alt="Logo toko" class="store-avatar" />
            <div>
              <h1>{{ shop.name }}</h1>
              <p>{{ shop.description || 'Deskripsi toko akan tampil di sini.' }}</p>
              <div class="actions" style="margin-top:12px">
                <span class="badge">{{ shop.openingHours || 'Jam buka' }}</span>
                <span class="badge">{{ shop.address || 'Lokasi' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="preview-products">
          <article>
            <div class="preview-photo"></div>
            <strong>Produk Favorit</strong>
            <span>Rp 60.000</span>
          </article>
          <article>
            <div class="preview-photo preview-photo--2"></div>
            <strong>Paket Hemat</strong>
            <span>Rp 120.000</span>
          </article>
          <article>
            <div class="preview-photo preview-photo--3"></div>
            <strong>Menu Baru</strong>
            <span>Rp 45.000</span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { ThemeKey } from '@/core/domain/entities';
import { updateShopProfile } from '@/application/usecases/shop/UpdateShopProfile';
import { themePresets, applyThemeVars } from '@/core/utils/themes';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop, reloadShop } = context;
const selectedTheme = ref<ThemeKey>('blue-teal');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

watch(shop, (value) => {
  if (!value) return;
  selectedTheme.value = value.themeKey;
  applyThemeVars(value.themeKey);
}, { immediate: true });

function selectTheme(theme: ThemeKey) {
  selectedTheme.value = theme;
  applyThemeVars(theme);
}

async function submit() {
  if (!shop.value) return;
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    await updateShopProfile(shop.value.id, { themeKey: selectedTheme.value });
    await reloadShop();
    success.value = 'Tema toko berhasil disimpan.';
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>
