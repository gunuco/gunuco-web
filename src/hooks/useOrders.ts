import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { Order, OrderFilters, OrderStatus, Paginated } from '@/types';

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => orderService.list(filters),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => orderService.get(id!),
    enabled: Boolean(id),
  });
}

function patchLists(client: ReturnType<typeof useQueryClient>, updater: (order: Order) => Order) {
  client.setQueriesData<Paginated<Order>>({ queryKey: ['orders', 'list'] }, (current) => {
    if (!current) return current;
    return { ...current, data: current.data.map(updater) };
  });
}

export function useOrderMutations() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: queryKeys.orders.all });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard.root });
    void client.invalidateQueries({ queryKey: queryKeys.deliveryPartners });
  };

  const accept = useMutation({
    mutationFn: orderService.accept,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: ['orders', 'list'] });
      patchLists(client, (o) => (o.id === id ? { ...o, status: 'accepted' } : o));
    },
    onSuccess: () => notify('Order accepted'),
    onError: (err: Error) => notify(err.message || 'Could not accept order', 'error'),
    onSettled: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => orderService.reject(id, reason),
    onMutate: async ({ id }) => {
      await client.cancelQueries({ queryKey: ['orders', 'list'] });
      patchLists(client, (o) => (o.id === id ? { ...o, status: 'rejected' } : o));
    },
    onSuccess: () => notify('Order rejected'),
    onError: (err: Error) => notify(err.message || 'Could not reject order', 'error'),
    onSettled: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await client.cancelQueries({ queryKey: ['orders', 'list'] });
      patchLists(client, (o) => (o.id === id ? { ...o, status } : o));
    },
    onSuccess: () => notify('Status updated'),
    onError: (err: Error) => notify(err.message || 'Could not update status', 'error'),
    onSettled: invalidate,
  });

  const assignRider = useMutation({
    mutationFn: ({ id, riderId }: { id: string; riderId: string }) =>
      orderService.assignRider(id, riderId),
    onSuccess: () => notify('Delivery partner assigned'),
    onError: (err: Error) => notify(err.message || 'Assignment failed', 'error'),
    onSettled: invalidate,
  });

  const updateDeliveryState = useMutation({
    mutationFn: ({ id, deliveryState }: { id: string; deliveryState: Order['deliveryState'] }) =>
      orderService.updateDeliveryState(id, deliveryState),
    onSuccess: () => notify('Tracking updated'),
    onError: (err: Error) => notify(err.message || 'Could not update tracking', 'error'),
    onSettled: invalidate,
  });

  return { accept, reject, updateStatus, assignRider, updateDeliveryState };
}
