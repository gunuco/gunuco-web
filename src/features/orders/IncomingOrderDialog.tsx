import { Button, Stack } from '@mui/material';
import { OrderTicketDetails } from '@/components/orders/OrderTicketDetails';
import { AppModal } from '@/components/ui/AppModal';
import type { Category, Order } from '@/types';

export function IncomingOrderDialog({
  order,
  categories,
  canEdit,
  busy,
  onClose,
  onAccept,
  onReject,
}: {
  order: Order | null;
  categories: Category[];
  canEdit: boolean;
  busy: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <AppModal
      open={Boolean(order)}
      title={order ? `Order ${order.orderNumber}` : 'Order'}
      onClose={onClose}
      maxWidth="sm"
    >
      {order ? (
        <Stack gap={2}>
          <OrderTicketDetails order={order} categories={categories} />
          <Stack direction="row" gap={1} justifyContent="flex-end" sx={{ pt: 0.5 }}>
            <Button
              color="error"
              disabled={!canEdit || busy}
              onClick={onReject}
              sx={{ minHeight: 36, px: 1.75 }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              className={canEdit && !busy ? 'accept-ring' : undefined}
              disabled={!canEdit || busy}
              onClick={onAccept}
              sx={{ minHeight: 36, px: 1.75 }}
            >
              Accept
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </AppModal>
  );
}
