import { AppError } from '@/core/errors/AppError';
import type { CategoryRepository } from '@/core/domain/repositories';
import type { Category } from '@/core/domain/entities';
import { supabase } from '../client';
import { categoryToRow, mapCategory, type CategoryRow } from '../mappers';

export class SupabaseCategoryRepository implements CategoryRepository {
  async listByShop(shopId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', shopId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw new AppError('Gagal mengambil kategori.', error);
    return ((data || []) as CategoryRow[]).map(mapCategory);
  }

  async create(shopId: string, name: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ store_id: shopId, name, sort_order: 0 })
      .select('*')
      .single();

    if (error || !data) throw new AppError('Gagal membuat kategori.', error);
    return mapCategory(data);
  }

  async update(categoryId: string, payload: Partial<Category>): Promise<Category> {
    const row = categoryToRow(payload);
    const cleanRow = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

    const { data, error } = await supabase
      .from('categories')
      .update(cleanRow)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error || !data) throw new AppError('Gagal menyimpan kategori.', error);
    return mapCategory(data);
  }

  async remove(categoryId: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw new AppError('Gagal menghapus kategori.', error);
  }
}
