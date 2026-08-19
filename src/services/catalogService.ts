import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { Product } from '@/types';

export const catalogService = {
  list: async (params?: { categoryId?: string; search?: string; active?: boolean }) =>
    (await apiClient.get<Product[]>(ENDPOINTS.products, { params })).data,
  create: async (payload: Partial<Product>) =>
    (await apiClient.post<Product>(ENDPOINTS.products, payload)).data,
  update: async (id: string, payload: Partial<Product>) =>
    (await apiClient.patch<Product>(ENDPOINTS.product(id), payload)).data,
};
