import { Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { DetailField } from '@/components/ui/DetailField';
import { StatusChip } from '@/components/ui/StatusChip';
import { PAYMENT_STATUS_LABELS } from '@/constants/status';
import { customerIdFromPhone } from '@/features/support/customerLookup';
import { brand } from '@/theme/colors';
import type { Category, Order } from '@/types';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';
import { formatCurrency, formatDateTime } from '@/utils/format';

export function OrderTicketDetails({
  order,
  categories,
  orderIdExtra,
  afterDetails,
  notesPrefix = 'Note: ',
}: {
  order: Order;
  categories: Category[];
  orderIdExtra?: ReactNode;
  afterDetails?: ReactNode;
  notesPrefix?: string;
}) {
  return (
    <Stack gap={2}>
      <DetailField label="Order ID">
        <Typography fontWeight={800}>{order.orderNumber}</Typography>
        <Typography variant="body2" color="text.secondary">
          Placed {formatDateTime(order.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Needed by {formatDateTime(order.promisedAt)}
        </Typography>
        {orderIdExtra}
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

      {afterDetails}

      <Divider />

      {order.items.map((item) => {
        const category =
          getCategoryById(categories, item.subcategoryId) ?? getCategoryById(categories, item.categoryId);
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

      {order.notes ? <Typography variant="body2">{notesPrefix}{order.notes}</Typography> : null}

      <Divider />

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

      <DetailField label="Payment">
        <StatusChip
          status={order.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
          label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {order.paymentMethod.replaceAll('_', ' ')}
        </Typography>
      </DetailField>
    </Stack>
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
