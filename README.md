# Cekel Store

Cekel Store adalah aplikasi toko online ringan untuk UMKM Indonesia. User bisa daftar, membuat toko, mengelola produk, membagikan link/QR toko, lalu pelanggan checkout langsung ke WhatsApp.

Project ini fokus pada aplikasi utama, bukan landing page marketing.

## Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase RLS
- QR Code generator

## Cara Install

```bash
npm install
cp .env.example .env
npm run dev
```

Isi `.env` dengan kredensial Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Setup Supabase

1. Buat project di Supabase.
2. Aktifkan Auth Email/Password.
3. Buka SQL Editor.
4. Jalankan migration:

```txt
supabase/migrations/202606030001_app_schema_rls.sql
```

5. Pastikan bucket Storage berikut ada dan public:

```txt
store-assets
product-images
```

Migration sudah mencoba membuat bucket dan policy otomatis. Jika environment Supabase membatasi perubahan storage lewat SQL, buat bucket manual dari dashboard Supabase lalu jalankan ulang policy yang diperlukan.

## Environment Variables

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Route Tersedia

- `/login` - login admin toko
- `/register` - daftar akun dan toko
- `/onboarding` - setup toko awal
- `/admin` - dashboard admin
- `/admin/profil` - profil toko
- `/admin/produk` - kelola produk
- `/admin/kategori` - kelola kategori
- `/admin/statistik` - statistik dasar
- `/admin/qr` - QR dan share link toko
- `/admin/tema` - tema tampilan toko
- `/toko/:slug` - toko publik

Route `/` diarahkan ke `/login` karena landing page marketing tidak menjadi fokus app ini.

## Fitur

- Register/login dengan Supabase Auth
- Onboarding toko
- Dashboard admin dengan statistik dasar
- CRUD profil toko, kategori, dan produk
- Upload logo toko dan gambar produk ke Supabase Storage
- Tema toko
- QR toko, copy link, download QR, share WhatsApp
- Public storefront berdasarkan slug
- Keranjang client-side
- Checkout WhatsApp dengan pesan otomatis
- Analytics dasar: kunjungan toko, klik produk, klik WhatsApp
- RLS policy untuk melindungi data tiap owner

## Struktur Project

```txt
src/
  app/
    router/
  core/
    domain/
    errors/
    utils/
  application/
    usecases/
  infrastructure/
    supabase/
      repositories/
      storage/
  modules/
    auth/
    onboarding/
    admin/
    storefront/
  shared/
    components/
    composables/
  styles/
supabase/
  migrations/
```

## Catatan

Cart boleh disimpan di client karena cart bukan backend utama. Data toko, produk, kategori, auth, storage, dan analytics tetap menggunakan Supabase.
