import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { DELIVERY_STATE_LABELS, ORDER_STATUS_LABELS } from '@/constants/status';
import type { Category, Order } from '@/types';
import { formatCurrency, formatTime } from '@/utils/format';
import { getCategoryById } from '@/utils/category';

export function RecentOrdersTable({
  orders,
  categories,
  loading,
}: {
  orders: Order[];
  categories: Category[];
  loading?: boolean;
}) {
  const navigate = useNavigate();

  const columns: Column<Order>[] = [
    {
      id: 'order',
      label: 'Order ID',
      minWidth: 160,
      render: (row) => <OrderIdCell orderNumber={row.orderNumber} placedAt={row.createdAt} />,
    },
    {
      id: 'parent',
      label: 'Parent',
      render: (row) => getCategoryById(categories, row.items[0]?.categoryId)?.name ?? '—',
    },
    {
      id: 'sub',
      label: 'Subcategory',
      render: (row) => getCategoryById(categories, row.items[0]?.subcategoryId)?.name ?? '—',
    },
    { id: 'customer', label: 'Customer', render: (row) => row.customerName },
    {
      id: 'when',
      label: 'Delivery time',
      render: (row) => formatTime(row.promisedAt),
    },
    {
      id: 'total',
      label: 'Amount',
      render: (row) => formatCurrency(row.total),
    },
    {
      id: 'status',
      label: 'Production',
      render: (row) => <StatusChip status={row.status} label={ORDER_STATUS_LABELS[row.status]} />,
    },
    {
      id: 'delivery',
      label: 'Delivery',
      render: (row) => (
        <StatusChip status={row.deliveryState} label={DELIVERY_STATE_LABELS[row.deliveryState]} />
      ),
    },
  ];

  return (
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Inbox
          </Typography>
          <Typography variant="h6">Recent orders</Typography>
        </Box>
        <Button size="small" onClick={() => navigate('/orders')}>
          View all
        </Button>
      </Stack>
      <DataTable
        columns={columns}
        rows={orders.slice(0, 8)}
        rowKey={(r) => r.id}
        loading={loading ? 6 : false}
        onRowClick={(row) => navigate(`/orders?focus=${row.id}`)}
        emptyMessage="No orders yet today."
      />
    </Stack>
  );
}
