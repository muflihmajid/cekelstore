<template>
  <section v-if="shop">
    <div class="admin-header">
      <div class="admin-title">
        <h1>Kelola Profil Toko</h1>
        <p>Atur identitas, WhatsApp, lokasi, jam buka, sosial media, dan tampilan toko.</p>
      </div>
    </div>

    <AlertMessage :message="error" type="error" />
    <AlertMessage :message="success" type="success" />

    <form class="grid grid-2" @submit.prevent="submit">
      <div class="card card-pad grid">
        <div class="actions">
          <span class="badge">Informasi Toko</span>
          <span class="badge badge--muted">Sosial Media</span>
          <span class="badge badge--muted">Lokasi & Jam</span>
        </div>
        <div class="grid grid-2">
          <div class="field">
            <span class="field__label">Logo Toko</span>
            <img v-if="form.logoUrl" :src="form.logoUrl" alt="Logo toko" class="brand-logo brand-logo--lg" />
            <input class="input" type="file" accept="image/*" @change="onLogoChange" />
          </div>
          <div class="field">
            <span class="field__label">Preview</span>
            <div class="round-logo" style="width:92px; height:92px; font-size:18px">{{ initials }}</div>
          </div>
        </div>
        <AppInput v-model="form.name" label="Nama toko" />
        <AppInput v-model="form.slug" label="Slug toko" placeholder="dapur-nona" />
        <AppInput v-model="form.description" label="Deskripsi toko" textarea />
        <AppInput v-model="form.whatsappNumber" label="Nomor WhatsApp" placeholder="62812xxxx" />
        <AppInput v-model="form.openingHours" label="Jam buka" placeholder="08.00 - 20.00" />
        <AppInput v-model="form.address" label="Alamat singkat" placeholder="Jakarta" />
      </div>

      <div class="grid">
        <div class="card card-pad grid">
          <h3 style="margin:0">Link Tambahan</h3>
          <AppInput v-model="form.instagramUrl" label="Link Instagram opsional" placeholder="https://instagram.com/..." />
          <AppInput v-model="form.websiteUrl" label="Link website opsional" placeholder="https://..." />
          <AppInput v-model="form.marketplaceUrl" label="Link marketplace opsional" placeholder="https://..." />
        </div>

        <div class="card card-pad">
          <h3 style="margin-top:0">Preview Toko (Live)</h3>
          <div class="store-cover" style="width:100%; margin:0; box-shadow:none">
            <div class="store-profile" style="padding:18px">
              <img :src="form.logoUrl || '/assets/cekel-store-icon.svg'" alt="Logo toko" class="store-avatar" style="width:76px; height:76px" />
              <div>
                <h1 style="font-size:22px">{{ form.name || 'Nama Toko' }}</h1>
                <p>{{ form.description || 'Deskripsi toko akan tampil di sini.' }}</p>
                <div class="actions" style="margin-top:10px">
                  <span class="badge">{{ form.openingHours || 'Jam buka' }}</span>
                  <span class="badge">{{ form.address || 'Lokasi' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-pad" style="grid-column: 1 / -1">
        <h3 style="margin-top:0">Tema Warna Toko</h3>
        <p style="color:var(--color-muted)">Pilih preset agar tampilan toko tetap rapi dan konsisten.</p>
        <div class="grid grid-5">
          <button v-for="theme in themePresets" :key="theme.key" class="theme-card" :class="{ 'is-active': form.themeKey === theme.key }" type="button" @click="form.themeKey = theme.key">
            <div class="theme-swatches">
              <span class="swatch" :style="{ background: theme.primary }"></span>
              <span class="swatch" :style="{ background: theme.primaryDark }"></span>
              <span class="swatch" :style="{ background: theme.accent }"></span>
            </div>
            <strong>{{ theme.label }}</strong>
            <p style="margin:6px 0 0; color:var(--color-muted); font-size:13px">{{ theme.description }}</p>
          </button>
        </div>
      </div>

      <div style="grid-column:1 / -1; display:flex; justify-content:flex-end">
        <AppButton :loading="loading">Simpan Perubahan</AppButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, watch } from 'vue';
import type { ThemeKey } from '@/core/domain/entities';
import { repositories } from '@/infrastructure/supabase/repositories';
import { updateShopProfile } from '@/application/usecases/shop/UpdateShopProfile';
import { themePresets, applyThemeVars } from '@/core/utils/themes';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AppInput from '@/shared/components/AppInput.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';
import { adminContextKey } from '../adminContext';

const context = inject(adminContextKey);
if (!context) throw new Error('Admin context missing');
const { shop, reloadShop } = context;
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const logoFile = ref<File | null>(null);

const form = reactive({
  name: '', slug: '', description: '', whatsappNumber: '', logoUrl: '', address: '', openingHours: '', instagramUrl: '', websiteUrl: '', marketplaceUrl: '', themeKey: 'blue-teal' as ThemeKey,
});

const initials = computed(() => (form.name || 'Toko').split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase());

watch(shop, (value) => {
  if (!value) return;
  form.name = value.name;
  form.slug = value.slug;
  form.description = value.description || '';
  form.whatsappNumber = value.whatsappNumber;
  form.logoUrl = value.logoUrl || '';
  form.address = value.address || '';
  form.openingHours = value.openingHours || '';
  form.instagramUrl = value.instagramUrl || '';
  form.websiteUrl = value.websiteUrl || '';
  form.marketplaceUrl = value.marketplaceUrl || '';
  form.themeKey = value.themeKey;
  applyThemeVars(value.themeKey);
}, { immediate: true });

function onLogoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  logoFile.value = target.files?.[0] || null;
  if (logoFile.value) form.logoUrl = URL.createObjectURL(logoFile.value);
}

async function submit() {
  if (!shop.value) return;
  loading.value = true; error.value = null; success.value = null;
  try {
    let logoUrl = form.logoUrl || null;
    if (logoFile.value) logoUrl = await repositories.storage.uploadShopLogo(shop.value.id, logoFile.value);
    await updateShopProfile(shop.value.id, {
      name: form.name,
      slug: form.slug,
      description: form.description,
      whatsappNumber: form.whatsappNumber,
      logoUrl,
      address: form.address,
      openingHours: form.openingHours,
      instagramUrl: form.instagramUrl,
      websiteUrl: form.websiteUrl,
      marketplaceUrl: form.marketplaceUrl,
      themeKey: form.themeKey,
      status: 'active',
    });
    await reloadShop();
    applyThemeVars(form.themeKey);
    success.value = 'Profil toko berhasil disimpan.';
  } catch (err) { error.value = getErrorMessage(err); }
  finally { loading.value = false; }
}
</script>
