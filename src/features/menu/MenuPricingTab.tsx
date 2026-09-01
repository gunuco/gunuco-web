import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { FilterBar, filterFieldProps, filterSelectMenuProps } from '@/components/ui/FilterBar';
import { ProductEditorDialog } from '@/features/menu/ProductEditorDialog';
import { productBasePrice } from '@/features/menu/customizationPricing';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useSaveProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { brand } from '@/theme/colors';
import type { Product } from '@/types';
import { getCategoryById, getChildCategories, getParentCategories } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { canManageCatalog } from '@/utils/permissions';

export function MenuPricingTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const { data: categories = [] } = useCategories();
  const products = useProducts();
  const save = useSaveProduct();
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);

  const parents = getParentCategories(categories).filter((row) => row.active);
  const children = categoryId ? getChildCategories(categories, categoryId) : [];

  const inCategory = useMemo(() => {
    return (products.data ?? []).filter((product) => {
      if (categoryId && product.categoryId !== categoryId && product.subcategoryId !== categoryId) return false;
      if (subcategoryId && product.subcategoryId !== subcategoryId) return false;
      return true;
    });
  }, [products.data, categoryId, subcategoryId]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inCategory
      .filter((product) => {
        if (productId && product.id !== productId) return false;
        if (!q) return true;
        return product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inCategory, productId, search]);

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">
        Filter by category or product, then edit to change base price, variants, and customization extras.
      </Typography>
      <FilterBar>
        <TextField
          {...filterFieldProps}
          select
          label="Category"
          value={categoryId}
          SelectProps={filterSelectMenuProps}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId('');
            setProductId('');
          }}
          sx={{ minWidth: 180 }}
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
          SelectProps={filterSelectMenuProps}
          disabled={!categoryId}
          onChange={(e) => {
            setSubcategoryId(e.target.value);
            setProductId('');
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {children.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          select
          label="Product"
          value={productId}
          SelectProps={filterSelectMenuProps}
          onChange={(e) => setProductId(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          {inCategory.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...filterFieldProps}
          label="Search"
          placeholder="Product name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, flex: { sm: '1 1 220px' } }}
        />
      </FilterBar>
      {products.isLoading ? <Typography color="text.secondary">Loading prices…</Typography> : null}
      {!products.isLoading && list.length === 0 ? (
        <Typography color="text.secondary">No products match those filters.</Typography>
      ) : null}
      <Grid container spacing={2} alignItems="stretch">
        {list.map((product) => {
          const extras =
            product.customizationEnabled === false
              ? []
              : (product.customizationGroups ?? []).flatMap((group) =>
                  group.enabled === false ? [] : group.options.filter((row) => row.extraPrice > 0),
                );
          const categoryName = getCategoryById(categories, product.subcategoryId)?.name ?? '—';
          return (
            <Grid item xs={12} sm={6} lg={4} key={product.id} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{
                  width: '100%',
                  height: 340,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  bgcolor: brand.creamPaper,
                  border: `1px solid ${alpha(brand.gold, 0.42)}`,
                  boxShadow: `0 10px 28px ${alpha(brand.wine, 0.08)}`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap={1}
                  sx={{
                    px: 1.75,
                    py: 1.35,
                    bgcolor: brand.wine,
                    borderBottom: `2px solid ${brand.gold}`,
                    minHeight: 76,
                  }}
                >
                  <Stack gap={0.2} sx={{ minWidth: 0 }}>
                    <Typography
                      fontWeight={800}
                      noWrap
                      title={product.name}
                      sx={{ color: brand.cream, fontSize: 15 }}
                    >
                      {product.name}
                    </Typography>
                    <Typography noWrap variant="caption" sx={{ color: brand.goldLight }}>
                      {categoryName} · {product.sku}
                    </Typography>
                  </Stack>
                  {canEdit ? (
                    <Button
                      size="small"
                      startIcon={<EditRoundedIcon />}
                      onClick={() => setEditing(product)}
                      sx={{
                        flexShrink: 0,
                        color: brand.wine,
                        bgcolor: brand.goldLight,
                        fontWeight: 800,
                        '&:hover': { bgcolor: brand.gold, color: brand.wineDark },
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                </Stack>
                <CardContent
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    bgcolor: brand.wash,
                    p: 1.75,
                    '&:last-child': { pb: 1.75 },
                  }}
                >
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1.1,
                      py: 0.45,
                      borderRadius: 1.25,
                      bgcolor: alpha(brand.gold, 0.22),
                      border: `1px solid ${alpha(brand.gold, 0.45)}`,
                    }}
                  >
                    <Typography fontWeight={800} sx={{ color: brand.goldDark, fontSize: 13, lineHeight: 1.3 }}>
                      Base {formatCurrency(productBasePrice(product))}
                    </Typography>
                  </Box>
                  <Stack
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflow: 'auto',
                      pr: 0.5,
                      gap: 0.45,
                    }}
                  >
                    {product.priceTiers.map((tier) => (
                      <Stack
                        key={tier.id}
                        direction="row"
                        justifyContent="space-between"
                        sx={{
                          px: 1,
                          py: 0.45,
                          borderRadius: 1,
                          bgcolor: brand.creamPaper,
                          border: `1px solid ${brand.line}`,
                        }}
                      >
                        <Typography variant="body2">{tier.label}</Typography>
                        <Typography fontWeight={800} sx={{ color: brand.wine }}>
                          {formatCurrency(tier.price)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ minHeight: 28, maxHeight: 56, overflow: 'hidden' }}>
                    {extras.length ? (
                      extras.map((row) => (
                        <Chip
                          key={`${product.id}-${row.value}`}
                          size="small"
                          label={`${row.label} +${formatCurrency(row.extraPrice)}`}
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            bgcolor: alpha(brand.wine, 0.08),
                            color: brand.wine,
                            border: `1px solid ${alpha(brand.wine, 0.16)}`,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No paid extras
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <ProductEditorDialog
        open={Boolean(editing)}
        product={editing}
        categories={categories}
        saving={save.isPending}
        onClose={() => setEditing(null)}
        onSave={(payload) =>
          save.mutate(
            { id: editing?.id, payload },
            { onSuccess: () => setEditing(null) },
          )
        }
      />
    </Stack>
  );
}
