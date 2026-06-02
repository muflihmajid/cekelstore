import { SupabaseAnalyticsRepository } from './SupabaseAnalyticsRepository';
import { SupabaseCategoryRepository } from './SupabaseCategoryRepository';
import { SupabaseProductRepository } from './SupabaseProductRepository';
import { SupabaseShopRepository } from './SupabaseShopRepository';
import { SupabaseFileStorage } from '../storage/SupabaseFileStorage';

export const repositories = {
  shops: new SupabaseShopRepository(),
  categories: new SupabaseCategoryRepository(),
  products: new SupabaseProductRepository(),
  analytics: new SupabaseAnalyticsRepository(),
  storage: new SupabaseFileStorage(),
};
