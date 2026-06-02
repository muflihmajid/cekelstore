import { AppError } from '@/core/errors/AppError';
import { supabase } from '../client';

function safeFileName(file: File): string {
  const ext = file.name.split('.').pop() || 'jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext.toLowerCase()}`;
}

export class SupabaseFileStorage {
  private bucket = 'store-assets';

  async uploadShopLogo(shopId: string, file: File): Promise<string> {
    return this.upload(`${shopId}/logos/${safeFileName(file)}`, file);
  }

  async uploadProductImage(shopId: string, file: File): Promise<string> {
    return this.upload(`${shopId}/products/${safeFileName(file)}`, file);
  }

  private async upload(path: string, file: File): Promise<string> {
    const { error } = await supabase.storage.from(this.bucket).upload(path, file, { upsert: false, cacheControl: '3600' });
    if (error) throw new AppError('Gagal upload gambar.', error);

    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
