import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { CUSTOM_CAKE_STATUS_LABELS } from '@/constants/status';
import { useCustomCakes, useUpdateCustomCake } from '@/hooks/useResources';
import type { CustomCakeRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export function CustomCakesPage() {
  const list = useCustomCakes();
  const update = useUpdateCustomCake();

  const columns: Column<CustomCakeRequest>[] = [
    { id: 'customer', label: 'Customer', render: (r) => r.customerName },
    { id: 'occasion', label: 'Occasion', render: (r) => r.occasion },
    { id: 'flavour', label: 'Flavour', render: (r) => r.flavour },
    { id: 'weight', label: 'Weight', render: (r) => `${r.weightKg} kg` },
    {
      id: 'quote',
      label: 'Quote',
      render: (r) => (r.quotedPrice ? formatCurrency(r.quotedPrice) : '—'),
    },
    {
      id: 'status',
      label: 'Status',
      render: (r) => <StatusChip status={r.status} label={CUSTOM_CAKE_STATUS_LABELS[r.status]} />,
    },
    { id: 'date', label: 'Received', render: (r) => formatDate(r.createdAt) },
    {
      id: 'actions',
      label: '',
      render: (r) => (
        <TextField
          select
          size="small"
          value={r.status}
          disabled={update.isPending}
          onChange={(e) =>
            update.mutate({ id: r.id, payload: { status: e.target.value as CustomCakeRequest['status'] } })
          }
          sx={{ minWidth: 150 }}
        >
          {Object.entries(CUSTOM_CAKE_STATUS_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        title="Custom cakes"
        eyebrow="Atelier"
        subtitle="Enquiries from GET /custom-cakes. Status updates go through the same service you will point at the real API."
        actions={<Button disabled>New enquiry (coming from storefront)</Button>}
      />
      <DataTable
        columns={columns}
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        loading={list.isLoading ? 6 : false}
      />
    </Stack>
  );
}
