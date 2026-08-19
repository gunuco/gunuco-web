import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addonService,
  customCakeService,
  locationService,
  posService,
  reportService,
} from '@/services/index';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { Addon, CustomCakeRequest } from '@/types';

export function useAddons() {
  return useQuery({ queryKey: queryKeys.addons, queryFn: addonService.list });
}

export function useCreateAddon() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: addonService.create,
    onSuccess: () => {
      notify('Add-on created');
      void client.invalidateQueries({ queryKey: queryKeys.addons });
    },
    onError: (err: Error) => notify(err.message || 'Could not create add-on', 'error'),
  });
}

export function useUpdateAddon() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Addon> }) =>
      addonService.update(id, payload),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.addons }),
  });
}

export function useLocations() {
  return useQuery({ queryKey: queryKeys.locations, queryFn: locationService.list });
}

export function useCustomCakes() {
  return useQuery({ queryKey: queryKeys.customCakes, queryFn: customCakeService.list });
}

export function useUpdateCustomCake() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CustomCakeRequest> }) =>
      customCakeService.update(id, payload),
    onSuccess: () => {
      notify('Request updated');
      void client.invalidateQueries({ queryKey: queryKeys.customCakes });
    },
  });
}

export function useReports() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: reportService.summary });
}

export function useCheckout() {
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: posService.checkout,
    onSuccess: (order) => notify(`POS ${order.orderNumber} paid`),
    onError: (err: Error) => notify(err.message || 'Checkout failed', 'error'),
  });
}
