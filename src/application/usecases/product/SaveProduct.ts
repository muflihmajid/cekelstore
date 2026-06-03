import type { Product, ProductStatus } from '@/core/domain/entities';
import { repositories } from '@/infrastructure/supabase/repositories';

export interface ProductFormInput {
  id?: string;
  shopId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  status: ProductStatus;
  stock?: number | null;
  isAvailable?: boolean;
  imageFile?: File | null;
}

export async function saveProduct(input: ProductFormInput): Promise<Product> {
  let imageUrl = input.imageUrl;
  if (input.imageFile) {
    imageUrl = await repositories.storage.uploadProductImage(input.shopId, input.imageFile);
  }

  const payload = {
    categoryId: input.categoryId,
    name: input.name,
    description: input.description,
    price: input.price,
    imageUrl,
    status: input.status,
    stock: input.stock ?? null,
    isAvailable: input.status !== 'habis',
  };

  if (input.id) return repositories.products.update(input.id, payload);
  return repositories.products.create(input.shopId, payload);
}
