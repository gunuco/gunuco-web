import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Button, Stack, Switch, TextField } from '@mui/material';
import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useCategories } from '@/hooks/useCategories';
import { useAddons, useCreateAddon, useUpdateAddon } from '@/hooks/useResources';
import type { Addon } from '@/types';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';

export function AddonsPage({ embedded = false }: { embedded?: boolean }) {
  const { data: categories = [] } = useCategories();
  const list = useAddons();
  const create = useCreateAddon();
  const update = useUpdateAddon();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('49');

  const columns: Column<Addon>[] = [
    { id: 'name', label: 'Add-on', render: (r) => r.name },
    { id: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    {
      id: 'cats',
      label: 'Applies to',
      render: (r) =>
        r.applicableCategoryIds
          .map((id) => getCategoryById(categories, id)?.name)
          .filter(Boolean)
          .join(', ') || '—',
    },
    {
      id: 'active',
      label: 'Active',
      render: (r) => (
        <Stack direction="row" alignItems="center" gap={1}>
          <StatusChip status={r.active ? 'active' : 'inactive'} />
          <Switch
            size="small"
            checked={r.active}
            disabled={isPendingForId(update, r.id)}
            onChange={(_, checked) => update.mutate({ id: r.id, payload: { active: checked } })}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap={2.5}>
      {embedded ? (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
            Add
          </Button>
        </Stack>
      ) : (
        <PageHeader
          title="Add-ons"
          eyebrow="Extras"
          subtitle="Applicable categories are IDs from GET /categories — not a hardcoded cake list."
          actions={
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
              Add
            </Button>
          }
        />
      )}
      <DataTable columns={columns} rows={list.data ?? []} rowKey={(r) => r.id} loading={list.isLoading ? 5 : false} />
      <AppModal open={open} title="New add-on" onClose={() => setOpen(false)}>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Button
            variant="contained"
            disabled={!name || create.isPending}
            onClick={() =>
              create.mutate(
                { name, price: Number(price), applicableCategoryIds: [] },
                {
                  onSuccess: () => {
                    setOpen(false);
                    setName('');
                  },
                },
              )
            }
          >
            {create.isPending ? 'Saving…' : 'Create'}
          </Button>
        </Stack>
      </AppModal>
    </Stack>
  );
}
