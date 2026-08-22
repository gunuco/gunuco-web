import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { addMonths, differenceInCalendarDays, format, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { useMemo, useState } from 'react';
import { CustomerCell, CustomizationsCell } from '@/components/orders/CustomerCell';
import { HighlightName } from '@/components/orders/HighlightName';
import { OrderIdCell } from '@/components/orders/OrderIdCell';
import { TotalCell } from '@/components/orders/TotalCell';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { KpiCard } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { APP_CONFIG } from '@/config/app.config';
import { WEDDING_ATTRIBUTE_SCHEMA } from '@/config/categorySchemas';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import { OccasionCalendar } from '@/features/occasion/OccasionCalendar';
import { OccasionOrderDialog } from '@/features/occasion/OccasionOrderDialog';
import { useCategories } from '@/hooks/useCategories';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/types';
import { getCategoryById } from '@/utils/category';
import { formatDate } from '@/utils/format';
import { formatOrderCustomizations } from '@/utils/orderCustomizations';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';

const OCCASION_SUBCATEGORY = 'cat_wedding';

const OCCASION_FILTER_FIELDS = WEDDING_ATTRIBUTE_SCHEMA.filter(
  (field) => field.key !== 'weightKg' && field.key !== 'tiers',
);

function isOccasionOrder(order: Order) {
  return order.items.some((item) => item.subcategoryId === OCCASION_SUBCATEGORY);
}

function promisedDay(order: Order) {
  return format(parseISO(order.promisedAt), 'yyyy-MM-dd');
}

export function OccasionCakesPage() {
  const { data: categories = [] } = useCategories();
  const list = useOrders({ subcategoryId: OCCASION_SUBCATEGORY, page: 1, pageSize: 100 });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  const horizonStart = startOfDay(new Date());
  const horizonEnd = addMonths(horizonStart, 1);
  const allRows = useMemo(
    () => sortOrdersLatestFirst((list.data?.data ?? []).filter(isOccasionOrder)),
    [list.data?.data],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of allRows) {
      const key = promisedDay(order);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [allRows]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((order) => {
      if (selectedDay && !isSameDay(parseISO(order.promisedAt), selectedDay)) return false;
      if (q) {
        const matchesId = order.orderNumber.toLowerCase().includes(q);
        const matchesName = order.customerName.toLowerCase().includes(q);
        if (!matchesId && !matchesName) return false;
      }
      return OCCASION_FILTER_FIELDS.every((field) => {
        const wanted = filters[field.key];
        if (!wanted) return true;
        return order.items.some((item) => String(item.attributes[field.key] ?? '') === wanted);
      });
    });
  }, [allRows, filters, search, selectedDay]);

  const next30 = allRows.filter((order) => {
    const days = differenceInCalendarDays(parseISO(order.promisedAt), new Date());
    return days >= 0 && days <= APP_CONFIG.occasionMaxDays;
  }).length;

  const columns: Column<Order>[] = [
    {
      id: 'order',
      label: 'Order ID',
      render: (row) => <OrderIdCell orderNumber={row.orderNumber} placedAt={row.createdAt} />,
    },
    {
      id: 'when',
      label: 'Scheduled',
      render: (row) => formatDate(row.promisedAt),
    },
    {
      id: 'customer',
      label: 'Customer',
      align: 'left',
      render: (row) => <HighlightName value={row.customerName} tone="wine" />,
    },
    {
      id: 'details',
      label: 'Details',
      render: (row) => <CustomerCell phone={row.customerPhone} address={row.customerAddress} />,
    },
    {
      id: 'cat',
      label: 'Category',
      render: (row) => {
        const name =
          getCategoryById(categories, row.items[0]?.subcategoryId)?.name ??
          getCategoryById(categories, row.items[0]?.categoryId)?.name ??
          '—';
        return <HighlightName value={name} tone="gold" />;
      },
    },
    {
      id: 'custom',
      label: 'Customizations',
      render: (row) => <CustomizationsCell value={formatOrderCustomizations(row, categories)} />,
    },
    {
      id: 'total',
      label: 'Total',
      render: (row) => <TotalCell amount={row.total} paid={row.paymentStatus === 'completed'} />,
    },
    {
      id: 'pay',
      label: 'Payment',
      render: (row) => {
        const paid = row.paymentStatus === 'completed';
        return (
          <StatusChip
            status={paid ? 'completed' : 'unpaid'}
            label={PAYMENT_STATUS_LABELS[row.paymentStatus]}
          />
        );
      },
    },
    {
      id: 'st',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} label={ORDER_STATUS_LABELS[row.status]} />,
    },
  ];

  const setFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <Stack gap={2.5}>
      <PageHeader
        highlightTitle
        eyebrow="Operations"
        title="Occasion cakes"
        subtitle={`Customers can schedule up to ${APP_CONFIG.occasionMaxDays} days ahead. Click a calendar day to see that date, or an order for the full ticket.`}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <KpiCard
            label={`Next ${APP_CONFIG.occasionMaxDays} days`}
            value={String(next30)}
            icon={<EventAvailableRoundedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <KpiCard
            label="Awaiting"
            value={String(allRows.filter((order) => order.status === 'not_accepted').length)}
            icon={<HourglassBottomRoundedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <KpiCard
            label={selectedDay ? format(selectedDay, 'dd MMM') : 'All scheduled'}
            value={String(rows.length)}
            icon={<CakeRoundedIcon fontSize="small" />}
          />
        </Grid>
      </Grid>
      <OccasionCalendar
        month={month}
        onMonthChange={setMonth}
        counts={counts}
        selected={selectedDay}
        onSelect={setSelectedDay}
        horizonStart={horizonStart}
        horizonEnd={horizonEnd}
      />
      <Stack gap={0}>
        <FilterBar connected singleRow>
          <TextField
            {...filterFieldProps}
            label="Search"
            placeholder="Order # or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 180, flex: '1 1 180px' }}
          />
          {OCCASION_FILTER_FIELDS.map((field) => (
            <TextField
              key={field.key}
              {...filterFieldProps}
              select
              label={field.label}
              value={filters[field.key] ?? ''}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) => setFilter(field.key, e.target.value)}
              sx={{ minWidth: 140, flex: '1 1 140px' }}
            >
              <MenuItem value="">All</MenuItem>
              {(field.options ?? []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </FilterBar>
        <DataTable
          connected
          headerFit
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          loading={list.isLoading ? 6 : false}
          emptyMessage="No occasion cakes match these filters."
          onRowClick={setSelected}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Scheduling is capped at {APP_CONFIG.occasionMaxDays} days from today. Open a row for every customization,
        customer detail, and ping.
      </Typography>
      <OccasionOrderDialog order={selected} categories={categories} onClose={() => setSelected(null)} />
    </Stack>
  );
}

export { OccasionCakesPage as WeddingOrdersPage };
