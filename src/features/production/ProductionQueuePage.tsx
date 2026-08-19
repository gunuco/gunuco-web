import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { PRODUCTION_COLUMNS, ORDER_STATUS_LABELS } from '@/constants/status';
import { useOrderMutations, useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';
import { formatCurrency, fromNow } from '@/utils/format';
import { brand } from '@/theme/colors';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';
import { canAdvanceProduction } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'packed',
  packed: 'ready_for_delivery',
};

const COLUMN_TONE: Record<string, { bar: string; wash: string }> = {
  accepted: { bar: '#3B6B8C', wash: '#E7F0F5' },
  preparing: { bar: '#B45309', wash: '#F8EEDF' },
  packed: { bar: brand.wine, wash: brand.wash },
  ready_for_delivery: { bar: '#2F6B4F', wash: '#E8F3EC' },
};

export function ProductionQueuePage() {
  const role = useAuthStore((s) => s.user?.role);
  const canMove = role ? canAdvanceProduction(role) : false;
  const list = useOrders({ page: 1, pageSize: 50 });
  const { updateStatus } = useOrderMutations();
  const orders = sortOrdersLatestFirst(list.data?.data ?? []);

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Kitchen"
        title="Production queue"
        subtitle="Advance a ticket when the station finishes. Columns are the live order lifecycle."
      />
      <Grid container spacing={2} alignItems="flex-start">
        {PRODUCTION_COLUMNS.map((col) => {
          const cards = orders.filter((o) => o.status === col);
          const tone = COLUMN_TONE[col];
          return (
            <Grid item xs={12} md={3} key={col}>
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
                    {ORDER_STATUS_LABELS[col]}
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
                    {cards.length}
                  </Box>
                </Stack>
                {cards.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    disabled={!canMove || updateStatus.isPending || !NEXT[order.status]}
                    onAdvance={() => {
                      const next = NEXT[order.status];
                      if (next) updateStatus.mutate({ id: order.id, status: next });
                    }}
                  />
                ))}
                {cards.length === 0 ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,252,250,0.7)', color: 'text.secondary' }}>
                    Empty station
                  </Box>
                ) : null}
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

function KanbanCard({
  order,
  onAdvance,
  disabled,
}: {
  order: Order;
  onAdvance: () => void;
  disabled: boolean;
}) {
  return (
    <Card sx={{ border: 'none', boxShadow: '0 10px 24px rgba(28,25,23,0.06)' }}>
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={800} fontSize={13}>
            {order.orderNumber}
          </Typography>
          <StatusChip status={order.source} label={order.source} />
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.75 }} fontWeight={650}>
          {order.items[0]?.productName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {order.customerName} · {fromNow(order.promisedAt)}
        </Typography>
        <Typography fontWeight={800} sx={{ mt: 1 }}>
          {formatCurrency(order.total)}
        </Typography>
        <Button fullWidth size="small" sx={{ mt: 1.25 }} disabled={disabled} variant="contained" onClick={onAdvance}>
          Advance
        </Button>
      </CardContent>
    </Card>
  );
}
