import type { StoreStats } from '@/core/domain/entities';
import { repositories } from '@/infrastructure/supabase/repositories';

export async function getStoreStats(shopId: string): Promise<StoreStats> {
  return repositories.analytics.getStats(shopId);
}
