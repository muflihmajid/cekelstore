<template>
  <main class="auth-page">
    <div class="auth-dot-grid" aria-hidden="true"></div>

    <section class="auth-left">
      <div class="auth-brand-line">
        <span class="auth-brand-mark"><ShoppingBag :size="28" stroke-width="2.6" /></span>
        <strong>Cekel Store</strong>
        <span class="auth-beta-badge">Gratis saat beta</span>
      </div>

      <div class="auth-copy-block">
        <h1>Toko online ringan untuk UMKM Indonesia yang langsung terhubung ke WhatsApp.</h1>
        <p>Kelola produk, bagikan toko, dan terima pesanan lebih rapi dari satu tempat.</p>
      </div>

      <div class="auth-feature-row">
        <article v-for="feature in features" :key="feature.title">
          <span class="auth-svg-bubble"><component :is="feature.icon" :size="30" stroke-width="2.2" /></span>
          <strong>{{ feature.title }}</strong>
          <p>{{ feature.text }}</p>
        </article>
      </div>

      <img src="/assets/auth-plant.svg" alt="" class="auth-left-plant" aria-hidden="true" />

    </section>

    <section class="auth-right">
      <div class="auth-mint-blob" aria-hidden="true"></div>

      <div class="auth-form-card">
        <div class="auth-tabs">
          <button type="button" :class="{ 'is-active': mode === 'login' }" @click="mode = 'login'">Login</button>
          <button type="button" :class="{ 'is-active': mode === 'register' }" @click="mode = 'register'">Daftar</button>
        </div>

        <AlertMessage :message="error" type="error" />
        <AlertMessage :message="success" type="success" />

        <form class="auth-form" @submit.prevent="submit">
          <label v-if="mode === 'register'" class="auth-field">
            <span>Nama Toko</span>
            <div>
              <Store :size="18" stroke-width="2" aria-hidden="true" />
              <input v-model="storeName" type="text" placeholder="Dapur Bu Sari" autocomplete="organization" />
            </div>
          </label>

          <label class="auth-field">
            <span>Email</span>
            <div>
              <Mail :size="18" stroke-width="2" aria-hidden="true" />
              <input v-model="email" type="email" placeholder="contoh@email.com" autocomplete="email" />
            </div>
          </label>

          <label class="auth-field">
            <span>Password</span>
            <div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="auth-password-toggle"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? Eye : EyeOff" :size="17" stroke-width="2" aria-hidden="true" />
              </button>
            </div>
          </label>

          <div class="auth-options">
            <span></span>
            <button type="button">Lupa password?</button>
          </div>

          <AppButton :loading="loading" block>
            {{ mode === 'login' ? 'Masuk' : 'Daftar Gratis' }}
          </AppButton>
        </form>

        <p class="auth-helper">
          {{ mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?' }}
          <button type="button" @click="toggleMode">
            {{ mode === 'login' ? 'Daftar gratis' : 'Masuk' }}
          </button>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Eye, EyeOff, Leaf, Mail, MessageCircle, QrCode, Settings, ShieldCheck, ShoppingBag, Store } from '@lucide/vue';
import { supabase } from '@/infrastructure/supabase/client';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';

const router = useRouter();
const route = useRoute();
const email = ref('');
const password = ref('');
const storeName = ref('');
const mode = ref<'login' | 'register'>(route.name === 'register' ? 'register' : 'login');
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const features = [
  { title: 'Ringan & Mudah', text: 'Buat toko gratis, kelola produk dari super gampang.', icon: Leaf },
  { title: 'Checkout WhatsApp', text: 'Pelanggan pesan, langsung terhubung ke WhatsApp kamu.', icon: MessageCircle },
  { title: 'Aman & Terpercaya', text: 'Data toko kamu aman dengan sistem terpercaya.', icon: ShieldCheck },
];

watch(() => route.name, (name) => {
  mode.value = name === 'register' ? 'register' : 'login';
});

async function toggleMode() {
  await router.push({ name: mode.value === 'login' ? 'register' : 'login' });
}

async function submit() {
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    if (mode.value === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
      if (signInError) throw signInError;
      await router.push((route.query.redirect as string) || '/admin');
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: { data: { store_name: storeName.value } },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        await router.push('/onboarding');
        return;
      }
      success.value = 'Akun dibuat. Jika email confirmation aktif, cek email dulu. Jika tidak, Anda bisa langsung login.';
      mode.value = 'login';
      await router.push('/login');
    }
  } catch (err) {
    error.value = getErrorMessage(err, 'Gagal memproses login.');
  } finally {
    loading.value = false;
  }
}
</script>
