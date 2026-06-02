import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/core/config/env';

if (!isSupabaseConfigured()) {
  console.warn('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.');
}

export const supabase = createClient(env.supabaseUrl || '', env.supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
