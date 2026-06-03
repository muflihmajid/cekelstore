create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  whatsapp_number text not null,
  business_category text,
  logo_url text,
  banner_url text,
  address text,
  opening_hours text,
  instagram_url text,
  tiktok_url text,
  marketplace_url text,
  theme_color text not null default 'blue-teal',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  status text not null default 'tersedia',
  stock int,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_status_check check (status in ('tersedia', 'habis', 'pre-order')),
  constraint products_price_check check (price >= 0),
  constraint products_stock_check check (stock is null or stock >= 0)
);

create table if not exists public.store_views (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  source text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_clicks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  total_amount numeric,
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.shops') is not null then
    insert into public.stores (
      id,
      owner_id,
      name,
      slug,
      description,
      whatsapp_number,
      logo_url,
      address,
      opening_hours,
      instagram_url,
      marketplace_url,
      theme_color,
      is_active,
      created_at,
      updated_at
    )
    select
      id,
      owner_id,
      name,
      slug,
      description,
      whatsapp_number,
      logo_url,
      address,
      opening_hours,
      instagram_url,
      marketplace_url,
      coalesce(theme_key, 'blue-teal'),
      coalesce(status, 'active') = 'active',
      created_at,
      coalesce(updated_at, created_at, now())
    from public.shops
    where owner_id is not null
    on conflict (id) do nothing;
  end if;

  alter table public.categories add column if not exists store_id uuid;
  alter table public.categories add column if not exists updated_at timestamptz not null default now();

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'shop_id'
  ) then
    update public.categories
    set store_id = shop_id
    where store_id is null;
  end if;

  alter table public.products add column if not exists store_id uuid;
  alter table public.products add column if not exists status text not null default 'tersedia';
  alter table public.products add column if not exists stock int;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'shop_id'
  ) then
    update public.products
    set store_id = shop_id
    where store_id is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'is_available'
  ) then
    update public.products
    set status = case when is_available then 'tersedia' else 'habis' end
    where status is null or status = 'tersedia';
  end if;
end;
$$;

create index if not exists stores_owner_idx on public.stores(owner_id);
create index if not exists stores_slug_active_idx on public.stores(slug, is_active);
create index if not exists categories_store_idx on public.categories(store_id, sort_order);
create index if not exists products_store_idx on public.products(store_id, sort_order);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists store_views_store_created_idx on public.store_views(store_id, created_at desc);
create index if not exists product_clicks_store_created_idx on public.product_clicks(store_id, created_at desc);
create index if not exists whatsapp_clicks_store_created_idx on public.whatsapp_clicks(store_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists stores_set_updated_at on public.stores;
create trigger stores_set_updated_at before update on public.stores
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_views enable row level security;
alter table public.product_clicks enable row level security;
alter table public.whatsapp_clicks enable row level security;

drop policy if exists "profiles_owner_select" on public.profiles;
drop policy if exists "profiles_owner_update" on public.profiles;
drop policy if exists "stores_owner_select" on public.stores;
drop policy if exists "stores_public_active_select" on public.stores;
drop policy if exists "stores_owner_insert" on public.stores;
drop policy if exists "stores_owner_update" on public.stores;
drop policy if exists "stores_owner_delete" on public.stores;
drop policy if exists "categories_owner_all" on public.categories;
drop policy if exists "categories_public_active_select" on public.categories;
drop policy if exists "products_owner_all" on public.products;
drop policy if exists "products_public_active_select" on public.products;
drop policy if exists "store_views_public_insert" on public.store_views;
drop policy if exists "store_views_owner_select" on public.store_views;
drop policy if exists "product_clicks_public_insert" on public.product_clicks;
drop policy if exists "product_clicks_owner_select" on public.product_clicks;
drop policy if exists "whatsapp_clicks_public_insert" on public.whatsapp_clicks;
drop policy if exists "whatsapp_clicks_owner_select" on public.whatsapp_clicks;
drop policy if exists "store_assets_public_read" on storage.objects;
drop policy if exists "store_assets_owner_write" on storage.objects;
drop policy if exists "product_images_owner_write" on storage.objects;
drop policy if exists "store_assets_owner_update_delete" on storage.objects;

create policy "profiles_owner_select" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_owner_update" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "stores_owner_select" on public.stores
for select using (auth.uid() = owner_id);

create policy "stores_public_active_select" on public.stores
for select using (is_active = true);

create policy "stores_owner_insert" on public.stores
for insert with check (auth.uid() = owner_id);

create policy "stores_owner_update" on public.stores
for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "stores_owner_delete" on public.stores
for delete using (auth.uid() = owner_id);

create policy "categories_owner_all" on public.categories
for all
using (exists (select 1 from public.stores s where s.id = categories.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = categories.store_id and s.owner_id = auth.uid()));

create policy "categories_public_active_select" on public.categories
for select using (exists (select 1 from public.stores s where s.id = categories.store_id and s.is_active = true));

create policy "products_owner_all" on public.products
for all
using (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()))
with check (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()));

create policy "products_public_active_select" on public.products
for select using (exists (select 1 from public.stores s where s.id = products.store_id and s.is_active = true));

create policy "store_views_public_insert" on public.store_views
for insert with check (exists (select 1 from public.stores s where s.id = store_views.store_id and s.is_active = true));

create policy "store_views_owner_select" on public.store_views
for select using (exists (select 1 from public.stores s where s.id = store_views.store_id and s.owner_id = auth.uid()));

create policy "product_clicks_public_insert" on public.product_clicks
for insert with check (exists (select 1 from public.stores s where s.id = product_clicks.store_id and s.is_active = true));

create policy "product_clicks_owner_select" on public.product_clicks
for select using (exists (select 1 from public.stores s where s.id = product_clicks.store_id and s.owner_id = auth.uid()));

create policy "whatsapp_clicks_public_insert" on public.whatsapp_clicks
for insert with check (exists (select 1 from public.stores s where s.id = whatsapp_clicks.store_id and s.is_active = true));

create policy "whatsapp_clicks_owner_select" on public.whatsapp_clicks
for select using (exists (select 1 from public.stores s where s.id = whatsapp_clicks.store_id and s.owner_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true), ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

create policy "store_assets_public_read" on storage.objects
for select using (bucket_id in ('store-assets', 'product-images'));

create policy "store_assets_owner_write" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'store-assets'
  and exists (
    select 1 from public.stores s
    where s.id::text = split_part(name, '/', 1)
    and s.owner_id = auth.uid()
  )
);

create policy "product_images_owner_write" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.stores s
    where s.id::text = split_part(name, '/', 1)
    and s.owner_id = auth.uid()
  )
);

create policy "store_assets_owner_update_delete" on storage.objects
for all to authenticated
using (
  bucket_id in ('store-assets', 'product-images')
  and exists (
    select 1 from public.stores s
    where s.id::text = split_part(name, '/', 1)
    and s.owner_id = auth.uid()
  )
);
