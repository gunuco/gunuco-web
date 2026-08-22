import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import type { Category, Order } from '@/types';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { canPingPhone, smsHref, telHref, whatsappHref } from '@/utils/phone';

interface OccasionOrderDialogProps {
  order: Order | null;
  categories: Category[];
  onClose: () => void;
}

export function OccasionOrderDialog({ order, categories, onClose }: OccasionOrderDialogProps) {
  const [fullScreen, setFullScreen] = useState(false);
  const ping = order ? canPingPhone(order.customerPhone) : false;
  const pingText = order
    ? `Hi ${order.customerName}, this is GUNUCO about order ${order.orderNumber}.`
    : '';

  return (
    <Dialog
      open={Boolean(order)}
      onClose={() => {
        setFullScreen(false);
        onClose();
      }}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ pr: 12, fontWeight: 800 }}>
        {order ? `Order ${order.orderNumber}` : 'Order'}
        <Stack direction="row" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconButton
            size="small"
            onClick={() => setFullScreen((v) => !v)}
            aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullScreen ? <FullscreenExitRoundedIcon /> : <OpenInFullRoundedIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setFullScreen(false);
              onClose();
            }}
            aria-label="Close"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {order ? (
          <Stack gap={2.25} sx={{ maxWidth: fullScreen ? 860 : '100%', mx: fullScreen ? 'auto' : 0 }}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
              <StatusChip
                status={order.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
                label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
              />
            </Stack>
            <Stack gap={0.35}>
              <Typography variant="subtitle2" color="text.secondary">
                Order
              </Typography>
              <Typography variant="body2">Placed {formatDateTime(order.createdAt)}</Typography>
              <Typography variant="body2" fontWeight={700}>
                Scheduled {formatDateTime(order.promisedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.source === 'pos' ? 'POS' : 'Online'} · {order.fulfillmentMethod.replaceAll('_', ' ')}
              </Typography>
            </Stack>
            <Divider />
            <Stack gap={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Customer
              </Typography>
              <Typography fontWeight={800}>{order.customerName}</Typography>
              <Typography variant="body2">{order.customerPhone}</Typography>
              <Typography variant="body2">{order.customerAddress}</Typography>
            </Stack>
            {ping ? (
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button size="small" variant="contained" startIcon={<CallRoundedIcon />} href={telHref(order.customerPhone)}>
                  Call
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ChatRoundedIcon />}
                  href={whatsappHref(order.customerPhone, pingText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </Button>
                <Button size="small" variant="outlined" startIcon={<SmsRoundedIcon />} href={smsHref(order.customerPhone, pingText)}>
                  SMS
                </Button>
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No phone on this order — ping is unavailable.
              </Typography>
            )}
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Customizations
            </Typography>
            {order.items.map((item) => {
              const cat = getCategoryById(categories, item.subcategoryId) ?? getCategoryById(categories, item.categoryId);
              const schema = getAttributeSchema(cat);
              return (
                <Stack key={item.id} gap={0.5}>
                  <Typography fontWeight={800}>
                    {item.productName} × {item.quantity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat?.name}
                  </Typography>
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                      {schema.find((field) => field.key === key)?.label ?? key}: {resolveAttributeLabel(schema, key, value)}
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
            {order.notes ? <Typography variant="body2">Note: {order.notes}</Typography> : null}
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Total</Typography>
              <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
