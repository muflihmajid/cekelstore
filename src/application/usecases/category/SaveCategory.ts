import type { Category } from '@/core/domain/entities';
import { repositories } from '@/infrastructure/supabase/repositories';

export async function saveCategory(shopId: string, name: string, category?: Category): Promise<Category> {
  if (category) return repositories.categories.update(category.id, { name });
  return repositories.categories.create(shopId, name);
}
