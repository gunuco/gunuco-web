import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { OrderTicketDetails } from '@/components/orders/OrderTicketDetails';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import type { Category, Order } from '@/types';
import { canPingPhone, smsHref, telHref, whatsappHref } from '@/utils/phone';

export function ProductionOrderDialog({
  order,
  categories,
  onClose,
}: {
  order: Order | null;
  categories: Category[];
  onClose: () => void;
}) {
  const [fullScreen, setFullScreen] = useState(false);
  const ping = order ? canPingPhone(order.customerPhone) : false;
  const pingText = order
    ? `Hi ${order.customerName}, this is GUNUCO kitchen about order ${order.orderNumber}.`
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
              <StatusChip status={order.source} label={order.source} />
            </Stack>
            <OrderTicketDetails
              order={order}
              categories={categories}
              notesPrefix="Kitchen note: "
              orderIdExtra={
                <Typography variant="body2" color="text.secondary">
                  {order.fulfillmentMethod.replaceAll('_', ' ')} · {order.locationId}
                </Typography>
              }
              afterDetails={
                ping ? (
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
                ) : null
              }
            />
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
