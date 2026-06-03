import { AppError } from '@/core/errors/AppError';
import type { AnalyticsRepository } from '@/core/domain/repositories';
import type { AnalyticsEventType, StoreStats } from '@/core/domain/entities';
import { supabase } from '../client';

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  async track(shopId: string, type: AnalyticsEventType, productId: string | null = null): Promise<void> {
    let error: unknown = null;
    if (type === 'visit') {
      ({ error } = await supabase.from('store_views').insert({ store_id: shopId, source: document.referrer || null, user_agent: navigator.userAgent }));
    } else if (type === 'product_click') {
      ({ error } = await supabase.from('product_clicks').insert({ store_id: shopId, product_id: productId }));
    } else {
      ({ error } = await supabase.from('whatsapp_clicks').insert({ store_id: shopId, product_id: productId }));
    }

    if (error) {
      console.warn('Gagal mencatat analytics event.', error);
    }
  }

  async getStats(shopId: string): Promise<StoreStats> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [views, checkoutClicks, productClicks] = await Promise.all([
      supabase.from('store_views').select('id', { count: 'exact', head: true }).eq('store_id', shopId).gte('created_at', since),
      supabase.from('whatsapp_clicks').select('id', { count: 'exact', head: true }).eq('store_id', shopId).gte('created_at', since),
      supabase.from('product_clicks').select('product_id, products(name)').eq('store_id', shopId).gte('created_at', since),
    ]);

    if (views.error || checkoutClicks.error || productClicks.error) {
      throw new AppError('Gagal mengambil statistik.', views.error || checkoutClicks.error || productClicks.error);
    }

    const grouped = new Map<string, { productId: string; productName: string; clicks: number }>();
    ((productClicks.data || []) as Array<{ product_id: string | null; products?: { name?: string } | null }>)
      .filter((row) => row.product_id)
      .forEach((row) => {
        const productId = row.product_id as string;
        const current = grouped.get(productId) || { productId, productName: row.products?.name || 'Produk', clicks: 0 };
        current.clicks += 1;
        grouped.set(productId, current);
      });

    return {
      visits: views.count || 0,
      checkoutClicks: checkoutClicks.count || 0,
      productClicks: productClicks.data?.length || 0,
      popularProducts: [...grouped.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    };
  }
}
