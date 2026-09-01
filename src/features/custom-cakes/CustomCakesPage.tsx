import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { CustomizationsCell } from '@/components/orders/CustomerCell';
import { HighlightName } from '@/components/orders/HighlightName';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { CUSTOM_CAKE_STATUS_LABELS } from '@/constants/status';
import {
  CustomCakeDialog,
  emptyCakeForm,
  formFromCake,
  type CakeForm,
} from '@/features/custom-cakes/CustomCakeDialog';
import { customerIdFromPhone } from '@/features/support/customerLookup';
import {
  useCreateCustomCake,
  useCustomCakes,
  useDeleteCustomCake,
  useUpdateCustomCake,
} from '@/hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import { useConfirm } from '@/hooks/useConfirm';
import type { CustomCakeRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';

export function CustomCakesPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const list = useCustomCakes();
  const create = useCreateCustomCake();
  const update = useUpdateCustomCake();
  const remove = useDeleteCustomCake();
  const confirmApi = useConfirm();
  const [editing, setEditing] = useState<CustomCakeRequest | 'new' | null>(null);
  const [form, setForm] = useState<CakeForm>(emptyCakeForm);

  const openEditor = (row: CustomCakeRequest | 'new') => {
    setForm(row === 'new' ? emptyCakeForm : formFromCake(row));
    setEditing(row);
  };

  const isNew = editing === 'new';
  const saving = create.isPending || update.isPending;

  const payload = () => ({
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    occasion: form.occasion.trim(),
    flavour: form.flavour.trim(),
    weightKg: Number(form.weightKg) || 1,
    notes: form.notes.trim(),
    quotedPrice: form.quotedPrice.trim() === '' ? null : Number(form.quotedPrice),
    status: form.status,
  });

  const save = () => {
    if (isNew) {
      create.mutate(payload(), { onSuccess: () => setEditing(null) });
      return;
    }
    if (editing) {
      update.mutate({ id: editing.id, payload: payload() }, { onSuccess: () => setEditing(null) });
    }
  };

  const deleteRow = async (row: CustomCakeRequest) => {
    const ok = await confirmApi.confirm(
      'Delete this enquiry?',
      `${row.customerName} · ${row.occasion} will be removed.`,
    );
    if (ok) {
      remove.mutate(row.id, { onSuccess: () => setEditing(null) });
    }
  };

  const columns: Column<CustomCakeRequest>[] = [
    {
      id: 'cid',
      label: 'Customer ID',
      render: (r) => (
        <Typography fontWeight={800} fontSize={13.5}>
          {customerIdFromPhone(r.phone, r.customerName)}
        </Typography>
      ),
    },
    { id: 'customer', label: 'Customer', render: (r) => <HighlightName value={r.customerName} tone="wine" /> },
    { id: 'occasion', label: 'Occasion', render: (r) => r.occasion },
    { id: 'flavour', label: 'Flavour', render: (r) => r.flavour },
    { id: 'weight', label: 'Weight', render: (r) => `${r.weightKg} kg` },
    {
      id: 'quote',
      label: 'Quote',
      render: (r) => (r.quotedPrice ? formatCurrency(r.quotedPrice) : '—'),
    },
    {
      id: 'status',
      label: 'Status',
      render: (r) => <StatusChip status={r.status} label={CUSTOM_CAKE_STATUS_LABELS[r.status]} />,
    },
    { id: 'date', label: 'Received', render: (r) => formatDate(r.createdAt) },
    {
      id: 'option',
      label: 'Selected option',
      render: (r) => <CustomizationsCell value={r.notes} />,
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
              aria-label="Delete enquiry"
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

  return (
    <Stack gap={2.5}>
      <PageHeader
        title="Custom cakes"
        eyebrow="Atelier"
        subtitle="Click a row to view and edit. Delete from the row icon or inside the popup."
        actions={
          canEdit ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor('new')}>
              Add enquiry
            </Button>
          ) : null
        }
      />
      <DataTable
        headerFit
        minWidth={1180}
        columns={columns}
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        loading={list.isLoading ? 6 : false}
        onRowClick={(row) => openEditor(row)}
        emptyMessage="No custom cake enquiries yet."
      />
      <CustomCakeDialog
        open={Boolean(editing)}
        isNew={isNew}
        form={form}
        receivedAt={editing && editing !== 'new' ? editing.createdAt : undefined}
        canEdit={canEdit}
        saving={saving}
        deleting={editing && editing !== 'new' ? isPendingForId(remove, editing.id) : false}
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
