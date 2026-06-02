import type { AnalyticsEventType, Category, Product, Shop, StoreStats } from './entities';

export interface ShopRepository {
  getCurrentUserId(): Promise<string | null>;
  ensureShopForOwner(ownerId: string): Promise<Shop>;
  getMyShop(ownerId: string): Promise<Shop | null>;
  getShopBySlug(slug: string): Promise<Shop | null>;
  updateShop(shopId: string, payload: Partial<Shop>): Promise<Shop>;
}

export interface CategoryRepository {
  listByShop(shopId: string): Promise<Category[]>;
  create(shopId: string, name: string): Promise<Category>;
  update(categoryId: string, payload: Partial<Category>): Promise<Category>;
  remove(categoryId: string): Promise<void>;
}

export interface ProductRepository {
  listByShop(shopId: string): Promise<Product[]>;
  create(shopId: string, payload: Omit<Partial<Product>, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(productId: string, payload: Omit<Partial<Product>, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  remove(productId: string): Promise<void>;
}

export interface AnalyticsRepository {
  track(shopId: string, type: AnalyticsEventType, productId?: string | null): Promise<void>;
  getStats(shopId: string): Promise<StoreStats>;
}

export interface FileStorage {
  uploadShopLogo(shopId: string, file: File): Promise<string>;
  uploadProductImage(shopId: string, file: File): Promise<string>;
}
