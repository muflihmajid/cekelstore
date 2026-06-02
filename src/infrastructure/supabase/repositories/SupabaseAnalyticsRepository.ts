import { AppError } from '@/core/errors/AppError';
import type { AnalyticsRepository } from '@/core/domain/repositories';
import type { AnalyticsEventType, StoreStats } from '@/core/domain/entities';
import { supabase } from '../client';

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  async track(shopId: string, type: AnalyticsEventType, productId: string | null = null): Promise<void> {
    const { error } = await supabase.from('analytics_events').insert({
      shop_id: shopId,
      event_type: type,
      product_id: productId,
    });

    if (error) {
      console.warn('Gagal mencatat analytics event.', error.message);
    }
  }

  async getStats(shopId: string): Promise<StoreStats> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, product_id, products(name)')
      .eq('shop_id', shopId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw new AppError('Gagal mengambil statistik.', error);

    const rows = (data || []) as Array<{ event_type: AnalyticsEventType; product_id: string | null; products?: { name?: string } | null }>;
    const visits = rows.filter((row) => row.event_type === 'visit').length;
    const checkoutClicks = rows.filter((row) => row.event_type === 'checkout_click').length;
    const productClicks = rows.filter((row) => row.event_type === 'product_click').length;

    const grouped = new Map<string, { productId: string; productName: string; clicks: number }>();
    rows
      .filter((row) => row.event_type === 'product_click' && row.product_id)
      .forEach((row) => {
        const productId = row.product_id as string;
        const current = grouped.get(productId) || { productId, productName: row.products?.name || 'Produk', clicks: 0 };
        current.clicks += 1;
        grouped.set(productId, current);
      });

    return {
      visits,
      checkoutClicks,
      productClicks,
      popularProducts: [...grouped.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    };
  }
}
