import { lazy, Suspense } from 'react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import { Button, Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/components/ui/KpiCard';
import { ErrorState } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderControlPanel } from '@/features/dashboard/OrderControlPanel';
import { RecentOrdersTable } from '@/features/dashboard/RecentOrdersTable';
import { useCategories } from '@/hooks/useCategories';
import { useDashboard } from '@/hooks/useDashboard';
import { brand } from '@/theme/colors';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatNumber } from '@/utils/format';

const OrdersTrendChart = lazy(() =>
  import('@/features/dashboard/OrdersTrendChart').then((m) => ({ default: m.OrdersTrendChart })),
);
const CategoryBreakdownChart = lazy(() =>
  import('@/features/dashboard/CategoryBreakdownChart').then((m) => ({ default: m.CategoryBreakdownChart })),
);

function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name.split(' ')[0] ?? name;
  return `${hello}, ${first}`;
}

export function DashboardPage() {
  const dashboard = useDashboard();
  const categories = useCategories();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const data = dashboard.data;
  const spark = data?.trend.map((p) => p.orders) ?? [];

  return (
    <Stack gap={3}>
      <PageHeader
        eyebrow="Overview"
        title={user ? greeting(user.name) : 'Dashboard'}
        subtitle="Today’s orders, production load and delivery pulse from the production house."
        actions={
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button variant="contained" onClick={() => navigate('/pos')}>
              New POS sale
            </Button>
            <Button variant="outlined" onClick={() => navigate('/menu')}>
              Add product
            </Button>
            <Button variant="outlined" onClick={() => navigate('/custom-cakes')}>
              Review custom cake
            </Button>
            <Button variant="outlined" onClick={() => navigate('/out-for-delivery')}>
              Assign delivery
            </Button>
          </Stack>
        }
      />
      {dashboard.isError ? (
        <ErrorState message="Could not load dashboard data." onRetry={() => void dashboard.refetch()} />
      ) : null}
      <Grid container spacing={2}>
        {[
          {
            label: "Today's orders",
            value: formatNumber(data?.ordersToday ?? 0),
            change: data?.ordersChange,
            hint: `${formatNumber(data?.totalOrders ?? 0)} all time`,
            icon: <ReceiptLongRoundedIcon fontSize="small" />,
            accent: brand.wine,
            spark,
            variant: 'solid' as const,
          },
          {
            label: "Today's revenue",
            value: formatCurrency(data?.revenueToday ?? 0),
            change: data?.revenueChange,
            hint: `${formatCurrency(data?.revenue ?? 0)} all time`,
            icon: <PaymentsRoundedIcon fontSize="small" />,
            accent: brand.gold,
            spark: data?.trend.map((p) => p.revenue) ?? [],
          },
          {
            label: 'Awaiting acceptance',
            value: formatNumber(data?.awaitingAcceptance ?? 0),
            hint: 'Manual review queue',
            icon: <HourglassBottomRoundedIcon fontSize="small" />,
            accent: '#B45309',
          },
          {
            label: 'Delivered today',
            value: formatNumber(data?.delivery.deliveredToday ?? 0),
            hint: `${data?.delivery.outForDelivery ?? 0} on the road · ${data?.delivery.pending ?? 0} pending`,
            icon: <LocalShippingRoundedIcon fontSize="small" />,
            accent: '#3B6B8C',
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <KpiCard {...card} loading={dashboard.isLoading} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        {[
          { label: 'Cakes orders', value: formatNumber(data?.cakesOrders ?? 0), icon: <CakeRoundedIcon fontSize="small" />, accent: brand.wine },
          { label: 'Custom cakes', value: formatNumber(data?.customCakesOrders ?? 0), icon: <CakeRoundedIcon fontSize="small" />, accent: brand.goldDark },
          { label: 'Occasion cakes', value: formatNumber(data?.weddingOrders ?? 0), hint: `${data?.atRiskWedding ?? 0} at risk`, icon: <FavoriteBorderRoundedIcon fontSize="small" />, accent: '#B42318' },
          { label: 'Preparing', value: formatNumber(data?.preparing ?? 0), icon: <AccessTimeRoundedIcon fontSize="small" />, accent: '#B45309' },
          { label: 'Ready for delivery', value: formatNumber(data?.readyForDelivery ?? 0), icon: <LocalShippingRoundedIcon fontSize="small" />, accent: '#2F6B4F' },
          { label: 'POS today', value: formatCurrency(data?.posRevenueToday ?? 0), hint: `${data?.posSalesToday ?? 0} sales`, icon: <PointOfSaleRoundedIcon fontSize="small" />, accent: '#3B6B8C' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
            <KpiCard {...card} loading={dashboard.isLoading} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Suspense fallback={null}>
            <OrdersTrendChart data={data?.trend} loading={dashboard.isLoading} />
          </Suspense>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Suspense fallback={null}>
            <CategoryBreakdownChart data={data?.categoryBreakdown} loading={dashboard.isLoading} />
          </Suspense>
        </Grid>
      </Grid>
      <OrderControlPanel
        settings={data?.controls}
        categories={categories.data ?? []}
        loading={dashboard.isLoading || categories.isLoading}
      />
      <RecentOrdersTable
        orders={data?.recentOrders ?? []}
        categories={categories.data ?? []}
        loading={dashboard.isLoading}
      />
    </Stack>
  );
}
