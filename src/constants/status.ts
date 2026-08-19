import type {
  CustomCakeRequest,
  DeliveryState,
  OrderStatus,
  PaymentStatus,
  PickupStatus,
  RiderStatus,
} from '@/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  not_accepted: 'Not Accepted',
  clarification_requested: 'Clarification Requested',
  rejected: 'Rejected',
  accepted: 'Accepted',
  preparing: 'Preparing',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  delivery_partner_assigning: 'Assigning Rider',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  resolved: 'Resolved',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  processing: 'Processing',
  failed: 'Failed',
  refunded: 'Refunded',
};

export const RIDER_STATUS_LABELS: Record<RiderStatus, string> = {
  available: 'Available',
  busy: 'On delivery',
  offline: 'Offline',
};

export const DELIVERY_STATE_LABELS: Record<DeliveryState, string> = {
  unassigned: 'Not Started',
  pending_assignment: 'Pending Assignment',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'Out for Delivery',
  arrived: 'Arrived',
  delivered: 'Delivered',
  not_required: 'Not Required',
};

export const PICKUP_STATUS_LABELS: Record<PickupStatus, string> = {
  not_applicable: 'Not Applicable',
  pickup_scheduled: 'Pickup Scheduled',
  ready_for_pickup: 'Ready for Pickup',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

export const PRODUCTION_COLUMNS: OrderStatus[] = [
  'accepted',
  'preparing',
  'packed',
  'ready_for_delivery',
];

export const ORDER_CYCLE_STEPS: OrderStatus[] = [
  'accepted',
  'preparing',
  'packed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
];

export const CUSTOM_CAKE_STATUS_LABELS: Record<CustomCakeRequest['status'], string> = {
  new: 'New',
  quoted: 'Quoted',
  confirmed: 'Confirmed',
  in_production: 'In production',
  completed: 'Completed',
  declined: 'Declined',
};

export const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange'> = {
  not_accepted: 'warning',
  clarification_requested: 'info',
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  preparing: 'warning',
  packed: 'info',
  ready: 'success',
  ready_for_delivery: 'success',
  delivery_partner_assigning: 'info',
  assigned: 'info',
  picked_up: 'info',
  out_for_delivery: 'info',
  delivered: 'success',
  cancelled: 'default',
  return_requested: 'warning',
  resolved: 'success',
  completed: 'success',
  paid: 'success',
  unpaid: 'orange',
  processing: 'info',
  failed: 'error',
  refunded: 'default',
  available: 'success',
  busy: 'warning',
  offline: 'default',
  unassigned: 'warning',
  pending_assignment: 'warning',
  in_transit: 'info',
  arrived: 'success',
  not_required: 'default',
  pickup_scheduled: 'info',
  ready_for_pickup: 'success',
  collected: 'success',
  new: 'warning',
  quoted: 'info',
  confirmed: 'success',
  in_production: 'warning',
  declined: 'error',
  auto: 'success',
  manual: 'warning',
  active: 'success',
  inactive: 'default',
  open: 'info',
  closed: 'success',
  urgent: 'error',
  high: 'warning',
  approved: 'success',
  withdrawn: 'default',
};
