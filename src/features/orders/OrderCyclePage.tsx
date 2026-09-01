import { MenuItem, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ErrorState, EmptyState } from '@/components/ui/Feedback';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { HighlightName } from '@/components/orders/HighlightName';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { TotalCell } from '@/components/orders/TotalCell';
import { ORDER_CYCLE_STEPS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import { CycleOrderDialog, liveLabel } from '@/features/orders/CycleOrderDialog';
import { useCategories } from '@/hooks/useCategories';
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';

const INBOX: OrderStatus[] = ['not_accepted'];

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
            headerFit
            minWidth={1020}
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
      <CycleOrderDialog
        order={selected}
        categories={categories}
        riderName={selected ? riderName(selected.riderId) : '—'}
        onClose={() => setSelected(null)}
      />
    </Stack>
  );
}
