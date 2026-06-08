import type { CartItem } from './cart';

export interface StoreProfile {
  name: string;
  description?: string;
  whatsappNumber: string;
  logoUrl?: string;
  address?: string;
  openingHours?: string;
  themeId?: string;
}

export interface CheckoutPayload {
  storeName: string;
  customerName?: string;
  customerWhatsapp?: string;
  customerAddress?: string;
  items: CartItem[];
  subtotal: number;
  note?: string;
}
