import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { SCHEMA_LIBRARY } from '@/config/categorySchemas';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useConfirm } from '@/hooks/useConfirm';
import type { Category } from '@/types';
import { buildCategoryTree } from '@/utils/category';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

export function CategoriesPage({ embedded = false }: { embedded?: boolean }) {
  const { data: categories = [], isLoading } = useCategories();
  const update = useUpdateCategory();
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const confirmApi = useConfirm();
  const create = useCreateCategory();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [schemaKey, setSchemaKey] = useState('cake');

  const tree = buildCategoryTree(categories);

  return (
    <Stack gap={2.5}>
      {embedded ? null : (
        <PageHeader
          title="Categories & subcategories"
          eyebrow="Taxonomy"
          subtitle="Hierarchy is data. Activate Coffee, Pizza or Burgers — screens already know how to render their schemas."
          actions={
            canEdit ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
                Add category
              </Button>
            ) : null
          }
        />
      )}
      {isLoading ? <Typography color="text.secondary">Loading tree…</Typography> : null}
      <Stack gap={1.5}>
        {tree.map((parent) => (
          <Paper key={parent.id} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <IconButton
                size="small"
                onClick={() => setOpenId((id) => (id === parent.id ? null : parent.id))}
              >
                <ExpandMoreRoundedIcon
                  sx={{ transform: openId === parent.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={800}>{parent.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {parent.description}
                </Typography>
              </Box>
              <Chip size="small" label={parent.pricingModel} />
              <StatusChip status={parent.active ? 'active' : 'inactive'} label={parent.active ? 'Active' : 'Off'} />
              {canEdit ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(parent);
                    setName(parent.name);
                    setDescription(parent.description);
                  }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              ) : null}
              <Switch
                checked={parent.active}
                disabled={!canEdit || update.isPending}
                onChange={async (_, checked) => {
                  if (!checked) {
                    const ok = await confirmApi.confirm(
                      `Deactivate ${parent.name}?`,
                      'It will disappear from catalogue, POS and order filters.',
                    );
                    if (!ok) return;
                  }
                  update.mutate({ id: parent.id, payload: { active: checked } });
                }}
              />
            </Stack>
            <Collapse in={openId === parent.id || parent.children.length > 0}>
              <Stack sx={{ pl: 6, pt: 1.5 }} gap={1}>
                {parent.children.map((child) => (
                  <Stack
                    key={child.id}
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.default' }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{child.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {child.attributeSchema.length} attribute fields · {child.orderMode} mode
                      </Typography>
                    </Box>
                    <StatusChip status={child.active ? 'active' : 'inactive'} />
                    {canEdit ? (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(child);
                          setName(child.name);
                          setDescription(child.description);
                        }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                    <Switch
                      size="small"
                      checked={child.active}
                      disabled={!canEdit}
                      onChange={(_, checked) => update.mutate({ id: child.id, payload: { active: checked } })}
                    />
                  </Stack>
                ))}
              </Stack>
            </Collapse>
          </Paper>
        ))}
      </Stack>
      <AppModal open={creating} title="Add category" onClose={() => setCreating(false)}>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            select
            label="Parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">None (top-level)</option>
            {tree.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Attribute schema"
            value={schemaKey}
            onChange={(e) => setSchemaKey(e.target.value)}
            SelectProps={{ native: true }}
            helperText="Schemas live in config. Add a new key there to support a future vertical."
          >
            {Object.keys(SCHEMA_LIBRARY).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={!name || create.isPending}
            onClick={() =>
              create.mutate(
                {
                  name,
                  parentId: parentId || null,
                  attributeSchema: SCHEMA_LIBRARY[schemaKey],
                  active: false,
                } as Partial<Category>,
                {
                  onSuccess: () => {
                    setCreating(false);
                    setName('');
                  },
                },
              )
            }
          >
            Create (starts inactive)
          </Button>
        </Stack>
      </AppModal>
      <AppModal open={Boolean(editing)} title="Edit category" onClose={() => setEditing(null)}>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Button
            variant="contained"
            disabled={!name || update.isPending}
            onClick={() => {
              if (!editing) return;
              update.mutate(
                { id: editing.id, payload: { name, description } },
                { onSuccess: () => setEditing(null) },
              );
            }}
          >
            Save
          </Button>
        </Stack>
      </AppModal>
      <ConfirmDialog
        open={confirmApi.open}
        title={confirmApi.title}
        description={confirmApi.description}
        danger
        confirmLabel="Deactivate"
        onCancel={() => confirmApi.handleClose(false)}
        onConfirm={() => confirmApi.handleClose(true)}
      />
    </Stack>
  );
}
