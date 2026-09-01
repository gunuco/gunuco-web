import { Box, Divider, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AppModal } from '@/components/ui/AppModal';
import { DetailField } from '@/components/ui/DetailField';
import { StatusChip } from '@/components/ui/StatusChip';
import {
  DELIVERY_STATE_LABELS,
  ORDER_CYCLE_STEPS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PICKUP_STATUS_LABELS,
} from '@/constants/status';
import { brand } from '@/theme/colors';
import type { Category, Order, OrderStatus } from '@/types';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';
import { customerIdFromPhone } from '@/features/support/customerLookup';
import { formatCurrency, formatDateTime } from '@/utils/format';

const ENDED: OrderStatus[] = ['rejected', 'cancelled'];
const INBOX: OrderStatus[] = ['not_accepted'];

export function liveLabel(order: Order) {
  if (order.status === 'out_for_delivery') return DELIVERY_STATE_LABELS[order.deliveryState];
  if (order.fulfillmentMethod === 'pickup_at_store') return PICKUP_STATUS_LABELS[order.pickupStatus];
  return ORDER_STATUS_LABELS[order.status];
}

function cycleStepIndex(status: OrderStatus) {
  if (INBOX.includes(status) || ENDED.includes(status)) return -1;
  const index = ORDER_CYCLE_STEPS.indexOf(status);
  if (index >= 0) return index;
  if (['delivery_partner_assigning', 'assigned', 'picked_up'].includes(status)) {
    return ORDER_CYCLE_STEPS.indexOf('out_for_delivery');
  }
  return 0;
}

export function CycleOrderDialog({
  order,
  categories,
  riderName,
  onClose,
}: {
  order: Order | null;
  categories: Category[];
  riderName: string;
  onClose: () => void;
}) {
  const active = order ? cycleStepIndex(order.status) : -1;
  const ended = order ? ENDED.includes(order.status) : false;

  return (
    <AppModal
      open={Boolean(order)}
      title={order ? `Order ${order.orderNumber}` : 'Order'}
      onClose={onClose}
      maxWidth="sm"
    >
      {order ? (
        <Stack gap={2}>
          <DetailField label="Order ID">
            <Typography fontWeight={800}>{order.orderNumber}</Typography>
            <Typography variant="body2" color="text.secondary">
              Placed {formatDateTime(order.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Needed by {formatDateTime(order.promisedAt)}
            </Typography>
          </DetailField>

          <Divider />

          <DetailField label="Customer ID">
            <Typography fontWeight={800}>
              {customerIdFromPhone(order.customerPhone, order.customerName)}
            </Typography>
          </DetailField>

          <DetailField label="Customer">
            <Typography fontWeight={800}>{order.customerName}</Typography>
          </DetailField>

          <DetailField label="Details">
            <Typography variant="body2">{order.customerPhone}</Typography>
            <Typography variant="body2">{order.customerAddress}</Typography>
          </DetailField>

          <Divider />

          {order.items.map((item) => {
            const category =
              getCategoryById(categories, item.subcategoryId) ??
              getCategoryById(categories, item.categoryId);
            const parent = category?.parentId ? getCategoryById(categories, category.parentId) : undefined;
            const schema = getAttributeSchema(category);
            const categoryLabel = [parent?.name, category?.name].filter(Boolean).join(' · ') || '—';

            return (
              <Stack key={item.id} gap={1.25}>
                <DetailField label="Category">
                  <Typography fontWeight={700} sx={{ color: brand.goldDark }}>
                    {categoryLabel}
                  </Typography>
                  <Typography variant="body2">
                    {item.productName} × {item.quantity}
                  </Typography>
                </DetailField>

                <DetailField label="Customization">
                  {Object.keys(item.attributes).length === 0 && item.addOns.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      None
                    </Typography>
                  ) : null}
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                      {schema.find((field) => field.key === key)?.label ?? key}:{' '}
                      {resolveAttributeLabel(schema, key, value)}
                    </Typography>
                  ))}
                  {item.addOns.map((addon) => (
                    <Typography key={addon.id} variant="body2" color="text.secondary">
                      + {addon.name} ({formatCurrency(addon.price)})
                    </Typography>
                  ))}
                </DetailField>
              </Stack>
            );
          })}

          {order.notes ? (
            <Typography variant="body2">Note: {order.notes}</Typography>
          ) : null}

          <Divider />

          <DetailField label="Current stage">
            <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
          </DetailField>

          <DetailField label="Live status">
            <StatusChip status={order.deliveryState} label={liveLabel(order)} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {order.fulfillmentMethod.replaceAll('_', ' ')}
              {order.riderId ? ` · Rider ${riderName}` : ''}
            </Typography>
          </DetailField>

          <DetailField label="Live cycle">
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
          </DetailField>

          <Divider />

          <DetailField label="Payment">
            <StatusChip
              status={order.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
              label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {order.paymentMethod.replaceAll('_', ' ')}
            </Typography>
          </DetailField>

          <DetailField label="Total">
            <Row label="Subtotal" value={order.subtotal} />
            <Row label="Tax" value={order.tax} />
            <Row label="Delivery" value={order.deliveryFee} />
            {order.discount ? <Row label="Discount" value={-order.discount} /> : null}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography fontWeight={800}>Total</Typography>
              <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
            </Stack>
          </DetailField>
        </Stack>
      ) : null}
    </AppModal>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{formatCurrency(value)}</Typography>
    </Stack>
  );
}
