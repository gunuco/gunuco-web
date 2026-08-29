import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RouteFallback } from '@/components/ui/RouteFallback';
import { LoginPage } from '@/features/auth/LoginPage';
import { GuestRoute, HomeRedirect, ProtectedRoute } from '@/routes/guards';
import { RoleGate } from '@/routes/RoleGate';
import { useAuthStore } from '@/store/authStore';
import { isSupportHost } from '@/utils/supportHost';

const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const SupportLayout = lazy(() => import('@/layouts/SupportLayout').then((m) => ({ default: m.SupportLayout })));
const AccessPage = lazy(() => import('@/features/access/AccessPage').then((m) => ({ default: m.AccessPage })));
const CustomCakesPage = lazy(() =>
  import('@/features/custom-cakes/CustomCakesPage').then((m) => ({ default: m.CustomCakesPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const DeliveryPage = lazy(() => import('@/features/delivery/DeliveryPage').then((m) => ({ default: m.DeliveryPage })));
const DispatchPage = lazy(() => import('@/features/delivery/DispatchPage').then((m) => ({ default: m.DispatchPage })));
const FeedbackPage = lazy(() =>
  import('@/features/feedback/FeedbackPages').then((m) => ({ default: m.FeedbackPage })),
);
const TestimonialsPage = lazy(() =>
  import('@/features/feedback/FeedbackPages').then((m) => ({ default: m.TestimonialsPage })),
);
const CancellationsPage = lazy(() =>
  import('@/features/finance/FinancePages').then((m) => ({ default: m.CancellationsPage })),
);
const RefundsPage = lazy(() => import('@/features/finance/FinancePages').then((m) => ({ default: m.RefundsPage })));
const ReturnsPage = lazy(() => import('@/features/finance/FinancePages').then((m) => ({ default: m.ReturnsPage })));
const FulfilmentSettingsPage = lazy(() =>
  import('@/features/fulfilment/FulfilmentSettingsPage').then((m) => ({ default: m.FulfilmentSettingsPage })),
);
const LocationsPage = lazy(() =>
  import('@/features/locations/LocationsPage').then((m) => ({ default: m.LocationsPage })),
);
const MenuManagementPage = lazy(() =>
  import('@/features/menu/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage })),
);
const OffersPage = lazy(() => import('@/features/offers/OffersPage').then((m) => ({ default: m.OffersPage })));
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderCyclePage = lazy(() =>
  import('@/features/orders/OrderCyclePage').then((m) => ({ default: m.OrderCyclePage })),
);
const PosPage = lazy(() => import('@/features/pos/PosPage').then((m) => ({ default: m.PosPage })));
const ProductionQueuePage = lazy(() =>
  import('@/features/production/ProductionQueuePage').then((m) => ({ default: m.ProductionQueuePage })),
);
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const CustomerProfilePage = lazy(() =>
  import('@/features/support/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })),
);
const SupportRefundsPage = lazy(() =>
  import('@/features/support/SupportRefundsPage').then((m) => ({ default: m.SupportRefundsPage })),
);
const SupportTicketsPage = lazy(() =>
  import('@/features/support/SupportTicketsPage').then((m) => ({ default: m.SupportTicketsPage })),
);
const OccasionCakesPage = lazy(() =>
  import('@/features/occasion/OccasionCakesPage').then((m) => ({ default: m.OccasionCakesPage })),
);

export function AppRoutes() {
  const role = useAuthStore((s) => s.user?.role);
  const desk = isSupportHost() || role === 'customer_support';

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          {desk ? (
            <Route element={<SupportLayout />}>
              <Route path="/support" element={<SupportTicketsPage />} />
              <Route path="/support/customers" element={<CustomerProfilePage />} />
              <Route path="/support/refunds" element={<SupportRefundsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/support" replace />} />
            </Route>
          ) : (
            <Route element={<AdminLayout />}>
              <Route element={<RoleGate />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pos" element={<PosPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order-cycle" element={<OrderCyclePage />} />
                <Route path="/occasion-cakes" element={<OccasionCakesPage />} />
                <Route path="/wedding-orders" element={<Navigate to="/occasion-cakes" replace />} />
                <Route path="/support" element={<SupportTicketsPage />} />
                <Route path="/support/customers" element={<CustomerProfilePage />} />
                <Route path="/support/refunds" element={<SupportRefundsPage />} />
                <Route path="/menu" element={<MenuManagementPage />} />
                <Route path="/catalog" element={<Navigate to="/menu" replace />} />
                <Route path="/categories" element={<Navigate to="/menu" replace />} />
                <Route path="/addons" element={<Navigate to="/menu" replace />} />
                <Route path="/pricing" element={<Navigate to="/menu" replace />} />
                <Route path="/custom-cakes" element={<CustomCakesPage />} />
                <Route path="/production" element={<ProductionQueuePage />} />
                <Route path="/out-for-delivery" element={<DispatchPage />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/fulfilment-settings" element={<FulfilmentSettingsPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/cancellations" element={<CancellationsPage />} />
                <Route path="/refunds" element={<RefundsPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/access" element={<AccessPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          )}
        </Route>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}
