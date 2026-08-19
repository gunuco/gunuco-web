import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { Addon, AuthUser, CustomCakeRequest, Location, Order } from '@/types';

export const addonService = {
  list: async () => (await apiClient.get<Addon[]>(ENDPOINTS.addons)).data,
  create: async (payload: Partial<Addon>) =>
    (await apiClient.post<Addon>(ENDPOINTS.addons, payload)).data,
  update: async (id: string, payload: Partial<Addon>) =>
    (await apiClient.patch<Addon>(ENDPOINTS.addon(id), payload)).data,
};

export const locationService = {
  list: async () => (await apiClient.get<Location[]>(ENDPOINTS.locations)).data,
};

export const customCakeService = {
  list: async () => (await apiClient.get<CustomCakeRequest[]>(ENDPOINTS.customCakes)).data,
  update: async (id: string, payload: Partial<CustomCakeRequest>) =>
    (await apiClient.patch<CustomCakeRequest>(ENDPOINTS.customCake(id), payload)).data,
};

export const posService = {
  checkout: async (payload: Record<string, unknown>) =>
    (await apiClient.post<Order>(ENDPOINTS.posCheckout, payload)).data,
};

export const reportService = {
  summary: async () =>
    (
      await apiClient.get<{ orders: number; revenue: number; aov: number; delivered: number }>(
        ENDPOINTS.reportsSummary,
      )
    ).data,
};

export const authService = {
  login: async (email: string, password: string) =>
    (await apiClient.post<AuthUser>(ENDPOINTS.auth.login, { email, password })).data,
};

export { deliveryService } from '@/services/deliveryService';
export { orderService } from '@/services/orderService';
export { catalogService } from '@/services/catalogService';
export { categoryService } from '@/services/categoryService';
export { dashboardService } from '@/services/dashboardService';
