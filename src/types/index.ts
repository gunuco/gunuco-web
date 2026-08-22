export type Role = 'owner' | 'admin' | 'branch_manager' | 'customer_support';

export type OrderStatus =
  | 'not_accepted'
  | 'clarification_requested'
  | 'rejected'
  | 'accepted'
  | 'preparing'
  | 'packed'
  | 'ready_for_delivery'
  | 'delivery_partner_assigning'
  | 'assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'resolved';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';

export type FulfillmentMode = 'auto' | 'manual';

export type FulfillmentMethod = 'pickup_at_store' | 'doorstep_delivery' | 'nationwide_delivery';

export type PickupStatus =
  | 'not_applicable'
  | 'pickup_scheduled'
  | 'ready_for_pickup'
  | 'collected'
  | 'cancelled';

export type AttributeFieldType = 'text' | 'select' | 'multiselect' | 'number' | 'boolean';

export type PricingModel = 'weight' | 'pack' | 'unit' | 'size';

export type OrderSource = 'online' | 'pos';

export type PaymentMethod = 'upi' | 'card' | 'netbanking';

export type RiderStatus = 'available' | 'busy' | 'offline';

export type DeliveryState =
  | 'unassigned'
  | 'pending_assignment'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'not_required';

export type CustomizationSwitch = 'on' | 'off' | 'inherit';

export type TicketStatus = 'new' | 'open' | 'pending' | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CategoryAttributeSchema {
  key: string;
  label: string;
  type: AttributeFieldType;
  required?: boolean;
  options?: SelectOption[];
  unit?: string;
  placeholder?: string;
}

export interface CustomizationMatrix {
  flavour: CustomizationSwitch;
  egg: CustomizationSwitch;
  sweetener: CustomizationSwitch;
  flour: CustomizationSwitch;
  size: CustomizationSwitch;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  parentId: string | null;
  active: boolean;
  sortOrder: number;
  icon: string;
  description: string;
  attributeSchema: CategoryAttributeSchema[];
  pricingModel: PricingModel;
  fulfillmentModes: FulfillmentMode[];
  orderMode: FulfillmentMode;
  acceptsOrders: boolean;
  dailyLimit: number | null;
  dailyAccepted: number;
  customization: CustomizationMatrix;
  customizationPricing?: CustomizationPriceGroup[];
  sameDayEligible: boolean;
}

export interface PriceTier {
  id: string;
  label: string;
  amount: number;
  price: number;
}

export interface CustomizationPriceOption {
  value: string;
  label: string;
  extraPrice: number;
}

export interface CustomizationPriceGroup {
  key: string;
  label: string;
  required: boolean;
  options: CustomizationPriceOption[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  imageHue: number;
  imageUrl?: string;
  basePrice?: number;
  active: boolean;
  featured?: boolean;
  sameDayEligible?: boolean;
  dailyQuota?: number;
  attributes: Record<string, string | number | boolean | string[]>;
  priceTiers: PriceTier[];
  customizationGroups?: CustomizationPriceGroup[];
  addOnIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  attributes: Record<string, string | number | boolean | string[]>;
  addOns: OrderItemAddon[];
}

export interface Order {
  id: string;
  orderNumber: string;
  source: OrderSource;
  locationId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  riderId: string | null;
  deliveryState: DeliveryState;
  fulfillmentMethod: FulfillmentMethod;
  pickupStatus: PickupStatus;
  notes: string;
  promisedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: RiderStatus;
  activeOrders: number;
  rating: number;
  locationLabel: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
  locationIds: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
  isProduction: boolean;
  posEnabled?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  active: boolean;
  required?: boolean;
  minQty?: number;
  maxQty?: number;
  description?: string;
  applicableCategoryIds: string[];
}

export interface CustomCakeRequest {
  id: string;
  customerName: string;
  phone: string;
  occasion: string;
  flavour: string;
  weightKg: number;
  notes: string;
  status: 'new' | 'quoted' | 'confirmed' | 'in_production' | 'completed' | 'declined';
  quotedPrice: number | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  message: string;
  channel: 'Guided Support' | 'Application Support Form';
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgent: string | null;
  escalationOwner: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: 'customer' | 'agent';
  authorName: string;
  body: string;
  createdAt: string;
}

export interface SupportRefund {
  id: string;
  ticketId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  kind: 'full' | 'partial';
  reason: string;
  status: 'processing' | 'completed';
  initiatedAt: string;
  agentName: string;
}

export interface Offer {
  id: string;
  name: string;
  type: 'percent' | 'flat';
  value: number;
  scope: string;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
}

export interface FeedbackItem {
  id: string;
  orderNumber: string;
  customerName: string;
  message: string;
  consent: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  moderator: string | null;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  displayName: string;
  quote: string;
  imageHue: number;
  channels: Array<'app' | 'website'>;
  displayOrder: number;
  active: boolean;
  sourceFeedbackId: string;
}

export interface RefundRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';
  retries: number;
  initiatedAt: string;
  completedAt: string | null;
}

export interface ReturnRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  resolution: 'full_refund' | 'partial_refund' | 'replacement' | 'store_credit' | 'rejected' | 'pending';
  createdAt: string;
}

export interface CancellationRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  originalAmount: number;
  refundAmount: number;
  actor: 'customer' | 'admin' | 'system';
  createdAt: string;
}

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: ApiMeta;
}

export interface DashboardKpis {
  totalOrders: number;
  revenue: number;
  ordersToday: number;
  ordersChange: number;
  revenueToday: number;
  revenueChange: number;
  pendingDelivery: number;
  deliveredToday: number;
  outForDelivery: number;
  avgPrepMinutes: number;
}

export interface DashboardPayload {
  totalOrders: number;
  revenue: number;
  ordersToday: number;
  revenueToday: number;
  ordersChange: number;
  revenueChange: number;
  avgPrepMinutes: number;
  cakesOrders: number;
  customCakesOrders: number;
  weddingOrders: number;
  awaitingAcceptance: number;
  preparing: number;
  packed: number;
  readyForDelivery: number;
  posSalesToday: number;
  posRevenueToday: number;
  atRiskWedding: number;
  delivery: {
    pending: number;
    outForDelivery: number;
    deliveredToday: number;
  };
  categoryBreakdown: CategoryBreakdownPoint[];
  trend: TrendPoint[];
  controls: OrderControlSettings;
  recentOrders: Order[];
}

export interface TrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface CategoryBreakdownPoint {
  categoryId: string;
  categoryName: string;
  value: number;
}

export interface OrderControlSettings {
  acceptOrders: boolean;
  deliveryAssignmentMode: FulfillmentMode;
  customCakesMode: FulfillmentMode;
  globalDailyLimit: number | null;
  categoryControls: Array<{
    categoryId: string;
    orderMode: FulfillmentMode;
    dailyLimit: number | null;
    acceptsOrders: boolean;
  }>;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  subcategoryId?: string;
  status?: OrderStatus | '';
  paymentStatus?: PaymentStatus | '';
  search?: string;
  page?: number;
  pageSize?: number;
  source?: OrderSource | '';
}

export type NavSection = 'operations' | 'catalogue' | 'fulfilment' | 'commerce' | 'support' | 'system';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles: Role[];
  section: NavSection;
}

export interface AuthUser extends User {
  token: string;
}
