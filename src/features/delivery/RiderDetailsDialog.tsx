import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { StatusChip } from '@/components/ui/StatusChip';
import { RIDER_STATUS_LABELS } from '@/constants/status';
import type { DeliveryPartner, Order } from '@/types';
import { canPingPhone, smsHref, telHref, whatsappHref } from '@/utils/phone';

export function RiderDetailsDialog({
  rider,
  orders,
  onClose,
  onOpenMap,
}: {
  rider: DeliveryPartner | null;
  orders: Order[];
  onClose: () => void;
  onOpenMap: () => void;
}) {
  const ping = rider ? canPingPhone(rider.phone) : false;
  const pingText = rider ? `Hi ${rider.name}, this is GUNUCO dispatch.` : '';

  return (
    <Dialog open={Boolean(rider)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
        {rider?.name ?? 'Delivery partner'}
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {rider ? (
          <Stack gap={1.75}>
            <StatusChip status={rider.status} label={RIDER_STATUS_LABELS[rider.status]} />
            <Stack gap={0.35}>
              <Typography variant="body2">{rider.phone}</Typography>
              <Typography variant="body2">{rider.vehicle}</Typography>
              <Typography variant="body2" color="text.secondary">
                {rider.locationLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rating {rider.rating.toFixed(1)} · {rider.activeOrders} active drop{rider.activeOrders === 1 ? '' : 's'}
              </Typography>
            </Stack>
            {ping ? (
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button size="small" variant="contained" startIcon={<CallRoundedIcon />} href={telHref(rider.phone)}>
                  Call
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ChatRoundedIcon />}
                  href={whatsappHref(rider.phone, pingText)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </Button>
                <Button size="small" variant="outlined" startIcon={<SmsRoundedIcon />} href={smsHref(rider.phone, pingText)}>
                  SMS
                </Button>
                <Button size="small" variant="outlined" startIcon={<MapRoundedIcon />} onClick={onOpenMap}>
                  GPS map
                </Button>
              </Stack>
            ) : null}
            <Divider />
            <Typography fontWeight={800} fontSize={13}>
              Assigned on the road
            </Typography>
            {orders.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No live drops right now.
              </Typography>
            ) : (
              orders.map((order) => (
                <Stack key={order.id} gap={0.25} sx={{ py: 0.75 }}>
                  <Typography fontWeight={700}>{order.orderNumber}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.customerName} · {order.customerAddress}
                  </Typography>
                </Stack>
              ))
            )}
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
