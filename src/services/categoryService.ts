import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { Category } from '@/types';

export const categoryService = {
  list: async () => (await apiClient.get<Category[]>(ENDPOINTS.categories)).data,
  create: async (payload: Partial<Category>) =>
    (await apiClient.post<Category>(ENDPOINTS.categories, payload)).data,
  update: async (id: string, payload: Partial<Category>) =>
    (await apiClient.patch<Category>(ENDPOINTS.category(id), payload)).data,
};
