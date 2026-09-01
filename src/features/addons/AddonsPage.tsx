import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, Button, Stack, Switch, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useCategories } from '@/hooks/useCategories';
import { useAddons, useCreateAddon, useUpdateAddon } from '@/hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import type { Addon } from '@/types';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';

function addonTitle(row: Addon) {
  return row.title?.trim() || row.name;
}

export function AddonsPage({ embedded = false }: { embedded?: boolean }) {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const { data: categories = [] } = useCategories();
  const list = useAddons();
  const create = useCreateAddon();
  const update = useUpdateAddon();
  const [editing, setEditing] = useState<Addon | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49');
  const [active, setActive] = useState(true);

  const openEditor = (row: Addon | 'new') => {
    if (row === 'new') {
      setTitle('');
      setDescription('');
      setPrice('49');
      setActive(true);
    } else {
      setTitle(addonTitle(row));
      setDescription(row.description ?? '');
      setPrice(String(row.price));
      setActive(row.active);
    }
    setEditing(row);
  };

  const saving = create.isPending || update.isPending;
  const isNew = editing === 'new';

  const save = () => {
    const payload = {
      name: title.trim(),
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      active,
    };
    if (isNew) {
      create.mutate(
        { ...payload, applicableCategoryIds: [] },
        { onSuccess: () => setEditing(null) },
      );
      return;
    }
    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  };

  const columns: Column<Addon>[] = [
    {
      id: 'name',
      label: 'Add-on',
      render: (r) => (
        <Stack gap={0.2} sx={{ minWidth: 0, width: '100%', textAlign: 'center' }}>
          <Typography fontWeight={800} fontSize={13}>
            {addonTitle(r)}
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
    { id: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    {
      id: 'cats',
      label: 'Applies to',
      render: (r) =>
        r.applicableCategoryIds
          .map((id) => getCategoryById(categories, id)?.name)
          .filter(Boolean)
          .join(', ') || 'All',
    },
    {
      id: 'active',
      label: 'Active',
      render: (r) => (
        <Stack direction="row" alignItems="center" justifyContent="center" gap={1} onClick={(e) => e.stopPropagation()}>
          <StatusChip status={r.active ? 'active' : 'inactive'} />
          <Switch
            size="small"
            checked={r.active}
            disabled={!canEdit || isPendingForId(update, r.id)}
            onChange={(_, checked) => update.mutate({ id: r.id, payload: { active: checked } })}
          />
        </Stack>
      ),
    },
    {
      id: 'edit',
      label: '',
      noWrap: true,
      render: (r) =>
        canEdit ? (
          <Button
            size="small"
            startIcon={<EditRoundedIcon />}
            onClick={(e) => {
              e.stopPropagation();
              openEditor(r);
            }}
          >
            Edit
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack gap={2.5}>
      {embedded ? (
        <Stack direction="row" justifyContent="flex-end">
          {canEdit ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor('new')}>
              Add
            </Button>
          ) : null}
        </Stack>
      ) : (
        <PageHeader
          title="Add-ons"
          eyebrow="Extras"
          subtitle="Title and a short description for each extra. Edit a row to update it."
          actions={
            canEdit ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor('new')}>
                Add
              </Button>
            ) : null
          }
        />
      )}
      <DataTable
        headerFit
        columns={columns}
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        loading={list.isLoading ? 5 : false}
        onRowClick={canEdit ? (row) => openEditor(row) : undefined}
        emptyMessage="No add-ons yet."
      />
      <AppModal
        open={Boolean(editing)}
        title={isNew ? 'New add-on' : 'Edit add-on'}
        onClose={() => setEditing(null)}
      >
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Sparkler candles"
          />
          <TextField
            label="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            placeholder="A short line customers see with this extra."
          />
          <TextField label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Active
            </Typography>
            <Switch size="small" checked={active} onChange={(_, on) => setActive(on)} />
          </Box>
          <Button variant="contained" disabled={!title.trim() || saving} onClick={save}>
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
          </Button>
        </Stack>
      </AppModal>
    </Stack>
  );
}
