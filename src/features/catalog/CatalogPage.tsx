import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { ProductForm } from '@/features/catalog/ProductForm';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useSaveProduct } from '@/hooks/useProducts';
import type { Product } from '@/types';
import { catalogNavLabel, getCategoryById, getParentCategories } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

export function CatalogPage({
  embedded = false,
  categoryId: categoryIdProp,
}: {
  embedded?: boolean;
  categoryId?: string;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const { data: categories = [] } = useCategories();
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null | 'new'>(null);
  const treeFilter = embedded && categoryIdProp !== undefined;
  const activeCategoryId = treeFilter ? categoryIdProp : categoryId;

  const products = useProducts({
    categoryId: activeCategoryId || undefined,
    search: search || undefined,
  });
  const save = useSaveProduct();

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Product',
        render: (row) => (
          <Stack>
            <Typography fontWeight={700}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.sku}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'cat',
        label: 'Subcategory',
        render: (row) => getCategoryById(categories, row.subcategoryId)?.name ?? '—',
      },
      {
        id: 'price',
        label: 'From',
        render: (row) => formatCurrency(Math.min(...row.priceTiers.map((t) => t.price))),
      },
      {
        id: 'tags',
        label: 'Tags',
        render: (row) => (
          <Stack direction="row" gap={0.5}>
            {row.tags.map((t) => (
              <Chip key={t} size="small" label={t} />
            ))}
          </Stack>
        ),
      },
      {
        id: 'active',
        label: 'Status',
        render: (row) => (
          <StatusChip status={row.active ? 'active' : 'inactive'} label={row.active ? 'Active' : 'Hidden'} />
        ),
      },
    ],
    [categories],
  );

  return (
    <Stack gap={2.5}>
      {embedded ? (
        <Stack direction="row" justifyContent="flex-end">
          {canEdit ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing('new')}>
              Add product
            </Button>
          ) : null}
        </Stack>
      ) : (
      <PageHeader
        title={catalogNavLabel(categories)}
        eyebrow="Menu"
        subtitle="Attribute fields come from the selected subcategory schema — Coffee/Pizza/Burgers will render automatically when activated."
        actions={
          canEdit ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing('new')}>
              Add product
            </Button>
          ) : null
        }
      />
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        {treeFilter ? null : (
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All live categories</MenuItem>
            {getParentCategories(categories)
              .filter((c) => c.active)
              .flatMap((parent) =>
                categories
                  .filter((c) => c.parentId === parent.id)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {parent.name} / {c.name}
                    </MenuItem>
                  )),
              )}
          </TextField>
        )}
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Stack>
      <DataTable
        columns={columns}
        rows={products.data ?? []}
        rowKey={(r) => r.id}
        loading={products.isLoading ? 6 : false}
        onRowClick={(row) => canEdit && setEditing(row)}
      />
      <ProductForm
        open={editing !== null}
        product={editing === 'new' ? null : editing}
        categories={categories}
        saving={save.isPending}
        onClose={() => setEditing(null)}
        onSave={(payload) =>
          save.mutate(
            { id: editing === 'new' ? undefined : editing?.id, payload },
            { onSuccess: () => setEditing(null) },
          )
        }
      />
    </Stack>
  );
}
