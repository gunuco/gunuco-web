import { AppModal } from '@/components/ui/AppModal';
import { OrderTicketDetails } from '@/components/orders/OrderTicketDetails';
import type { Category, Order } from '@/types';

export function SupportOrderDialog({
  order,
  categories,
  onClose,
}: {
  order: Order | null;
  categories: Category[];
  onClose: () => void;
}) {
  return (
    <AppModal open={Boolean(order)} title={order ? `Order ${order.orderNumber}` : 'Order'} onClose={onClose} maxWidth="sm">
      {order ? <OrderTicketDetails order={order} categories={categories} /> : null}
    </AppModal>
  );
}

export function SupportOrderDetails({ order, categories }: { order: Order; categories: Category[] }) {
  return <OrderTicketDetails order={order} categories={categories} />;
}
