import { Box, Divider, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ErrorState, EmptyState } from '@/components/ui/Feedback';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { HighlightName } from '@/components/orders/HighlightName';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { TotalCell } from '@/components/orders/TotalCell';
import {
  DELIVERY_STATE_LABELS,
  ORDER_CYCLE_STEPS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PICKUP_STATUS_LABELS,
} from '@/constants/status';
import { useCategories } from '@/hooks/useCategories';
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';
import { brand } from '@/theme/colors';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';

const INBOX: OrderStatus[] = ['not_accepted'];
const ENDED: OrderStatus[] = ['rejected', 'cancelled'];

function cycleStepIndex(status: OrderStatus) {
  if (INBOX.includes(status) || ENDED.includes(status)) return -1;
  const index = ORDER_CYCLE_STEPS.indexOf(status);
  if (index >= 0) return index;
  if (['delivery_partner_assigning', 'assigned', 'picked_up'].includes(status)) {
    return ORDER_CYCLE_STEPS.indexOf('out_for_delivery');
  }
  return 0;
}

function liveLabel(order: Order) {
  if (order.status === 'out_for_delivery') return DELIVERY_STATE_LABELS[order.deliveryState];
  if (order.fulfillmentMethod === 'pickup_at_store') return PICKUP_STATUS_LABELS[order.pickupStatus];
  return ORDER_STATUS_LABELS[order.status];
}

export function OrderCyclePage() {
  const { data: categories = [] } = useCategories();
  const riders = useDeliveryPartners();
  const list = useOrders({ page: 1, pageSize: 100 });
  const [stage, setStage] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Order | null>(null);

  const cycleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortOrdersLatestFirst(list.data?.data ?? []).filter((order) => {
      if (INBOX.includes(order.status)) return false;
      if (stage && order.status !== stage) return false;
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q)
      );
    });
  }, [list.data?.data, search, stage]);

  const paged = cycleRows.slice(page * pageSize, page * pageSize + pageSize);
  const riderName = (id: string | null) => riders.data?.find((r) => r.id === id)?.name ?? '—';

  const columns: Column<Order>[] = [
    {
      id: 'order',
      label: 'Order ID',
      render: (row) => <OrderIdCell orderNumber={row.orderNumber} placedAt={row.createdAt} />,
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (row) => <HighlightName value={row.customerName} tone="wine" />,
    },
    {
      id: 'cat',
      label: 'Category',
      render: (row) => {
        const name =
          getCategoryById(categories, row.items[0]?.subcategoryId)?.name ??
          getCategoryById(categories, row.items[0]?.categoryId)?.name ??
          '—';
        return <HighlightName value={name} tone="gold" />;
      },
    },
    {
      id: 'stage',
      label: 'Current stage',
      render: (row) => <StatusChip status={row.status} label={ORDER_STATUS_LABELS[row.status]} />,
    },
    {
      id: 'live',
      label: 'Live status',
      render: (row) => <StatusChip status={row.deliveryState} label={liveLabel(row)} />,
    },
    {
      id: 'pay',
      label: 'Payment',
      render: (row) => (
        <StatusChip
          status={row.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
          label={PAYMENT_STATUS_LABELS[row.paymentStatus]}
        />
      ),
    },
    {
      id: 'total',
      label: 'Total',
      minWidth: 120,
      render: (row) => <TotalCell amount={row.total} paid={row.paymentStatus === 'completed'} />,
    },
  ];

  const showTable = list.isLoading || cycleRows.length > 0;

  return (
    <Stack gap={1.25}>
      <PageHeader
        highlightTitle
        eyebrow="Live track"
        title="Order cycle"
        subtitle="Read-only view of accepted orders as they move through production and out for delivery. No changes can be made here."
      />
      {list.isError ? (
        <ErrorState message="Could not load order cycle." onRetry={() => void list.refetch()} />
      ) : null}
      <Stack gap={0}>
        <FilterBar connected={showTable}>
          <TextField
            {...filterFieldProps}
            select
            label="Stage"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value as OrderStatus | '');
              setPage(0);
            }}
            SelectProps={{ displayEmpty: true }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All stages</MenuItem>
            {ORDER_CYCLE_STEPS.map((step) => (
              <MenuItem key={step} value={step}>
                {ORDER_STATUS_LABELS[step]}
              </MenuItem>
            ))}
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            {...filterFieldProps}
            label="Search"
            placeholder="Order # or name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </FilterBar>
        {!showTable ? (
          <EmptyState title="No orders in cycle yet" description="Accept an incoming order to start tracking it here." />
        ) : (
          <DataTable
            connected
            columns={columns}
            rows={paged}
            rowKey={(row) => row.id}
            loading={list.isLoading ? 8 : false}
            page={page}
            pageSize={pageSize}
            total={cycleRows.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
            onRowClick={setSelected}
          />
        )}
      </Stack>
      <AppDrawer open={Boolean(selected)} title={selected?.orderNumber ?? 'Order cycle'} onClose={() => setSelected(null)} width={520}>
        {selected ? (
          <CycleDetail order={selected} riderName={riderName(selected.riderId)} />
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function CycleDetail({ order, riderName }: { order: Order; riderName: string }) {
  const { data: categories = [] } = useCategories();
  const active = cycleStepIndex(order.status);
  const ended = ENDED.includes(order.status);

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
        <StatusChip
          status={order.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
          label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
        />
        <StatusChip status={order.deliveryState} label={liveLabel(order)} />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        View only · status updates happen in Production Queue and Out for Delivery
      </Typography>
      {ended ? (
        <Typography color="error.main" fontWeight={700}>
          This order left the live cycle ({ORDER_STATUS_LABELS[order.status]}).
        </Typography>
      ) : (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: alpha(brand.wine, 0.05),
            border: `1px solid ${alpha(brand.wine, 0.12)}`,
          }}
        >
          <Typography fontWeight={800} fontSize={13} sx={{ mb: 1.25 }}>
            Live cycle
          </Typography>
          <Stepper
            activeStep={order.status === 'delivered' ? ORDER_CYCLE_STEPS.length : Math.max(active, 0)}
            orientation="vertical"
            sx={{ '& .MuiStepLabel-label': { fontWeight: 650 } }}
          >
            {ORDER_CYCLE_STEPS.map((step, index) => (
              <Step key={step} completed={active > index} expanded>
                <StepLabel>
                  {ORDER_STATUS_LABELS[step]}
                  {index === active ? (
                    <Typography component="span" sx={{ ml: 1, color: brand.wine, fontSize: 12, fontWeight: 800 }}>
                      · now
                    </Typography>
                  ) : null}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}
      <Divider />
      <Typography fontWeight={800}>{order.customerName}</Typography>
      <Typography variant="body2">{order.customerPhone}</Typography>
      <Typography variant="body2">{order.customerAddress}</Typography>
      <Typography variant="caption" color="text.secondary">
        Placed {formatDateTime(order.createdAt)} · Promised {formatDateTime(order.promisedAt)}
      </Typography>
      <Typography variant="body2">
        Fulfilment: {order.fulfillmentMethod.replaceAll('_', ' ')}
        {order.riderId ? ` · Rider ${riderName}` : ''}
      </Typography>
      <Divider />
      {order.items.map((item) => {
        const cat = getCategoryById(categories, item.subcategoryId);
        const schema = getAttributeSchema(cat);
        return (
          <Stack key={item.id} gap={0.5}>
            <Typography fontWeight={700}>
              {item.productName} × {item.quantity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cat?.name}
            </Typography>
            {Object.entries(item.attributes).map(([k, v]) => (
              <Typography key={k} variant="body2">
                {schema.find((s) => s.key === k)?.label ?? k}: {resolveAttributeLabel(schema, k, v)}
              </Typography>
            ))}
            {item.addOns.map((addon) => (
              <Typography key={addon.id} variant="body2" color="text.secondary">
                + {addon.name} ({formatCurrency(addon.price)})
              </Typography>
            ))}
            <Typography fontWeight={700}>{formatCurrency(item.lineTotal)}</Typography>
          </Stack>
        );
      })}
      <Stack direction="row" justifyContent="space-between">
        <Typography color="text.secondary">Total</Typography>
        <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
      </Stack>
      {order.notes ? <Typography variant="body2">Note: {order.notes}</Typography> : null}
    </Stack>
  );
}
