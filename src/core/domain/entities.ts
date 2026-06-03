export type ThemeKey = 'blue-teal' | 'aqua-soft' | 'ocean-blue' | 'warm-clay' | 'slate-premium';

export type StoreStatus = 'draft' | 'active' | 'disabled';
export type ProductStatus = 'tersedia' | 'habis' | 'pre-order';

export interface Shop {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string | null;
  whatsappNumber: string;
  logoUrl: string | null;
  address: string | null;
  openingHours: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  marketplaceUrl: string | null;
  themeKey: ThemeKey;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  status: ProductStatus;
  stock: number | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AnalyticsEventType = 'visit' | 'checkout_click' | 'product_click';

export interface StoreStats {
  visits: number;
  checkoutClicks: number;
  productClicks: number;
  popularProducts: Array<{
    productId: string;
    productName: string;
    clicks: number;
  }>;
}

export interface ThemePreset {
  key: ThemeKey;
  label: string;
  description: string;
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
}
