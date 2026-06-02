<template>
  <main class="page" style="display:grid; place-items:center; padding: 28px">
    <section class="card card-pad" style="width:min(460px, 100%)">
      <div class="brand-row" style="margin-bottom:20px">
        <img src="/assets/cekel-store-icon.svg" alt="Cekel Store" class="brand-logo" />
        <div>
          <strong>Cekel Store Admin</strong><br />
          <small>Login atau daftar untuk mulai mengatur toko.</small>
        </div>
      </div>
      <AlertMessage :message="error" type="error" />
      <AlertMessage :message="success" type="success" />
      <form class="grid" style="margin-top: 16px" @submit.prevent="submit">
        <AppInput v-model="email" label="Email" type="email" placeholder="nama@email.com" />
        <AppInput v-model="password" label="Password" type="password" placeholder="Minimal 6 karakter" />
        <AppButton :loading="loading" block>{{ mode === 'login' ? 'Login' : 'Daftar' }}</AppButton>
      </form>
      <button class="category-chip" style="margin-top: 16px; width:100%" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login' }}
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/infrastructure/supabase/client';
import { getErrorMessage } from '@/core/errors/AppError';
import AppButton from '@/shared/components/AppButton.vue';
import AppInput from '@/shared/components/AppInput.vue';
import AlertMessage from '@/shared/components/AlertMessage.vue';

const router = useRouter();
const route = useRoute();
const email = ref('');
const password = ref('');
const mode = ref<'login' | 'register'>('login');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

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
      const { error: signUpError } = await supabase.auth.signUp({ email: email.value, password: password.value });
      if (signUpError) throw signUpError;
      success.value = 'Akun dibuat. Jika email confirmation aktif, cek email dulu. Kalau tidak, kamu bisa langsung login.';
      mode.value = 'login';
    }
  } catch (err) {
    error.value = getErrorMessage(err, 'Gagal memproses login.');
  } finally {
    loading.value = false;
  }
}
</script>
