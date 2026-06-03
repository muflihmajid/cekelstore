import { AppError } from '@/core/errors/AppError';
import { supabase } from '../client';

function safeFileName(file: File): string {
  const ext = file.name.split('.').pop() || 'jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext.toLowerCase()}`;
}

export class SupabaseFileStorage {
  async uploadShopLogo(shopId: string, file: File): Promise<string> {
    return this.upload('store-assets', `${shopId}/logos/${safeFileName(file)}`, file);
  }

  async uploadProductImage(shopId: string, file: File): Promise<string> {
    return this.upload('product-images', `${shopId}/products/${safeFileName(file)}`, file);
  }

  private async upload(bucket: string, path: string, file: File): Promise<string> {
    if (file.size > 2 * 1024 * 1024) throw new AppError('Ukuran gambar maksimal 2MB.');
    if (!file.type.startsWith('image/')) throw new AppError('File harus berupa gambar.');

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, cacheControl: '3600' });
    if (error) throw new AppError('Gagal upload gambar.', error);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
