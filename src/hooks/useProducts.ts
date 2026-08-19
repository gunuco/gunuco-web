import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/services/catalogService';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { Product } from '@/types';

export function useProducts(filters?: { categoryId?: string; search?: string; active?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => catalogService.list(filters),
  });
}

export function useSaveProduct() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Partial<Product> }) =>
      id ? catalogService.update(id, payload) : catalogService.create(payload),
    onSuccess: (_data, vars) => {
      notify(vars.id ? 'Product updated' : 'Product created');
      void client.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: Error) => notify(err.message || 'Save failed', 'error'),
  });
}
