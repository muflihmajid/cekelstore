# Cekel Store v1.0 — Vue TypeScript + Supabase

Cekel Store adalah toko online ringan untuk UMKM yang langsung checkout ke WhatsApp.
Project ini dibuat sebagai **v1.0 Gratis Beta / MVP** dengan arsitektur yang lebih rapi agar mudah dikembangkan ke v1.1, v1.2, dan integrasi Kasir Ringan.

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

## Fitur v1.0

- Halaman toko publik `/toko/:slug`
- Profil toko: nama, logo, deskripsi, WhatsApp, jam buka, alamat, link sosial opsional
- Katalog produk
- Kategori produk
- Search produk
- Keranjang belanja
- Checkout WhatsApp otomatis
- Admin produk: tambah, edit, hapus, upload foto, harga, kategori, status tersedia/habis
- Admin kategori
- Tema warna toko: Blue Teal, Aqua Soft, Ocean Blue, Warm Clay, Slate Premium
- QR Code toko
- Statistik dasar: kunjungan, klik WhatsApp, produk paling sering diklik
- Branding gratis: “Dibuat dengan Cekel Works”
- Halaman spesifikasi `/spesifikasi-v1`

## Struktur Clean Architecture Ringan

```txt
src/
  app/                         # App root dan router
  core/                        # Domain entity, repository contract, config, utils, errors
  application/usecases/         # Use case bisnis
  infrastructure/supabase/      # Implementasi Supabase repository + storage
  modules/                      # Feature modules: landing, auth, admin, storefront, specification
  shared/                       # Shared components dan composables
  styles/                       # Global CSS
supabase/migrations/            # SQL schema, RLS, bucket, seed demo
public/assets/                  # Logo dan asset publik
```

Prinsipnya: UI tidak langsung penuh dengan query Supabase. Query Supabase berada di `infrastructure`, lalu dipanggil lewat use case di `application`.

## Cara Menjalankan Lokal

```bash
npm install
cp .env.example .env
npm run dev
```

Isi `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

## Setup Supabase

1. Buat project Supabase.
2. Buka SQL Editor.
3. Jalankan file:

```txt
supabase/migrations/001_initial_schema.sql
```

4. Pastikan Auth Email/Password aktif.
5. Jalankan app lokal.
6. Buka `/admin`, daftar akun, lalu login.

## Route Penting

- `/` — landing page
- `/login` — login/register admin
- `/admin` — dashboard admin
- `/admin/profil` — edit profil toko
- `/admin/produk` — kelola produk
- `/admin/kategori` — kelola kategori
- `/admin/statistik` — statistik dasar
- `/admin/checklist-v1` — checklist fitur MVP
- `/spesifikasi-v1` — dokumen fitur v1.0
- `/toko/:slug` — halaman toko publik

## Demo Seed

Migration membuat toko demo:

```txt
/toko/demo-dapur-nona
```

Jika memakai Supabase baru dan SQL berhasil dijalankan, route demo tersebut langsung bisa dibuka.

## Deployment ke Vercel

1. Push ke GitHub.
2. Import project ke Vercel.
3. Tambahkan environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PUBLIC_SITE_URL`
4. Deploy.

`vercel.json` sudah disiapkan untuk SPA rewrite.

## Catatan Pengembangan Berikutnya

v1.1 yang disarankan:

- Form data pelanggan sebelum checkout
- Draft order tersimpan
- Status order sederhana
- Payment manual: transfer bank, QRIS toko, COD
- Tombol kirim bukti bayar ke WhatsApp
- Customer list sederhana

v1.2:

- Banner promo
- Produk unggulan
- Harga coret
- Voucher sederhana
- Link promo
- Export order
- Stok opsional
