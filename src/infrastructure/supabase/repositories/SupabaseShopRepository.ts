import { AppError } from '@/core/errors/AppError';
import type { ShopRepository } from '@/core/domain/repositories';
import type { Shop } from '@/core/domain/entities';
import { makeSlug } from '@/core/utils/slug';
import { supabase } from '../client';
import { mapShop, shopToRow, type ShopRow } from '../mappers';

export class SupabaseShopRepository implements ShopRepository {
  async getCurrentUserId(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  }

  async ensureShopForOwner(ownerId: string): Promise<Shop> {
    const existing = await this.getMyShop(ownerId);
    if (existing) return existing;

    const fallbackSlug = `toko-${ownerId.slice(0, 8)}`;
    const { data, error } = await supabase
      .from('stores')
      .insert({
        owner_id: ownerId,
        slug: fallbackSlug,
        name: 'Toko Baru',
        description: 'Toko online ringan yang langsung terhubung ke WhatsApp.',
        whatsapp_number: '6281234567890',
        opening_hours: 'Buka setiap hari 08.00 - 20.00',
        theme_color: 'blue-teal',
        is_active: true,
      })
      .select('*')
      .single();

    if (error || !data) throw new AppError('Gagal membuat toko awal.', error);
    return mapShop(data);
  }

  async getMyShop(ownerId: string): Promise<Shop | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw new AppError('Gagal mengambil data toko.', error);
    return data ? mapShop(data) : null;
  }

  async getShopBySlug(slug: string): Promise<Shop | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', makeSlug(slug))
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new AppError('Gagal mengambil halaman toko.', error);
    return data ? mapShop(data) : null;
  }

  async updateShop(shopId: string, payload: Partial<Shop>): Promise<Shop> {
    const row = shopToRow(payload);
    const cleanRow = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

    const { data, error } = await supabase
      .from('stores')
      .update(cleanRow)
      .eq('id', shopId)
      .select('*')
      .single();

    if (error || !data) throw new AppError('Gagal menyimpan profil toko.', error);
    return mapShop(data);
  }
}
