import { AppError } from '@/core/errors/AppError';
import type { AnalyticsRepository } from '@/core/domain/repositories';
import type { AnalyticsEventType, StoreStats } from '@/core/domain/entities';
import { supabase } from '../client';

type AnalyticsRow = {
  created_at: string;
};

type ProductClickRow = AnalyticsRow & {
  product_id: string | null;
  products?: { name?: string } | null;
};

const SERIES_DAYS = 30;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDailySeries(views: AnalyticsRow[], checkoutClicks: AnalyticsRow[], productClicks: AnalyticsRow[]): StoreStats['dailySeries'] {
  const formatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' });
  const today = new Date();
  const days = new Map<string, StoreStats['dailySeries'][number]>();

  for (let index = SERIES_DAYS - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = toDateKey(date);
    days.set(key, {
      date: key,
      label: formatter.format(date),
      visits: 0,
      checkoutClicks: 0,
      productClicks: 0,
    });
  }

  const addEvents = (rows: AnalyticsRow[], field: 'visits' | 'checkoutClicks' | 'productClicks') => {
    rows.forEach((row) => {
      const key = row.created_at.slice(0, 10);
      const current = days.get(key);
      if (current) current[field] += 1;
    });
  };

  addEvents(views, 'visits');
  addEvents(checkoutClicks, 'checkoutClicks');
  addEvents(productClicks, 'productClicks');

  return [...days.values()];
}

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
      supabase.from('store_views').select('created_at').eq('store_id', shopId).gte('created_at', since),
      supabase.from('whatsapp_clicks').select('created_at').eq('store_id', shopId).gte('created_at', since),
      supabase.from('product_clicks').select('created_at, product_id, products(name)').eq('store_id', shopId).gte('created_at', since),
    ]);

    if (views.error || checkoutClicks.error || productClicks.error) {
      throw new AppError('Gagal mengambil statistik.', views.error || checkoutClicks.error || productClicks.error);
    }

    const grouped = new Map<string, { productId: string; productName: string; clicks: number }>();
    const productClickRows = (productClicks.data || []) as ProductClickRow[];

    productClickRows
      .filter((row) => row.product_id)
      .forEach((row) => {
        const productId = row.product_id as string;
        const current = grouped.get(productId) || { productId, productName: row.products?.name || 'Produk', clicks: 0 };
        current.clicks += 1;
        grouped.set(productId, current);
      });

    return {
      visits: views.data?.length || 0,
      checkoutClicks: checkoutClicks.data?.length || 0,
      productClicks: productClickRows.length,
      dailySeries: getDailySeries((views.data || []) as AnalyticsRow[], (checkoutClicks.data || []) as AnalyticsRow[], productClickRows),
      popularProducts: [...grouped.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    };
  }
}
