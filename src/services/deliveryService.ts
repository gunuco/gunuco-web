import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { DeliveryPartner } from '@/types';

export const deliveryService = {
  list: async () => (await apiClient.get<DeliveryPartner[]>(ENDPOINTS.deliveryPartners)).data,
  update: async (id: string, payload: Partial<DeliveryPartner>) =>
    (await apiClient.patch<DeliveryPartner>(ENDPOINTS.deliveryPartner(id), payload)).data,
};
