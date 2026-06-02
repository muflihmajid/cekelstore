-- Cekel Store v1.0 - Supabase schema
-- Jalankan di Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1. Tables
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  whatsapp_number text not null,
  logo_url text,
  address text,
  opening_hours text,
  instagram_url text,
  website_url text,
  marketplace_url text,
  theme_key text not null default 'blue-teal' check (theme_key in ('blue-teal','aqua-soft','ocean-blue','warm-clay','slate-premium')),
  status text not null default 'active' check (status in ('draft','active','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (shop_id, name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid null references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(14,2) not null default 0 check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  event_type text not null check (event_type in ('visit','checkout_click','product_click')),
  created_at timestamptz not null default now()
);

create index if not exists idx_shops_slug on public.shops(slug);
create index if not exists idx_categories_shop_id on public.categories(shop_id);
create index if not exists idx_products_shop_id on public.products(shop_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_analytics_shop_id_created_at on public.analytics_events(shop_id, created_at desc);

-- 2. updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_shops_updated_at on public.shops;
create trigger trg_shops_updated_at before update on public.shops for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();

-- 3. RLS
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.analytics_events enable row level security;


-- Drop old policies so this migration can be re-run safely in development.
drop policy if exists "Public can read active shops" on public.shops;
drop policy if exists "Public can read categories of active shops" on public.categories;
drop policy if exists "Public can read products of active shops" on public.products;
drop policy if exists "Owners can read own shops" on public.shops;
drop policy if exists "Owners can create own shops" on public.shops;
drop policy if exists "Owners can update own shops" on public.shops;
drop policy if exists "Owners can delete own shops" on public.shops;
drop policy if exists "Owners can manage own categories" on public.categories;
drop policy if exists "Owners can manage own products" on public.products;
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
drop policy if exists "Owners can read own analytics" on public.analytics_events;
drop policy if exists "Public can read store assets" on storage.objects;
drop policy if exists "Authenticated users can upload store assets" on storage.objects;
drop policy if exists "Authenticated users can update store assets" on storage.objects;
drop policy if exists "Authenticated users can delete store assets" on storage.objects;

-- Public read for active storefront
create policy "Public can read active shops" on public.shops for select using (status = 'active');
create policy "Public can read categories of active shops" on public.categories for select using (
  exists (select 1 from public.shops s where s.id = categories.shop_id and s.status = 'active')
);
create policy "Public can read products of active shops" on public.products for select using (
  exists (select 1 from public.shops s where s.id = products.shop_id and s.status = 'active')
);

-- Owner CRUD
create policy "Owners can read own shops" on public.shops for select using (owner_id = auth.uid());
create policy "Owners can create own shops" on public.shops for insert with check (owner_id = auth.uid());
create policy "Owners can update own shops" on public.shops for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can delete own shops" on public.shops for delete using (owner_id = auth.uid());

create policy "Owners can manage own categories" on public.categories for all using (
  exists (select 1 from public.shops s where s.id = categories.shop_id and s.owner_id = auth.uid())
) with check (
  exists (select 1 from public.shops s where s.id = categories.shop_id and s.owner_id = auth.uid())
);

create policy "Owners can manage own products" on public.products for all using (
  exists (select 1 from public.shops s where s.id = products.shop_id and s.owner_id = auth.uid())
) with check (
  exists (select 1 from public.shops s where s.id = products.shop_id and s.owner_id = auth.uid())
);

-- Analytics: public can insert lightweight events, owners can read own stats.
create policy "Anyone can insert analytics events" on public.analytics_events for insert with check (
  exists (select 1 from public.shops s where s.id = analytics_events.shop_id and s.status = 'active')
);
create policy "Owners can read own analytics" on public.analytics_events for select using (
  exists (select 1 from public.shops s where s.id = analytics_events.shop_id and s.owner_id = auth.uid())
);

-- 4. Storage bucket and policies
insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do update set public = true;

create policy "Public can read store assets" on storage.objects for select using (bucket_id = 'store-assets');
create policy "Authenticated users can upload store assets" on storage.objects for insert to authenticated with check (bucket_id = 'store-assets');
create policy "Authenticated users can update store assets" on storage.objects for update to authenticated using (bucket_id = 'store-assets') with check (bucket_id = 'store-assets');
create policy "Authenticated users can delete store assets" on storage.objects for delete to authenticated using (bucket_id = 'store-assets');

-- 5. Demo seed for /toko/demo-dapur-nona
insert into public.shops (id, owner_id, slug, name, description, whatsapp_number, logo_url, address, opening_hours, theme_key, status)
values ('00000000-0000-0000-0000-000000000101', null, 'demo-dapur-nona', 'Dapur Nona', 'Aneka kue rumahan dan camilan lezat. Contoh toko demo Cekel Store.', '6281234567890', null, 'Yogyakarta', 'Buka setiap hari 08.00 - 20.00', 'blue-teal', 'active')
on conflict (slug) do nothing;

insert into public.categories (id, shop_id, name, sort_order) values
('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000101','Kue Kering',1),
('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000101','Camilan',2),
('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000101','Paket Hampers',3)
on conflict (id) do nothing;

insert into public.products (shop_id, category_id, name, description, price, image_url, is_available, sort_order) values
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000201','Kue Nastar','Toples 500gr, cocok untuk hampers.',55000,null,true,1),
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000201','Choco Cookies','Cookies cokelat renyah.',45000,null,true,2),
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000202','Keripik Pisang','Camilan pisang manis gurih.',30000,null,true,3),
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000203','Paket Hampers Spesial','Paket hadiah isi kue rumahan.',125000,null,true,4)
on conflict do nothing;
