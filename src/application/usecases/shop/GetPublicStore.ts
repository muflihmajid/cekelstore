import type { Category, Product, Shop } from '@/core/domain/entities';
import { repositories } from '@/infrastructure/supabase/repositories';

export interface PublicStoreData {
  shop: Shop;
  categories: Category[];
  products: Product[];
}

export async function getPublicStore(slug: string): Promise<PublicStoreData | null> {
  const shop = await repositories.shops.getShopBySlug(slug);
  if (!shop) return null;
  const [categories, products] = await Promise.all([
    repositories.categories.listByShop(shop.id),
    repositories.products.listByShop(shop.id),
    repositories.analytics.track(shop.id, 'visit'),
  ]);
  return { shop, categories, products };
}
