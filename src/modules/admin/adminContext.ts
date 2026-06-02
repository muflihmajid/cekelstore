import type { InjectionKey, Ref } from 'vue';
import type { Shop } from '@/core/domain/entities';

export interface AdminContext {
  shop: Ref<Shop | null>;
  reloadShop: () => Promise<void>;
}

export const adminContextKey: InjectionKey<AdminContext> = Symbol('admin-context');
