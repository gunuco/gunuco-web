import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { OrderControlSettings } from '@/types';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.root,
    queryFn: dashboardService.get,
  });
}

export function useUpdateDashboardControls() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: dashboardService.updateControls,
    onMutate: async (payload) => {
      await client.cancelQueries({ queryKey: queryKeys.dashboard.root });
      const previous = client.getQueryData(queryKeys.dashboard.root);
      client.setQueryData(queryKeys.dashboard.root, (old: Awaited<ReturnType<typeof dashboardService.get>> | undefined) =>
        old
          ? {
              ...old,
              controls: {
                ...old.controls,
                ...payload,
                categoryControls: payload.categoryControls ?? old.controls.categoryControls,
              },
            }
          : old,
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) client.setQueryData(queryKeys.dashboard.root, ctx.previous);
      notify('Could not update order controls', 'error');
    },
    onSuccess: () => notify('Order controls updated'),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.dashboard.root });
      void client.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export type { OrderControlSettings };
