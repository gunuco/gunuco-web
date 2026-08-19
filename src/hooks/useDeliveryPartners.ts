import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryService } from '@/services/deliveryService';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { DeliveryPartner } from '@/types';

export function useDeliveryPartners() {
  return useQuery({
    queryKey: queryKeys.deliveryPartners,
    queryFn: deliveryService.list,
  });
}

export function useUpdateDeliveryPartner() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DeliveryPartner> }) =>
      deliveryService.update(id, payload),
    onSuccess: () => {
      notify('Delivery partner updated');
      void client.invalidateQueries({ queryKey: queryKeys.deliveryPartners });
    },
    onError: (err: Error) => notify(err.message || 'Update failed', 'error'),
  });
}
