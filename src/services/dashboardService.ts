import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { DashboardPayload, OrderControlSettings } from '@/types';

export const dashboardService = {
  get: async () => (await apiClient.get<DashboardPayload>(ENDPOINTS.dashboard)).data,
  updateControls: async (payload: Partial<OrderControlSettings>) =>
    (await apiClient.patch<OrderControlSettings>(ENDPOINTS.dashboardControls, payload)).data,
};
