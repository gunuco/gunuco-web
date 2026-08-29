import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Button, Card, CardContent, Collapse, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS } from '@/constants/status';
import { ProductionOrderDialog } from '@/features/production/ProductionOrderDialog';
import { useCategories } from '@/hooks/useCategories';
import { useConfirm } from '@/hooks/useConfirm';
import { useOrderMutations, useOrders } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import { brand } from '@/theme/colors';
import type { CategoryAttributeSchema, FulfillmentMethod, Order, OrderStatus } from '@/types';
import { getChildCategories, getParentCategories } from '@/utils/category';
import { formatCurrency, fromNow } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { formatOrderCustomizations } from '@/utils/orderCustomizations';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';
import { canAdvanceProduction } from '@/utils/permissions';

const COLUMNS: OrderStatus[] = ['accepted', 'preparing', 'packed'];

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'packed',
  packed: 'ready_for_delivery',
};

const COLUMN_TONE: Record<string, { bar: string; wash: string }> = {
  accepted: { bar: '#3B6B8C', wash: '#E7F0F5' },
  preparing: { bar: '#B45309', wash: '#F8EEDF' },
  packed: { bar: brand.wine, wash: brand.wash },
};

const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup_at_store: 'Pickup',
  doorstep_delivery: 'Doorstep',
  nationwide_delivery: 'Nationwide',
};

function collectCustomizationFields(categories: { attributeSchema: CategoryAttributeSchema[] }[]) {
  const map = new Map<string, CategoryAttributeSchema>();
  for (const category of categories) {
    for (const field of category.attributeSchema) {
      if (field.type !== 'select' || !field.options?.length) continue;
      const existing = map.get(field.key);
      if (!existing) {
        map.set(field.key, { ...field, options: [...(field.options ?? [])] });
        continue;
      }
      const seen = new Set((existing.options ?? []).map((row) => row.value));
      existing.options = [
        ...(existing.options ?? []),
        ...(field.options ?? []).filter((row) => !seen.has(row.value)),
      ];
    }
  }
  return [...map.values()];
}

export function ProductionQueuePage() {
  const role = useAuthStore((s) => s.user?.role);
  const canMove = role ? canAdvanceProduction(role) : false;
  const { data: categories = [] } = useCategories();
  const list = useOrders({ page: 1, pageSize: 80 });
  const { updateStatus } = useOrderMutations();
  const confirmApi = useConfirm();
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod | ''>('');
  const [addon, setAddon] = useState('');
  const [notesOnly, setNotesOnly] = useState('');
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [moreFilters, setMoreFilters] = useState(false);

  const boardOrders = useMemo(
    () => sortOrdersLatestFirst(list.data?.data ?? []).filter((order) => COLUMNS.includes(order.status)),
    [list.data?.data],
  );

  const parents = getParentCategories(categories).filter((row) => row.active);
  const children = categoryId ? getChildCategories(categories, categoryId) : [];
  const customFields = useMemo(() => collectCustomizationFields(categories), [categories]);
  const addonOptions = useMemo(() => {
    const names = new Set<string>();
    for (const order of boardOrders) {
      for (const item of order.items) {
        for (const extra of item.addOns) names.add(extra.name);
      }
    }
    return [...names].sort();
  }, [boardOrders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return boardOrders.filter((order) => {
      if (q) {
        const blob = `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (categoryId && !order.items.some((item) => item.categoryId === categoryId || item.subcategoryId === categoryId)) {
        return false;
      }
      if (subcategoryId && !order.items.some((item) => item.subcategoryId === subcategoryId)) return false;
      if (fulfillment && order.fulfillmentMethod !== fulfillment) return false;
      if (addon && !order.items.some((item) => item.addOns.some((extra) => extra.name === addon))) return false;
      if (notesOnly === 'yes' && !order.notes) return false;
      if (notesOnly === 'no' && order.notes) return false;
      return customFields.every((field) => {
        const wanted = custom[field.key];
        if (!wanted) return true;
        return order.items.some((item) => String(item.attributes[field.key] ?? '') === wanted);
      });
    });
  }, [addon, boardOrders, categoryId, custom, customFields, fulfillment, notesOnly, search, subcategoryId]);

  const advance = async (order: Order) => {
    const next = NEXT[order.status];
    if (!next || !canMove) return;
    const leaving = next === 'ready_for_delivery';
    const ok = await confirmApi.confirm(
      'Are you sure?',
      leaving
        ? `${order.orderNumber} will move from Packed to Ready for Delivery and leave this queue.`
        : `Move ${order.orderNumber} from ${ORDER_STATUS_LABELS[order.status]} to ${ORDER_STATUS_LABELS[next]}?`,
    );
    if (!ok) return;
    updateStatus.mutate({ id: order.id, status: next });
  };

  const extraFilterCount =
    Number(Boolean(addon)) +
    Number(Boolean(fulfillment)) +
    Number(Boolean(notesOnly)) +
    Object.values(custom).filter(Boolean).length;

  return (
    <Stack gap={2}>
      <PageHeader
        highlightTitle
        eyebrow="Kitchen"
        title="Production queue"
        subtitle="Accepted → Preparing → Packed. Click a ticket for every customization. Advance asks for confirmation."
      />
      <FilterBar>
        <TextField
          {...filterFieldProps}
          label="Search"
          placeholder="Order # or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 180, flex: '1 1 180px' }}
        />
        <TextField
          {...filterFieldProps}
          select
          label="Category"
          value={categoryId}
          SelectProps={{ displayEmpty: true }}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId('');
          }}
          sx={{ minWidth: 160, flex: '1 1 160px' }}
        >
          <MenuItem value="">All</MenuItem>
          {parents.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          select
          label="Subcategory"
          value={subcategoryId}
          SelectProps={{ displayEmpty: true }}
          disabled={!categoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          sx={{ minWidth: 180, flex: '1 1 180px' }}
        >
          <MenuItem value="">All</MenuItem>
          {children.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          size="small"
          onClick={() => setMoreFilters((open) => !open)}
          endIcon={moreFilters ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          sx={{ whiteSpace: 'nowrap', minHeight: 40 }}
        >
          {moreFilters ? 'Hide' : extraFilterCount ? `Show more (${extraFilterCount})` : 'Show more'}
        </Button>
        <Collapse in={moreFilters} sx={{ flex: '1 1 100%', width: '100%', minWidth: '100%' }}>
          <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center" sx={{ pt: 0.25 }}>
            {customFields.map((field) => (
              <TextField
                key={field.key}
                {...filterFieldProps}
                select
                label={field.label}
                value={custom[field.key] ?? ''}
                SelectProps={{ displayEmpty: true }}
                onChange={(e) => setCustom((current) => ({ ...current, [field.key]: e.target.value }))}
                sx={{ minWidth: 150, flex: '1 1 150px' }}
              >
                <MenuItem value="">All</MenuItem>
                {(field.options ?? []).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
            <TextField
              {...filterFieldProps}
              select
              label="Add-on"
              value={addon}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) => setAddon(e.target.value)}
              sx={{ minWidth: 150, flex: '1 1 150px' }}
            >
              <MenuItem value="">All</MenuItem>
              {addonOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...filterFieldProps}
              select
              label="Fulfillment"
              value={fulfillment}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) => setFulfillment(e.target.value as FulfillmentMethod | '')}
              sx={{ minWidth: 140, flex: '1 1 140px' }}
            >
              <MenuItem value="">All</MenuItem>
              {Object.entries(FULFILLMENT_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...filterFieldProps}
              select
              label="Kitchen note"
              value={notesOnly}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) => setNotesOnly(e.target.value)}
              sx={{ minWidth: 140, flex: '1 1 140px' }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="yes">Has note</MenuItem>
              <MenuItem value="no">No note</MenuItem>
            </TextField>
          </Stack>
        </Collapse>
      </FilterBar>
      <Grid container spacing={2} alignItems="flex-start">
        {COLUMNS.map((col) => {
          const cards = filtered.filter((order) => order.status === col);
          const tone = COLUMN_TONE[col];
          return (
            <Grid item xs={12} sm={6} lg={4} key={col}>
              <Stack
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: tone.wash,
                  minHeight: 420,
                }}
                gap={1.25}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone.bar }} />
                  <Typography fontWeight={800} fontSize={14}>
                    {ORDER_STATUS_LABELS[col]}
                  </Typography>
                  <Box
                    sx={{
                      ml: 'auto',
                      px: 1,
                      py: 0.15,
                      borderRadius: 99,
                      bgcolor: brand.creamPaper,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {cards.length}
                  </Box>
                </Stack>
                {cards.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    customizations={formatOrderCustomizations(order, categories)}
                    disabled={!canMove || !NEXT[order.status] || isPendingForId(updateStatus, order.id)}
                    onOpen={() => setSelected(order)}
                    onAdvance={() => void advance(order)}
                  />
                ))}
                {cards.length === 0 ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,252,250,0.7)', color: 'text.secondary' }}>
                    Empty station
                  </Box>
                ) : null}
              </Stack>
            </Grid>
          );
        })}
      </Grid>
      <ProductionOrderDialog order={selected} categories={categories} onClose={() => setSelected(null)} />
      <ConfirmDialog
        open={confirmApi.open}
        title={confirmApi.title}
        description={confirmApi.description}
        confirmLabel="Yes, move it"
        onCancel={() => confirmApi.handleClose(false)}
        onConfirm={() => confirmApi.handleClose(true)}
      />
    </Stack>
  );
}

function KanbanCard({
  order,
  customizations,
  onOpen,
  onAdvance,
  disabled,
}: {
  order: Order;
  customizations: string;
  onOpen: () => void;
  onAdvance: () => void;
  disabled: boolean;
}) {
  return (
    <Card
      onClick={onOpen}
      sx={{ border: 'none', boxShadow: '0 10px 24px rgba(28,25,23,0.06)', cursor: 'pointer' }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={800} fontSize={13}>
            {order.orderNumber}
          </Typography>
          <StatusChip status={order.source} label={order.source} />
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.75 }} fontWeight={650}>
          {order.items[0]?.productName}
        </Typography>
        {customizations ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {customizations}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary" display="block">
          {order.customerName} · {fromNow(order.promisedAt)}
        </Typography>
        <Typography fontWeight={800} sx={{ mt: 1 }}>
          {formatCurrency(order.total)}
        </Typography>
        <Button
          fullWidth
          size="small"
          sx={{ mt: 1.25 }}
          disabled={disabled}
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
        >
          {order.status === 'packed' ? 'Send to dispatch' : 'Advance'}
        </Button>
      </CardContent>
    </Card>
  );
}
