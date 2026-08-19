import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { DELIVERY_STATE_LABELS, ORDER_STATUS_LABELS, RIDER_STATUS_LABELS } from '@/constants/status';
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners';
import { useOrderMutations, useOrders } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import type { DeliveryPartner, Order } from '@/types';
import { formatCurrency, formatDateTime, fromNow } from '@/utils/format';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';
import { brand } from '@/theme/colors';
import { canAssignDelivery } from '@/utils/permissions';

function needsRider(order: Order) {
  return order.fulfillmentMethod !== 'pickup_at_store' && order.deliveryState !== 'not_required';
}

function isReadyToAssign(order: Order) {
  return needsRider(order) && !order.riderId && order.status === 'ready_for_delivery';
}

function isOutForDelivery(order: Order) {
  return needsRider(order) && (order.status === 'out_for_delivery' || order.deliveryState === 'in_transit');
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function DispatchPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canAssign = role ? canAssignDelivery(role) : false;
  const list = useOrders({ page: 1, pageSize: 100 });
  const riders = useDeliveryPartners();
  const { assignRider } = useOrderMutations();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orders = useMemo(() => sortOrdersLatestFirst(list.data?.data ?? []), [list.data?.data]);
  const readyOrders = useMemo(() => orders.filter(isReadyToAssign), [orders]);
  const liveDrops = useMemo(() => orders.filter(isOutForDelivery), [orders]);
  const availableRiders = useMemo(
    () => (riders.data ?? []).filter((r) => r.status === 'available'),
    [riders.data],
  );
  const selectedOrder = readyOrders.find((o) => o.id === selectedOrderId) ?? null;
  const busy = assignRider.isPending;

  const assign = (rider: DeliveryPartner) => {
    if (!selectedOrder || !canAssign || busy) return;
    assignRider.mutate(
      { id: selectedOrder.id, riderId: rider.id },
      { onSuccess: () => setSelectedOrderId(null) },
    );
  };

  const liveColumns: Column<Order>[] = [
    {
      id: 'order',
      label: 'Order',
      minWidth: 160,
      render: (row) => <OrderIdCell orderNumber={row.orderNumber} placedAt={row.createdAt} />,
    },
    { id: 'customer', label: 'Customer', render: (row) => row.customerName },
    { id: 'address', label: 'Drop', render: (row) => row.customerAddress },
    {
      id: 'rider',
      label: 'Rider',
      render: (row) => (riders.data ?? []).find((r) => r.id === row.riderId)?.name ?? '—',
    },
    {
      id: 'track',
      label: 'Tracking',
      render: (row) => <StatusChip status={row.deliveryState} label={DELIVERY_STATE_LABELS[row.deliveryState]} />,
    },
    { id: 'when', label: 'Promised', render: (row) => formatDateTime(row.promisedAt) },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Dispatch"
        title="Out for delivery"
        subtitle="Ready-for-delivery orders wait here until you assign an available delivery boy."
      />
      {list.isError || riders.isError ? (
        <ErrorState
          message="Could not load dispatch board."
          onRetry={() => {
            void list.refetch();
            void riders.refetch();
          }}
        />
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Ready to assign"
            value={readyOrders.length}
            hint="Ready for delivery only"
            accent="#2F6B4F"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Available riders"
            value={availableRiders.length}
            hint="Online and free for a drop"
            accent={brand.wine}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Currently out"
            value={liveDrops.length}
            hint="Already assigned and on the road"
            accent="#3B6B8C"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} lg={7}>
          <BoardColumn
            title="Ready for delivery"
            count={readyOrders.length}
            tone={{ bar: '#2F6B4F', wash: '#E8F3EC' }}
            empty="No ready-for-delivery orders waiting."
          >
            {readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={order.id === selectedOrder?.id}
                onSelect={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
              />
            ))}
          </BoardColumn>
        </Grid>
        <Grid item xs={12} lg={5}>
          <BoardColumn
            title="Available riders"
            count={availableRiders.length}
            tone={{ bar: brand.wine, wash: brand.wash }}
            empty="No delivery boys are available right now."
          >
            {selectedOrder ? (
              <Box
                sx={{
                  px: 1.5,
                  py: 1.1,
                  borderRadius: 2,
                  bgcolor: brand.creamPaper,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Assigning
                </Typography>
                <Typography fontWeight={800} fontSize={13}>
                  {selectedOrder.orderNumber} · {selectedOrder.customerName}
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
                Select a ready order, then assign it to a rider.
              </Typography>
            )}
            {availableRiders.map((rider) => (
              <RiderCard
                key={rider.id}
                rider={rider}
                disabled={!canAssign || !selectedOrder || busy}
                pending={busy}
                onAssign={() => assign(rider)}
              />
            ))}
          </BoardColumn>
        </Grid>
      </Grid>

      <Stack gap={1.25}>
        <Stack direction="row" alignItems="center" gap={1}>
          <LocalShippingRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography fontWeight={800}>Currently out for delivery</Typography>
        </Stack>
        <DataTable
          columns={liveColumns}
          rows={liveDrops}
          rowKey={(row) => row.id}
          loading={list.isLoading ? 4 : false}
          emptyMessage="No orders are out with a rider yet."
        />
      </Stack>
    </Stack>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <Card sx={{ border: 'none', boxShadow: '0 10px 24px rgba(28,25,23,0.06)' }}>
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, color: accent }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}

function BoardColumn({
  title,
  count,
  tone,
  empty,
  children,
}: {
  title: string;
  count: number;
  tone: { bar: string; wash: string };
  empty: string;
  children: ReactNode;
}) {
  const hasCards = count > 0;
  return (
    <Stack
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: tone.wash,
        minHeight: 420,
      }}
      gap={1.25}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone.bar }} />
        <Typography fontWeight={800} fontSize={14}>
          {title}
        </Typography>
        <Box
          sx={{
            ml: 'auto',
            px: 1,
            py: 0.15,
            borderRadius: 99,
            bgcolor: brand.creamPaper,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {count}
        </Box>
      </Stack>
      {children}
      {!hasCards ? (
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,252,250,0.7)', color: 'text.secondary' }}>
          {empty}
        </Box>
      ) : null}
    </Stack>
  );
}

function OrderCard({
  order,
  selected,
  onSelect,
}: {
  order: Order;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      sx={{
        border: 'none',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 0 2px #2F6B4F, 0 10px 24px rgba(28,25,23,0.08)' : '0 10px 24px rgba(28,25,23,0.06)',
        bgcolor: selected ? alpha('#2F6B4F', 0.06) : brand.creamPaper,
      }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography fontWeight={800} fontSize={13}>
            {order.orderNumber}
          </Typography>
          <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.75 }} fontWeight={650}>
          {order.items[0]?.productName}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {order.customerName} · {order.customerPhone}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {order.customerAddress}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
          <Typography variant="caption" color="text.secondary">
            Due {fromNow(order.promisedAt)}
          </Typography>
        </Stack>
        {selected ? (
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 1, color: '#2F6B4F' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={700}>
              Selected for assignment
            </Typography>
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RiderCard({
  rider,
  disabled,
  pending,
  onAssign,
}: {
  rider: DeliveryPartner;
  disabled: boolean;
  pending: boolean;
  onAssign: () => void;
}) {
  return (
    <Card sx={{ border: 'none', boxShadow: '0 10px 24px rgba(28,25,23,0.06)' }}>
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" gap={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(brand.wine, 0.12),
              color: brand.wine,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {initials(rider.name)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography fontWeight={800} fontSize={14} noWrap>
                {rider.name}
              </Typography>
              <StatusChip status={rider.status} label={RIDER_STATUS_LABELS[rider.status]} />
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block">
              {rider.phone}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {rider.vehicle} · {rider.locationLabel}
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 1.25 }}>
              <TwoWheelerRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Rating {rider.rating.toFixed(1)}
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ ml: 'auto' }}
                disabled={disabled}
                onClick={onAssign}
              >
                {pending ? 'Assigning…' : 'Assign'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
