import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Button, IconButton, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import {
  OfferDialog,
  emptyOfferForm,
  formFromOffer,
  type OfferForm,
} from '@/features/offers/OfferDialog';
import {
  formatAppliesTo,
  formatMinOrder,
  formatOfferReward,
  formatUsage,
  fromDateEnd,
  fromDateStart,
  plusDaysDateInput,
  todayDateInput,
} from '@/features/offers/offerUtils';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOffer, useDeleteOffer, useOffers, useUpdateOffer } from '@/hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import { useConfirm } from '@/hooks/useConfirm';
import { useUiStore } from '@/store/uiStore';
import type { Offer, OfferAppliesTo, OfferKind } from '@/types';
import { formatDate } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';

function newOfferForm(): OfferForm {
  return {
    ...emptyOfferForm,
    startsAt: todayDateInput(),
    endsAt: plusDaysDateInput(30),
  };
}

function formPayload(form: OfferForm): Partial<Offer> {
  const appliesTo = form.appliesTo;
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    kind: form.kind,
    code: form.kind === 'coupon' ? form.code.trim().toUpperCase() : '',
    reward: form.reward,
    value: Number(form.value) || 0,
    minOrderAmount: Math.max(0, Number(form.minOrderAmount) || 0),
    maxDiscount:
      form.reward === 'percent' && form.maxDiscount.trim() !== '' ? Number(form.maxDiscount) : null,
    appliesTo,
    categoryIds: appliesTo === 'category' ? form.categoryIds : [],
    productIds: appliesTo === 'product' ? form.productIds : [],
    startsAt: fromDateStart(form.startsAt || todayDateInput()),
    endsAt: fromDateEnd(form.endsAt || plusDaysDateInput(30)),
    usageLimit: form.usageLimit.trim() === '' ? null : Number(form.usageLimit),
    active: form.active,
  };
}

export function OffersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const notify = useUiStore((s) => s.notify);
  const { data: categories = [] } = useCategories();
  const productsQuery = useProducts();
  const products = productsQuery.data ?? [];
  const list = useOffers();
  const create = useCreateOffer();
  const update = useUpdateOffer();
  const remove = useDeleteOffer();
  const confirmApi = useConfirm();
  const [editing, setEditing] = useState<Offer | 'new' | null>(null);
  const [form, setForm] = useState<OfferForm>(newOfferForm);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<OfferKind | ''>('');
  const [appliesTo, setAppliesTo] = useState<OfferAppliesTo | ''>('');
  const [status, setStatus] = useState<'all' | 'active' | 'off'>('all');

  const openEditor = (row: Offer | 'new') => {
    setForm(row === 'new' ? newOfferForm() : formFromOffer(row));
    setEditing(row);
  };

  const isNew = editing === 'new';
  const saving = create.isPending || update.isPending;

  const save = () => {
    const payload = formPayload(form);
    if (!payload.name) {
      notify('Give the offer a name', 'error');
      return;
    }
    if (payload.kind === 'coupon' && !payload.code) {
      notify('Coupon needs a code', 'error');
      return;
    }
    if (!payload.value || payload.value <= 0) {
      notify('Discount must be greater than 0', 'error');
      return;
    }
    if (payload.reward === 'percent' && payload.value > 100) {
      notify('Percent cannot be more than 100', 'error');
      return;
    }
    if (payload.appliesTo === 'category' && !payload.categoryIds?.length) {
      notify('Pick at least one category', 'error');
      return;
    }
    if (payload.appliesTo === 'product' && !payload.productIds?.length) {
      notify('Pick at least one product', 'error');
      return;
    }
    if (isNew) {
      create.mutate(payload, { onSuccess: () => setEditing(null) });
      return;
    }
    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  };

  const deleteRow = async (row: Offer) => {
    const ok = await confirmApi.confirm(
      'Delete this offer?',
      `${row.name}${row.code ? ` (${row.code})` : ''} will be removed.`,
    );
    if (ok) {
      remove.mutate(row.id, { onSuccess: () => setEditing(null) });
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list.data ?? []).filter((row) => {
      if (kind && row.kind !== kind) return false;
      if (appliesTo && row.appliesTo !== appliesTo) return false;
      if (status === 'active' && !row.active) return false;
      if (status === 'off' && row.active) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [list.data, search, kind, appliesTo, status]);

  const columns: Column<Offer>[] = [
    {
      id: 'name',
      label: 'Offer',
      render: (r) => (
        <Stack gap={0.2} sx={{ minWidth: 0, width: '100%', textAlign: 'center' }}>
          <Typography fontWeight={800} fontSize={13}>
            {r.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {r.description || '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'kind',
      label: 'Type',
      render: (r) => (
        <Stack gap={0.2} sx={{ minWidth: 0, width: '100%', textAlign: 'center' }}>
          <Typography fontWeight={800} fontSize={13}>
            {r.kind === 'coupon' ? 'Coupon' : 'Automatic'}
          </Typography>
          {r.code ? (
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em' }}>
              {r.code}
            </Typography>
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'discount',
      label: 'Discount',
      render: (r) => (
        <Stack gap={0.2} sx={{ minWidth: 0, width: '100%', textAlign: 'center' }}>
          <Typography fontWeight={800} fontSize={13}>
            {formatOfferReward(r)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatMinOrder(r.minOrderAmount)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'applies',
      label: 'Applies to',
      render: (r) => (
        <Typography fontSize={13} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {formatAppliesTo(r, categories, products)}
        </Typography>
      ),
    },
    {
      id: 'when',
      label: 'Schedule',
      render: (r) => `${formatDate(r.startsAt)} – ${formatDate(r.endsAt)}`,
    },
    { id: 'use', label: 'Usage', render: (r) => formatUsage(r) },
    {
      id: 'st',
      label: 'Status',
      render: (r) => (
        <Stack direction="row" alignItems="center" justifyContent="center" gap={1} onClick={(e) => e.stopPropagation()}>
          <StatusChip status={r.active ? 'active' : 'inactive'} label={r.active ? 'Active' : 'Off'} />
          {canEdit ? (
            <Switch
              size="small"
              checked={r.active}
              disabled={isPendingForId(update, r.id)}
              onChange={(_, checked) => update.mutate({ id: r.id, payload: { active: checked } })}
            />
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'delete',
      label: '',
      noWrap: true,
      render: (r) =>
        canEdit ? (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              aria-label="Delete offer"
              disabled={isPendingForId(remove, r.id)}
              onClick={(e) => {
                e.stopPropagation();
                void deleteRow(r);
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  const showTable = list.isLoading || rows.length > 0;

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Commerce"
        title="Offers & Discounts"
        subtitle="Automatic offers and coupon codes. Min order, category, or product rules. One best offer per order — no stacking."
        actions={
          canEdit ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor('new')}>
              Add offer
            </Button>
          ) : null
        }
      />
      <Stack gap={0}>
        <FilterBar connected={showTable}>
          <TextField
            {...filterFieldProps}
            label="Search"
            placeholder="Name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            {...filterFieldProps}
            select
            label="Type"
            value={kind}
            onChange={(e) => setKind(e.target.value as OfferKind | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="automatic">Automatic</MenuItem>
            <MenuItem value="coupon">Coupon</MenuItem>
          </TextField>
          <TextField
            {...filterFieldProps}
            select
            label="Applies to"
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value as OfferAppliesTo | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="all">Entire cart</MenuItem>
            <MenuItem value="category">Category</MenuItem>
            <MenuItem value="product">Product</MenuItem>
          </TextField>
          <TextField
            {...filterFieldProps}
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'off')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="off">Off</MenuItem>
          </TextField>
        </FilterBar>
        <DataTable
          connected={showTable}
          headerFit
          minWidth={1180}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={list.isLoading ? 6 : false}
          onRowClick={(row) => openEditor(row)}
          emptyMessage="No offers match these filters."
        />
      </Stack>
      <OfferDialog
        open={Boolean(editing)}
        isNew={isNew}
        form={form}
        used={editing && editing !== 'new' ? editing.used : undefined}
        canEdit={canEdit}
        saving={saving}
        deleting={editing && editing !== 'new' ? isPendingForId(remove, editing.id) : false}
        categories={categories}
        products={products}
        onChange={(next) => setForm((current) => ({ ...current, ...next }))}
        onClose={() => setEditing(null)}
        onSave={save}
        onDelete={editing && editing !== 'new' ? () => void deleteRow(editing) : undefined}
      />
      <ConfirmDialog
        open={confirmApi.open}
        title={confirmApi.title}
        description={confirmApi.description}
        danger
        confirmLabel="Delete"
        onCancel={() => confirmApi.handleClose(false)}
        onConfirm={() => confirmApi.handleClose(true)}
      />
    </Stack>
  );
}
