import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryService.list,
  });
}

export function useCreateCategory() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      notify('Category created');
      void client.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: (err: Error) => notify(err.message || 'Could not create category', 'error'),
  });
}

export function useUpdateCategory() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Category> }) =>
      categoryService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await client.cancelQueries({ queryKey: queryKeys.categories });
      const previous = client.getQueryData<Category[]>(queryKeys.categories);
      client.setQueryData<Category[]>(queryKeys.categories, (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) client.setQueryData(queryKeys.categories, ctx.previous);
      notify('Could not update category', 'error');
    },
    onSuccess: () => notify('Category updated'),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}
