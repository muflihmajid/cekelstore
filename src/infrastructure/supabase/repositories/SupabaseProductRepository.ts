import { AppError } from '@/core/errors/AppError';
import type { ProductRepository } from '@/core/domain/repositories';
import type { Product } from '@/core/domain/entities';
import { supabase } from '../client';
import { mapProduct, productToRow, type ProductRow } from '../mappers';

function isMissingLegacyShopIdColumn(error: unknown) {
  const message = String((error as { message?: string })?.message || '');
  return message.includes('shop_id') && (message.includes('column') || message.includes('schema cache'));
}

export class SupabaseProductRepository implements ProductRepository {
  async listByShop(shopId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', shopId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Gagal mengambil produk.', error);
    return ((data || []) as ProductRow[]).map(mapProduct);
  }

  async create(shopId: string, payload: Omit<Partial<Product>, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const row = productToRow(payload);
    const cleanRow = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

    let { data, error } = await supabase
      .from('products')
      .insert({ store_id: shopId, shop_id: shopId, ...cleanRow })
      .select('*')
      .single();

    if (error && isMissingLegacyShopIdColumn(error)) {
      ({ data, error } = await supabase
        .from('products')
        .insert({ store_id: shopId, ...cleanRow })
        .select('*')
        .single());
    }

    if (error || !data) throw new AppError('Gagal membuat produk.', error);
    return mapProduct(data);
  }

  async update(productId: string, payload: Omit<Partial<Product>, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const row = productToRow(payload);
    const cleanRow = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

    const { data, error } = await supabase
      .from('products')
      .update(cleanRow)
      .eq('id', productId)
      .select('*')
      .single();

    if (error || !data) throw new AppError('Gagal menyimpan produk.', error);
    return mapProduct(data);
  }

  async remove(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new AppError('Gagal menghapus produk.', error);
  }
}
