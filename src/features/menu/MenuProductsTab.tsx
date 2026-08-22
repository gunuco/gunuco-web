import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Button, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { StatusChip } from '@/components/ui/StatusChip';
import { ProductEditorDialog } from '@/features/menu/ProductEditorDialog';
import { productBasePrice } from '@/features/menu/customizationPricing';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useSaveProduct } from '@/hooks/useProducts';
import type { Product } from '@/types';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';
import { brand } from '@/theme/colors';

export function MenuProductsTab({ categoryId = '' }: { categoryId?: string }) {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const { data: categories = [] } = useCategories();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null | 'new'>(null);
  const products = useProducts({
    categoryId: categoryId || undefined,
    search: search || undefined,
  });
  const save = useSaveProduct();
  const rows = products.data ?? [];

  const list = useMemo(
    () =>
      [...rows].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)),
    [rows],
  );

  return (
    <Stack gap={1.75}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} alignItems={{ sm: 'center' }}>
        <TextField
          size="small"
          label="Search menu"
          placeholder="Name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { sm: 240 }, flex: 1 }}
        />
        {canEdit ? (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing('new')}>
            Add item
          </Button>
        ) : null}
      </Stack>
      <Stack gap={1}>
        {products.isLoading ? (
          <Typography color="text.secondary">Loading menu…</Typography>
        ) : null}
        {!products.isLoading && list.length === 0 ? (
          <Typography color="text.secondary">No items in this category.</Typography>
        ) : null}
        {list.map((product) => {
          const sub = getCategoryById(categories, product.subcategoryId)?.name ?? '—';
          return (
            <Paper
              key={product.id}
              variant="outlined"
              onClick={() => canEdit && setEditing(product)}
              sx={{
                p: 1.25,
                cursor: canEdit ? 'pointer' : 'default',
                borderRadius: 2,
                '&:hover': canEdit ? { borderColor: brand.wine, bgcolor: alpha(brand.wine, 0.03) } : undefined,
              }}
            >
              <Stack direction="row" gap={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    bgcolor: product.imageUrl ? '#111' : `hsl(${product.imageHue} 38% 28%)`,
                    backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Typography fontWeight={800} noWrap>
                      {product.name}
                    </Typography>
                    {product.featured ? <StatusChip status="active" label="Recommended" /> : null}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {sub} · {product.sku}
                    {product.description ? ` · ${product.description}` : ''}
                  </Typography>
                </Box>
                <Typography fontWeight={800} sx={{ minWidth: 88, textAlign: 'right' }}>
                  {formatCurrency(productBasePrice(product))}
                </Typography>
                <Stack
                  alignItems="center"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ minWidth: 84 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    In stock
                  </Typography>
                  <Switch
                    size="small"
                    checked={product.active}
                    disabled={!canEdit || isPendingForId(save, product.id)}
                    onChange={(_, active) => save.mutate({ id: product.id, payload: { active } })}
                  />
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
      <ProductEditorDialog
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
