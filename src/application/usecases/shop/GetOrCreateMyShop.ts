import type { Shop } from '@/core/domain/entities';
import { AppError } from '@/core/errors/AppError';
import { repositories } from '@/infrastructure/supabase/repositories';

export async function getOrCreateMyShop(): Promise<Shop> {
  const userId = await repositories.shops.getCurrentUserId();
  if (!userId) throw new AppError('Silakan login terlebih dahulu.');
  return repositories.shops.ensureShopForOwner(userId);
}
