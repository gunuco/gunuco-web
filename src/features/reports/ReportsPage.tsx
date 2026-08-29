import { lazy, Suspense } from 'react';
import { Grid, Stack } from '@mui/material';
import { KpiCard } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDashboard } from '@/hooks/useDashboard';
import { useReports } from '@/hooks/useResources';
import { formatCurrency, formatNumber } from '@/utils/format';

const OrdersTrendChart = lazy(() =>
  import('@/features/dashboard/OrdersTrendChart').then((m) => ({ default: m.OrdersTrendChart })),
);
const CategoryBreakdownChart = lazy(() =>
  import('@/features/dashboard/CategoryBreakdownChart').then((m) => ({ default: m.CategoryBreakdownChart })),
);

export function ReportsPage() {
  const summary = useReports();
  const dashboard = useDashboard();

  return (
    <Stack gap={2.5}>
      <PageHeader
        title="Reports"
        eyebrow="Insights"
        subtitle="Ledger totals from GET /reports/summary plus GET /dashboard charts. Swap the service layer for a warehouse later."
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Orders" value={formatNumber(summary.data?.orders ?? 0)} loading={summary.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Revenue" value={formatCurrency(summary.data?.revenue ?? 0)} loading={summary.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="AOV" value={formatCurrency(summary.data?.aov ?? 0)} loading={summary.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Delivered" value={formatNumber(summary.data?.delivered ?? 0)} loading={summary.isLoading} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Suspense fallback={null}>
            <OrdersTrendChart data={dashboard.data?.trend} loading={dashboard.isLoading} />
          </Suspense>
        </Grid>
        <Grid item xs={12} md={4}>
          <Suspense fallback={null}>
            <CategoryBreakdownChart data={dashboard.data?.categoryBreakdown} loading={dashboard.isLoading} />
          </Suspense>
        </Grid>
      </Grid>
    </Stack>
  );
}
