import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { Order, OrderFilters, Paginated } from '@/types';

function asPage(result: { data: Order[]; meta?: { total?: number; page?: number; pageSize?: number } }, filters: OrderFilters): Paginated<Order> {
  return {
    data: result.data,
    total: result.meta?.total ?? result.data.length,
    page: result.meta?.page ?? filters.page ?? 1,
    pageSize: result.meta?.pageSize ?? filters.pageSize ?? 10,
  };
}

export const orderService = {
  list: async (filters: OrderFilters) =>
    asPage(await apiClient.get<Order[]>(ENDPOINTS.orders, { params: filters }), filters),
  get: async (id: string) => (await apiClient.get<Order>(ENDPOINTS.order(id))).data,
  accept: async (id: string) => (await apiClient.post<Order>(ENDPOINTS.orderAccept(id))).data,
  reject: async (id: string, reason?: string) =>
    (await apiClient.post<Order>(ENDPOINTS.orderReject(id), { reason })).data,
  updateStatus: async (id: string, status: Order['status']) =>
    (await apiClient.patch<Order>(ENDPOINTS.order(id), { status })).data,
  assignRider: async (id: string, riderId: string) =>
    (await apiClient.post<Order>(ENDPOINTS.orderAssign(id), { riderId })).data,
  updateDeliveryState: async (id: string, deliveryState: Order['deliveryState']) =>
    (await apiClient.patch<Order>(ENDPOINTS.order(id), { deliveryState })).data,
};
