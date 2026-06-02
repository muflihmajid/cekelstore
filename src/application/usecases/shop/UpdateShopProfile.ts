import type { Shop } from '@/core/domain/entities';
import { makeSlug } from '@/core/utils/slug';
import { repositories } from '@/infrastructure/supabase/repositories';

export async function updateShopProfile(shopId: string, payload: Partial<Shop>): Promise<Shop> {
  const cleanPayload = { ...payload };
  if (cleanPayload.slug) cleanPayload.slug = makeSlug(cleanPayload.slug);
  return repositories.shops.updateShop(shopId, cleanPayload);
}
