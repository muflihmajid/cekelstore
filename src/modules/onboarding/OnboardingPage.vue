<template>
  <main class="onboarding-page">
    <section class="onboarding-shell">
      <div class="onboarding-copy">
        <RouterLink to="/admin" class="brand-row">
          <img src="/assets/cekel-store-icon.svg" alt="Cekel Store" class="brand-logo" />
          <div>
            <strong>Cekel Store</strong><br />
            <small>Setup toko pertama Anda</small>
          </div>
        </RouterLink>
        <span class="badge">3 langkah awal</span>
        <h1>Siapkan toko online yang langsung siap dibagikan.</h1>
        <p>Lengkapi identitas toko, pilih tema warna, lalu lanjut tambah produk pertama dari dashboard.</p>
        <div class="onboarding-steps">
          <span :class="{ 'is-active': step === 1 }">1. Informasi toko</span>
          <span :class="{ 'is-active': step === 2 }">2. Tampilan toko</span>
          <span :class="{ 'is-active': step === 3 }">3. Produk pertama</span>
        </div>
      </div>

      <form v-if="shop" class="card card-pad onboarding-card" @submit.prevent="submit">
        <AlertMessage :message="error" type="error" />
        <AlertMessage :message="success" type="success" />

        <section v-if="step === 1" class="grid">
          <h2>Informasi toko</h2>
          <AppInput v-model="form.name" label="Nama toko" placeholder="Dapur Cekel" />
          <AppInput v-model="form.slug" label="Slug toko" placeholder="dapur-cekel" />
          <AppInput v-model="form.whatsappNumber" label="Nomor WhatsApp" placeholder="62812xxxx" />
          <AppInput v-model="form.description" label="Deskripsi toko" textarea />
          <div class="grid grid-2">
            <AppInput v-model="form.address" label="Lokasi" placeholder="Jakarta" />
            <AppInput v-model="form.openingHours" label="Jam buka" placeholder="08.00 - 20.00" />
          </div>
        </section>

        <section v-else-if="step === 2" class="grid">
          <h2>Tampilan toko</h2>
          <div class="field">
            <span class="field__label">Logo toko</span>
            <input class="input" type="file" accept="image/*" @change="onLogoChange" />
          </div>
          <div class="grid grid-5">
            <button v-for="theme in themePresets" :key="theme.key" class="theme-card" :class="{ 'is-active': form.themeKey === theme.key }" type="button" @click="form.themeKey = theme.key">
              <div class="theme-swatches">
                <span class="swatch" :style="{ background: theme.primary }"></span>
                <span class="swatch" :style="{ background: theme.primaryDark }"></span>
                <span class="swatch" :style="{ background: theme.accent }"></span>
              </div>
              <strong>{{ theme.label }}</strong>
            </button>
          </div>
          <div class="store-cover" style="width:100%; margin:0; box-shadow:none">
            <div class="store-profile" style="padding:22px">
              <img :src="form.logoUrl || '/assets/cekel-store-icon.svg'" alt="Logo toko" class="store-avatar" />
              <div>
                <h1>{{ form.name || 'Nama Toko' }}</h1>
                <p>{{ form.description || 'Preview toko Anda akan tampil di sini.' }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="grid">
          <h2>Produk pertama</h2>
          <p class="muted-copy">Onboarding dasar sudah siap. Tambahkan produk pertama dari dashboard agar katalog bisa langsung dibagikan.</p>
          <div class="grid grid-3">
            <article class="feature-card">
              <span class="feature-icon">1</span>
              <div><h3>Tambah foto</h3><p>Upload produk utama yang paling sering dipesan.</p></div>
            </article>
            <article class="feature-card">
              <span class="feature-icon">2</span>
              <div><h3>Atur harga</h3><p>Harga tampil jelas di katalog publik.</p></div>
            </article>
            <article class="feature-card">
              <span class="feature-icon">3</span>
              <div><h3>Bagikan link</h3><p>Checkout pelanggan langsung menuju WhatsApp.</p></div>
            </article>
          </div>
        </section>

        <div class="onboarding-actions">
          <AppButton v-if="step > 1" type="button" variant="ghost" @click="step--">Kembali</AppButton>
          <AppButton v-if="step < 3" type="button" @click="step++">Lanjut</AppButton>
          <AppButton v-else :loading="loading">Simpan & Masuk Dashboard</AppButton>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Shop, ThemeKey } from '@/core/domain/entities';
import { getOrCreateMyShop } from '@/application/usecases/shop/GetOrCreateMyShop';
import { updateShopProfile } from '@/application/usecases/shop/UpdateShopProfile';
import { repositories } from '@/infrastructure/supabase/repositories';
import { themePresets, applyThemeVars } from '@/core/utils/themes';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AppInput from '@/shared/components/AppInput.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';

const router = useRouter();
const shop = ref<Shop | null>(null);
const step = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const logoFile = ref<File | null>(null);

const form = reactive({
  name: '',
  slug: '',
  whatsappNumber: '',
  description: '',
  logoUrl: '',
  address: '',
  openingHours: '',
  themeKey: 'blue-teal' as ThemeKey,
});

watch(() => form.themeKey, applyThemeVars);

function fillForm(value: Shop) {
  form.name = value.name;
  form.slug = value.slug;
  form.whatsappNumber = value.whatsappNumber;
  form.description = value.description || '';
  form.logoUrl = value.logoUrl || '';
  form.address = value.address || '';
  form.openingHours = value.openingHours || '';
  form.themeKey = value.themeKey;
}

function onLogoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  logoFile.value = target.files?.[0] || null;
  if (logoFile.value) form.logoUrl = URL.createObjectURL(logoFile.value);
}

async function submit() {
  if (!shop.value) return;
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    let logoUrl = form.logoUrl || null;
    if (logoFile.value) logoUrl = await repositories.storage.uploadShopLogo(shop.value.id, logoFile.value);
    await updateShopProfile(shop.value.id, {
      name: form.name,
      slug: form.slug,
      whatsappNumber: form.whatsappNumber,
      description: form.description,
      logoUrl,
      address: form.address,
      openingHours: form.openingHours,
      themeKey: form.themeKey,
      status: 'active',
    });
    success.value = 'Toko berhasil disiapkan.';
    await router.push('/admin');
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  shop.value = await getOrCreateMyShop();
  fillForm(shop.value);
});
</script>
