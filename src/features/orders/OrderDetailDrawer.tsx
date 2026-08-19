import { Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import type { Category, Order, OrderStatus } from '@/types';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';
import { formatCurrency, formatDateTime } from '@/utils/format';

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'packed',
  packed: 'ready_for_delivery',
  ready_for_delivery: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

interface Props {
  order: Order | null;
  categories: Category[];
  onClose: () => void;
  onStatus: (status: OrderStatus) => void;
}

export function OrderDetailDrawer({ order, categories, onClose, onStatus }: Props) {
  const next = order ? NEXT[order.status] : undefined;

  return (
    <AppDrawer open={Boolean(order)} title={order?.orderNumber ?? 'Order'} onClose={onClose}>
      {order ? (
        <Stack gap={2}>
          <Stack direction="row" gap={1}>
            <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
            <StatusChip status={order.paymentStatus} label={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {order.customerName} · {order.customerPhone}
          </Typography>
          <Typography variant="body2">{order.customerAddress}</Typography>
          <Typography variant="caption" color="text.secondary">
            Promised {formatDateTime(order.promisedAt)}
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
                {item.addOns.map((a) => (
                  <Typography key={a.id} variant="body2" color="text.secondary">
                    + {a.name} ({formatCurrency(a.price)})
                  </Typography>
                ))}
                <Typography fontWeight={700}>{formatCurrency(item.lineTotal)}</Typography>
              </Stack>
            );
          })}
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Total</Typography>
            <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
          </Stack>
          {order.notes ? (
            <Typography variant="body2">Note: {order.notes}</Typography>
          ) : null}
          {next ? (
            <Button variant="contained" onClick={() => onStatus(next)}>
              Move to {ORDER_STATUS_LABELS[next]}
            </Button>
          ) : null}
          <TextField select label="Override status" value={order.status} onChange={(e) => onStatus(e.target.value as OrderStatus)}>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      ) : null}
    </AppDrawer>
  );
}
