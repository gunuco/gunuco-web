import { Navigate, Route, Routes } from 'react-router-dom';
import { AccessPage } from '@/features/access/AccessPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { CustomCakesPage } from '@/features/custom-cakes/CustomCakesPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DeliveryPage } from '@/features/delivery/DeliveryPage';
import { DispatchPage } from '@/features/delivery/DispatchPage';
import { FeedbackPage, TestimonialsPage } from '@/features/feedback/FeedbackPages';
import { CancellationsPage, RefundsPage, ReturnsPage } from '@/features/finance/FinancePages';
import { FulfilmentSettingsPage } from '@/features/fulfilment/FulfilmentSettingsPage';
import { LocationsPage } from '@/features/locations/LocationsPage';
import { MenuManagementPage } from '@/features/menu/MenuManagementPage';
import { OffersPage } from '@/features/offers/OffersPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OrderCyclePage } from '@/features/orders/OrderCyclePage';
import { PosPage } from '@/features/pos/PosPage';
import { ProductionQueuePage } from '@/features/production/ProductionQueuePage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { SupportTicketsPage } from '@/features/support/SupportTicketsPage';
import { WeddingOrdersPage } from '@/features/wedding/WeddingOrdersPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { GuestRoute, ProtectedRoute } from '@/routes/guards';
import { RoleGate } from '@/routes/RoleGate';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route element={<RoleGate />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-cycle" element={<OrderCyclePage />} />
            <Route path="/wedding-orders" element={<WeddingOrdersPage />} />
            <Route path="/support" element={<SupportTicketsPage />} />
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
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
