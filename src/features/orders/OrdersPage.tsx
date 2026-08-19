import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ErrorState, EmptyState } from '@/components/ui/Feedback';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { PAYMENT_STATUS_LABELS } from '@/constants/status';
import { HighlightName } from '@/components/orders/HighlightName';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { TotalCell } from '@/components/orders/TotalCell';
import { useCategories } from '@/hooks/useCategories';
import { useConfirm } from '@/hooks/useConfirm';
import { useOrderMutations, useOrders } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import type { Order, OrderFilters, PaymentStatus } from '@/types';
import { getCategoryById, getChildCategories, getParentCategories } from '@/utils/category';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';
import { canMutateOrders } from '@/utils/permissions';

export function OrdersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: categories = [] } = useCategories();
  const confirmApi = useConfirm();
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    pageSize: 10,
    status: 'not_accepted',
    paymentStatus: '',
  });

  const list = useOrders(filters);
  const { accept, reject } = useOrderMutations();
  const rows = useMemo(() => sortOrdersLatestFirst(list.data?.data ?? []), [list.data?.data]);

  const parents = getParentCategories(categories).filter((c) => c.active);
  const children = filters.categoryId ? getChildCategories(categories, filters.categoryId) : [];
  const canEdit = role ? canMutateOrders(role) : false;
  const busy = accept.isPending || reject.isPending;

  const columns: Column<Order>[] = useMemo(
    () => [
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
        id: 'total',
        label: 'Total',
        minWidth: 120,
        render: (row) => <TotalCell amount={row.total} paid={row.paymentStatus === 'completed'} />,
      },
      {
        id: 'pay',
        label: 'Payment',
        render: (row) => {
          const paid = row.paymentStatus === 'completed';
          return (
            <StatusChip
              status={paid ? 'completed' : 'unpaid'}
              label={PAYMENT_STATUS_LABELS[row.paymentStatus]}
            />
          );
        },
      },
      {
        id: 'actions',
        label: '',
        render: (row) => (
          <Stack direction="row" gap={0.4} justifyContent="center" flexWrap="nowrap" onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              variant={canEdit && !busy ? 'contained' : 'text'}
              className={canEdit && !busy ? 'accept-ring' : undefined}
              disabled={!canEdit || busy}
              onClick={() => accept.mutate(row.id)}
              sx={{ minHeight: 28, px: 1.2, fontSize: 12 }}
            >
              Accept
            </Button>
            <Button
              size="small"
              color="error"
              disabled={!canEdit || busy}
              onClick={async () => {
                const ok = await confirmApi.confirm(
                  'Reject this order?',
                  `${row.orderNumber} will be rejected. Paid orders are marked refunded.`,
                );
                if (ok) reject.mutate({ id: row.id, reason: 'Rejected from admin' });
              }}
              sx={{ minHeight: 28, px: 1, fontSize: 12 }}
            >
              Reject
            </Button>
          </Stack>
        ),
      },
    ],
    [accept, busy, canEdit, categories, confirmApi, reject],
  );

  const showTable = list.isLoading || rows.length > 0;

  return (
    <Stack gap={1.25}>
      <PageHeader
        highlightTitle
        eyebrow="Inbox"
        title="Orders"
        subtitle="Incoming tickets only. Accept sends the order to Production Queue. Track live movement on Order Cycle."
      />
      {list.isError ? (
        <ErrorState message="Could not load incoming orders." onRetry={() => void list.refetch()} />
      ) : null}
      <Stack gap={0}>
        <FilterBar connected={showTable}>
        <TextField
          {...filterFieldProps}
          label="From"
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))}
        />
        <TextField
          {...filterFieldProps}
          label="To"
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))}
        />
        <TextField
          {...filterFieldProps}
          select
          label="Category"
          value={filters.categoryId ?? ''}
          SelectProps={{ displayEmpty: true }}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              categoryId: e.target.value || undefined,
              subcategoryId: undefined,
              page: 1,
            }))
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          {parents.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          select
          label="Subcategory"
          value={filters.subcategoryId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, subcategoryId: e.target.value || undefined, page: 1 }))}
          SelectProps={{ displayEmpty: true }}
          sx={{ minWidth: 200 }}
          disabled={!filters.categoryId}
        >
          <MenuItem value="">All</MenuItem>
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          select
          label="Payment"
          value={filters.paymentStatus ?? ''}
          SelectProps={{ displayEmpty: true }}
          onChange={(e) =>
            setFilters((f) => ({ ...f, paymentStatus: e.target.value as PaymentStatus | '', page: 1 }))
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          label="Search"
          placeholder="Order # or name"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
        />
        </FilterBar>
        {!showTable ? (
          <EmptyState title="No incoming orders" description="New tickets appear here. Accepted orders move to Production Queue." />
        ) : (
          <DataTable
            connected
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={list.isLoading ? 8 : false}
            page={(filters.page ?? 1) - 1}
            pageSize={filters.pageSize ?? 10}
            total={list.data?.total}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p + 1 }))}
            onPageSizeChange={(s) => setFilters((f) => ({ ...f, pageSize: s, page: 1 }))}
          />
        )}
      </Stack>
      <ConfirmDialog
        open={confirmApi.open}
        title={confirmApi.title}
        description={confirmApi.description}
        danger
        confirmLabel="Reject"
        onCancel={() => confirmApi.handleClose(false)}
        onConfirm={() => confirmApi.handleClose(true)}
      />
    </Stack>
  );
}
