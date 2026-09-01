import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { HighlightName } from '@/components/orders/HighlightName';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DetailField } from '@/components/ui/DetailField';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { DELIVERY_STATE_LABELS, RIDER_STATUS_LABELS } from '@/constants/status';
import { useDeliveryPartners, useUpdateDeliveryPartner } from '@/hooks/useDeliveryPartners';
import { useOrderMutations, useOrders } from '@/hooks/useOrders';
import type { DeliveryPartner, DeliveryState, Order } from '@/types';
import { formatDateTime } from '@/utils/format';

export function DeliveryPage() {
  const riders = useDeliveryPartners();
  const orders = useOrders({ page: 1, pageSize: 50 });
  const patchRider = useUpdateDeliveryPartner();
  const { updateDeliveryState } = useOrderMutations();
  const [selected, setSelected] = useState<DeliveryPartner | null>(null);
  const assigned = (orders.data?.data ?? []).filter((o) => o.riderId === selected?.id);

  const columns: Column<DeliveryPartner>[] = [
    { id: 'name', label: 'Partner', render: (r) => <HighlightName value={r.name} tone="wine" /> },
    { id: 'phone', label: 'Phone', render: (r) => r.phone },
    { id: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle },
    {
      id: 'status',
      label: 'Online status',
      render: (r) => <StatusChip status={r.status} label={RIDER_STATUS_LABELS[r.status]} />,
    },
    { id: 'orders', label: 'Assigned', render: (r) => r.activeOrders },
    { id: 'rating', label: 'Rating', render: (r) => r.rating.toFixed(1) },
    { id: 'loc', label: 'Last ping', render: (r) => r.locationLabel },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        highlightTitle
        title="Delivery partners"
        eyebrow="Fleet"
        subtitle="Fleet list and tracking. Assign ready-for-delivery tickets from Out for Delivery."
      />
      <DataTable
        columns={columns}
        rows={riders.data ?? []}
        rowKey={(r) => r.id}
        loading={riders.isLoading ? 6 : false}
        onRowClick={setSelected}
      />
      <AppDrawer open={Boolean(selected)} title={selected?.name ?? 'Rider'} onClose={() => setSelected(null)}>
        {selected ? (
          <Stack gap={2}>
            <DetailField label="Partner">
              <Typography fontWeight={800}>{selected.name}</Typography>
            </DetailField>
            <DetailField label="Details">
              <Typography variant="body2">{selected.phone}</Typography>
              <Typography variant="body2">{selected.vehicle}</Typography>
              <Typography variant="body2">{selected.locationLabel}</Typography>
            </DetailField>
            <DetailField label="Online status">
              <TextField
                select
                size="small"
                value={selected.status}
                onChange={(e) =>
                  patchRider.mutate({
                    id: selected.id,
                    payload: { status: e.target.value as DeliveryPartner['status'] },
                  })
                }
              >
                {Object.entries(RIDER_STATUS_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </DetailField>
            <DetailField label="Order ID">
              {assigned.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active drops.
                </Typography>
              ) : (
                assigned.map((order) => (
                  <OrderTrack
                    key={order.id}
                    order={order}
                    onChange={(state) => updateDeliveryState.mutate({ id: order.id, deliveryState: state })}
                  />
                ))
              )}
            </DetailField>
          </Stack>
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function OrderTrack({
  order,
  onChange,
}: {
  order: Order;
  onChange: (state: DeliveryState) => void;
}) {
  return (
    <Stack gap={1} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Typography fontWeight={800}>{order.orderNumber}</Typography>
      <Typography variant="body2" color="text.secondary">
        {order.customerAddress}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {formatDateTime(order.promisedAt)}
      </Typography>
      <StatusChip status={order.deliveryState} label={DELIVERY_STATE_LABELS[order.deliveryState]} />
      <Stack direction="row" gap={0.5} flexWrap="wrap">
        {(['assigned', 'picked_up', 'in_transit', 'arrived', 'delivered'] as DeliveryState[]).map((state) => (
          <Button
            key={state}
            size="small"
            variant={order.deliveryState === state ? 'contained' : 'text'}
            onClick={() => onChange(state)}
          >
            {DELIVERY_STATE_LABELS[state]}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
