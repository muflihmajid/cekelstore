import type { Category, Product, Shop, StoreStats, ThemeKey } from '@/core/domain/entities';

export type ShopRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  business_category?: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  address: string | null;
  opening_hours: string | null;
  instagram_url: string | null;
  tiktok_url?: string | null;
  marketplace_url: string | null;
  theme_color?: string | null;
  theme_key?: ThemeKey | null;
  is_active?: boolean | null;
  status?: 'draft' | 'active' | 'disabled' | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ProductRow = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: 'tersedia' | 'habis' | 'pre-order';
  stock: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function mapShop(row: ShopRow): Shop {
  return {
    id: row.id,
    ownerId: row.owner_id || '',
    slug: row.slug,
    name: row.name,
    description: row.description,
    whatsappNumber: row.whatsapp_number,
    logoUrl: row.logo_url,
    address: row.address,
    openingHours: row.opening_hours,
    instagramUrl: row.instagram_url,
    websiteUrl: row.tiktok_url || null,
    marketplaceUrl: row.marketplace_url,
    themeKey: (row.theme_key || row.theme_color || 'blue-teal') as ThemeKey,
    status: row.status || (row.is_active === false ? 'disabled' : 'active'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function shopToRow(payload: Partial<Shop>) {
  return {
    slug: payload.slug,
    name: payload.name,
    description: payload.description,
    whatsapp_number: payload.whatsappNumber,
    logo_url: payload.logoUrl,
    address: payload.address,
    opening_hours: payload.openingHours,
    instagram_url: payload.instagramUrl,
    tiktok_url: payload.websiteUrl,
    marketplace_url: payload.marketplaceUrl,
    theme_color: payload.themeKey,
    is_active: payload.status ? payload.status === 'active' : undefined,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    shopId: row.store_id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function categoryToRow(payload: Partial<Category>) {
  return {
    name: payload.name,
    sort_order: payload.sortOrder,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    shopId: row.store_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    status: row.status,
    stock: row.stock,
    isAvailable: row.status !== 'habis',
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productToRow(payload: Partial<Product>) {
  return {
    category_id: payload.categoryId,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    image_url: payload.imageUrl,
    status: payload.status || (payload.isAvailable === undefined ? undefined : (payload.isAvailable ? 'tersedia' : 'habis')),
    stock: payload.stock,
    sort_order: payload.sortOrder,
  };
}

export function mapStats(visits: number, checkoutClicks: number, productClicks: number, popularProducts: StoreStats['popularProducts']): StoreStats {
  return { visits, checkoutClicks, productClicks, popularProducts };
}
