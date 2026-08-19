import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { differenceInHours, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS } from '@/constants/status';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';
import { APP_CONFIG } from '@/config/app.config';

export function WeddingOrdersPage() {
  const navigate = useNavigate();
  const list = useOrders({ subcategoryId: 'cat_wedding', page: 1, pageSize: 50 });
  const rows = sortOrdersLatestFirst(
    (list.data?.data ?? []).filter((o) => o.items.some((i) => i.subcategoryId === 'cat_wedding')),
  );
  const now = new Date();
  const next3 = rows.filter((o) => {
    const h = differenceInHours(parseISO(o.promisedAt), now);
    return h >= 0 && h <= 72;
  }).length;
  const next7 = rows.filter((o) => {
    const h = differenceInHours(parseISO(o.promisedAt), now);
    return h >= 0 && h <= 168;
  }).length;
  const atRisk = rows.filter((o) => {
    const remaining = differenceInHours(parseISO(o.promisedAt), now);
    return remaining > 0 && remaining < 96 && !['delivered', 'cancelled'].includes(o.status);
  }).length;

  const columns: Column<Order>[] = [
    {
      id: 'id',
      label: 'Order ID',
      minWidth: 160,
      render: (r) => <OrderIdCell orderNumber={r.orderNumber} placedAt={r.createdAt} />,
    },
    { id: 'req', label: 'Requested', render: (r) => formatDateTime(r.promisedAt) },
    {
      id: 'lead',
      label: 'Lead remaining',
      render: (r) => `${Math.max(0, differenceInHours(parseISO(r.promisedAt), now))}h`,
    },
    { id: 'customer', label: 'Customer', render: (r) => r.customerName },
    { id: 'product', label: 'Product', render: (r) => r.items[0]?.productName ?? '—' },
    { id: 'qty', label: 'Qty', render: (r) => r.items.reduce((s, i) => s + i.quantity, 0) },
    { id: 'amt', label: 'Amount', render: (r) => formatCurrency(r.total) },
    {
      id: 'st',
      label: 'Production',
      render: (r) => <StatusChip status={r.status} label={ORDER_STATUS_LABELS[r.status]} />,
    },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Operations"
        title="Wedding & Anniversary Orders"
        subtitle={`Filtered view of ordinary orders for WEDDING OR ANNIVERSARY CAKES. Fulfilment window is ${APP_CONFIG.weddingMinHours}–${APP_CONFIG.weddingMaxHours} hours from order creation.`}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard label="Next 3 days" value={String(next3)} icon={<FavoriteBorderRoundedIcon fontSize="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard label="Next 7 days" value={String(next7)} icon={<CakeRoundedIcon fontSize="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard
            label="Awaiting"
            value={String(rows.filter((o) => o.status === 'not_accepted').length)}
            icon={<HourglassBottomRoundedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard
            label="Preparing"
            value={String(rows.filter((o) => o.status === 'preparing').length)}
            icon={<CakeRoundedIcon fontSize="small" />}
            accent="#B45309"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard
            label="Ready"
            value={String(rows.filter((o) => o.status === 'ready_for_delivery').length)}
            icon={<CakeRoundedIcon fontSize="small" />}
            accent="#2F6B4F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard label="At risk" value={String(atRisk)} icon={<WarningAmberRoundedIcon fontSize="small" />} accent="#B42318" />
        </Grid>
      </Grid>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={list.isLoading ? 6 : false} emptyMessage="No wedding orders." />
      <Typography variant="caption" color="text.secondary">
        At Risk is an operational warning only. It does not change the 72–720 hour window.
      </Typography>
      <Button onClick={() => navigate('/orders')} variant="text">
        Open in Orders
      </Button>
    </Stack>
  );
}
