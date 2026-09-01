import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { PhotoUploadField } from '@/features/menu/PhotoUploadField';
import { ProductPreviewCard } from '@/features/menu/ProductPreviewCard';
import {
  defaultVariants,
  groupsFromSchema,
  productBasePrice,
  productPhotos,
} from '@/features/menu/customizationPricing';
import { useAddons } from '@/hooks/useResources';
import type { Category, CustomizationPriceGroup, PriceTier, Product } from '@/types';
import { getCategoryById, getChildCategories, getParentCategories } from '@/utils/category';
import { formatCurrency } from '@/utils/format';

interface Draft {
  name: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  active: boolean;
  featured: boolean;
  imageUrl?: string;
  imageUrls: string[];
  imageHue: number;
  basePrice: number;
  variants: PriceTier[];
  groups: CustomizationPriceGroup[];
  customizationEnabled: boolean;
  addOnIds: string[];
  selected: Record<string, string>;
  selectedAmount: number | null;
}

function emptyDraft(categories: Category[]): Draft {
  const parent = getParentCategories(categories).find((row) => row.active);
  const child = parent ? getChildCategories(categories, parent.id)[0] : undefined;
  const cat = child ?? parent;
  const basePrice = 1299;
  const groups = groupsFromSchema(cat?.attributeSchema ?? [], cat?.customizationPricing);
  const selected: Record<string, string> = {};
  for (const group of groups) selected[group.key] = group.options[0]?.value ?? '';
  const variants = defaultVariants(child?.pricingModel ?? parent?.pricingModel ?? 'weight', basePrice);
  return {
    name: '',
    sku: '',
    categoryId: parent?.id ?? '',
    subcategoryId: child?.id ?? '',
    description: '',
    active: true,
    featured: false,
    imageUrls: [],
    imageHue: 18,
    basePrice,
    variants,
    groups,
    customizationEnabled: groups.length > 0,
    addOnIds: [],
    selected,
    selectedAmount: variants.find((row) => row.amount === 1)?.amount ?? variants[0]?.amount ?? 1,
  };
}

function fromProduct(product: Product, categories: Category[]): Draft {
  const child = getCategoryById(categories, product.subcategoryId);
  const basePrice = productBasePrice(product);
  const groups = groupsFromSchema(
    child?.attributeSchema ?? [],
    product.customizationGroups ?? child?.customizationPricing,
  );
  const selected: Record<string, string> = {};
  for (const group of groups) {
    const current = product.attributes[group.key];
    selected[group.key] = current != null ? String(current) : group.options[0]?.value ?? '';
  }
  const photos = productPhotos(product);
  return {
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    description: product.description,
    active: product.active,
    featured: Boolean(product.featured),
    imageUrl: photos[0],
    imageUrls: photos,
    imageHue: product.imageHue,
    basePrice,
    variants: product.priceTiers.length
      ? product.priceTiers
      : defaultVariants(child?.pricingModel ?? 'weight', basePrice),
    groups,
    customizationEnabled: product.customizationEnabled ?? groups.length > 0,
    addOnIds: product.addOnIds,
    selected,
    selectedAmount: product.priceTiers.find((row) => row.amount === 1)?.amount ?? product.priceTiers[0]?.amount ?? 1,
  };
}

export function ProductEditorDialog({
  open,
  product,
  categories,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product | null;
  categories: Category[];
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Product>) => void;
}) {
  const addons = useAddons();
  const compact = useMediaQuery('(max-width:767px)');
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(categories));

  useEffect(() => {
    if (!open) return;
    setDraft(product ? fromProduct(product, categories) : emptyDraft(categories));
  }, [open, product, categories]);

  const children = getChildCategories(categories, draft.categoryId);
  const subcategory = getCategoryById(categories, draft.subcategoryId);
  const applicable = (addons.data ?? []).filter(
    (row) =>
      row.active &&
      (!row.applicableCategoryIds.length ||
        row.applicableCategoryIds.includes(draft.subcategoryId) ||
        row.applicableCategoryIds.includes(draft.categoryId)),
  );
  const selectedAddOns = applicable.filter((row) => draft.addOnIds.includes(row.id));

  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  const applyCategory = (categoryId: string, subcategoryId: string) => {
    const cat = getCategoryById(categories, subcategoryId) ?? getCategoryById(categories, categoryId);
    const groups = groupsFromSchema(cat?.attributeSchema ?? [], cat?.customizationPricing);
    const selected: Record<string, string> = {};
    for (const group of groups) selected[group.key] = group.options[0]?.value ?? '';
    const variants = defaultVariants(cat?.pricingModel ?? 'weight', draft.basePrice);
    patch({
      categoryId,
      subcategoryId,
      groups,
      selected,
      variants,
      customizationEnabled: groups.length > 0,
      selectedAmount: variants.find((row) => row.amount === 1)?.amount ?? variants[0]?.amount ?? null,
    });
  };

  const save = () => {
    const attributes: Record<string, string> = { ...draft.selected };
    const variant = draft.variants.find((row) => row.amount === draft.selectedAmount);
    if (variant) attributes.weightKg = String(variant.amount);
    onSave({
      name: draft.name.trim(),
      sku: draft.sku.trim(),
      categoryId: draft.categoryId,
      subcategoryId: draft.subcategoryId,
      description: draft.description.trim(),
      active: draft.active,
      featured: draft.featured,
      imageUrl: draft.imageUrls[0],
      imageUrls: draft.imageUrls,
      imageHue: draft.imageHue,
      basePrice: Number(draft.basePrice) || 0,
      priceTiers: draft.variants.filter((row) => row.label && !Number.isNaN(row.price)),
      customizationEnabled: draft.customizationEnabled,
      customizationGroups: draft.groups,
      addOnIds: draft.addOnIds,
      attributes,
    });
  };

  const baseHelper = useMemo(() => {
    const model = subcategory?.pricingModel ?? 'weight';
    if (model === 'weight') return 'Selling price for 1 kg. Variant rows can override other weights.';
    if (model === 'pack') return 'Selling price for the default pack. Other pack sizes sit in variants.';
    if (model === 'size') return 'Selling price for the regular size.';
    return 'Selling price per unit.';
  }, [subcategory?.pricingModel]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      fullScreen={compact}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {product ? 'Update menu item' : 'Add menu item'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Stack gap={2.25}>
              <PhotoUploadField
                values={draft.imageUrls}
                hue={draft.imageHue}
                onChange={(imageUrls) => patch({ imageUrls, imageUrl: imageUrls[0] })}
              />
              <TextField
                label="Item name"
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                required
              />
              <TextField
                label="Description"
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                multiline
                minRows={2}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                <TextField label="SKU" value={draft.sku} onChange={(e) => patch({ sku: e.target.value })} fullWidth />
                <TextField
                  select
                  label="Category"
                  value={draft.categoryId}
                  onChange={(e) => {
                    const first = getChildCategories(categories, e.target.value)[0];
                    applyCategory(e.target.value, first?.id ?? '');
                  }}
                  fullWidth
                >
                  {getParentCategories(categories)
                    .filter((row) => row.active)
                    .map((row) => (
                      <MenuItem key={row.id} value={row.id}>
                        {row.name}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  select
                  label="Subcategory"
                  value={draft.subcategoryId}
                  onChange={(e) => applyCategory(draft.categoryId, e.target.value)}
                  fullWidth
                >
                  {children.map((row) => (
                    <MenuItem key={row.id} value={row.id}>
                      {row.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction="row" gap={2}>
                <FormControlLabel
                  control={<Switch checked={draft.active} onChange={(_, on) => patch({ active: on })} />}
                  label="In stock"
                />
                <FormControlLabel
                  control={<Switch checked={draft.featured} onChange={(_, on) => patch({ featured: on })} />}
                  label="Recommended"
                />
              </Stack>

              <Divider />
              <Typography fontWeight={800}>Base price</Typography>
              <Typography variant="body2" color="text.secondary">
                {baseHelper} Customization extras are added on top of the selected variant.
              </Typography>
              <TextField
                label="Base price (₹)"
                type="number"
                value={draft.basePrice}
                onChange={(e) => {
                  const basePrice = Number(e.target.value) || 0;
                  const variants = draft.variants.map((row) =>
                    row.amount === 1 ? { ...row, price: basePrice } : row,
                  );
                  patch({ basePrice, variants });
                }}
                sx={{ maxWidth: 220 }}
              />

              <Typography fontWeight={800}>Variants</Typography>
              <Typography variant="body2" color="text.secondary">
                Each size / weight has its own selling price. This is the catalogue matrix, not a text dump.
              </Typography>
              {draft.variants.map((row, index) => (
                <Stack key={row.id} direction="row" gap={1} alignItems="center">
                  <TextField
                    label="Label"
                    value={row.label}
                    onChange={(e) => {
                      const variants = draft.variants.map((item, i) =>
                        i === index ? { ...item, label: e.target.value } : item,
                      );
                      patch({ variants });
                    }}
                    sx={{ flex: 1.2 }}
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={row.amount}
                    onChange={(e) => {
                      const variants = draft.variants.map((item, i) =>
                        i === index ? { ...item, amount: Number(e.target.value) } : item,
                      );
                      patch({ variants });
                    }}
                    sx={{ width: 110 }}
                  />
                  <TextField
                    label="Price (₹)"
                    type="number"
                    value={row.price}
                    onChange={(e) => {
                      const variants = draft.variants.map((item, i) =>
                        i === index ? { ...item, price: Number(e.target.value) } : item,
                      );
                      patch({ variants });
                    }}
                    sx={{ width: 140 }}
                  />
                  <IconButton
                    onClick={() => patch({ variants: draft.variants.filter((_, i) => i !== index) })}
                    aria-label="Remove variant"
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  patch({
                    variants: [
                      ...draft.variants,
                      {
                        id: `v${Date.now()}`,
                        label: 'New size',
                        amount: draft.variants.length + 1,
                        price: draft.basePrice,
                      },
                    ],
                  })
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                Add variant
              </Button>

              <Divider />
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1}>
                <Stack gap={0.35}>
                  <Typography fontWeight={800}>Customization</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uses the options already defined for this category. Extra ₹ sits on top of the selected variant.
                  </Typography>
                </Stack>
                <FormControlLabel
                  sx={{ ml: { sm: 1 }, flexShrink: 0 }}
                  control={
                    <Switch
                      checked={draft.customizationEnabled}
                      onChange={(_, on) => patch({ customizationEnabled: on })}
                    />
                  }
                  label={draft.customizationEnabled ? 'Apply rules on' : 'Apply rules off'}
                />
              </Stack>
              {!draft.customizationEnabled ? (
                <Typography variant="body2" color="text.secondary">
                  Customization rules are off for this item. Customers will only pick size / variant.
                </Typography>
              ) : draft.groups.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No customization options are defined for this category yet.
                </Typography>
              ) : (
                draft.groups.map((group, gi) => {
                  const on = group.enabled !== false;
                  return (
                    <Stack
                      key={group.key}
                      gap={1}
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        opacity: on ? 1 : 0.55,
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                        <Typography fontWeight={800} fontSize={13}>
                          {group.label}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={on}
                              onChange={(_, enabled) => {
                                const groups = draft.groups.map((g, i) => (i === gi ? { ...g, enabled } : g));
                                patch({ groups });
                              }}
                            />
                          }
                          label={on ? 'On' : 'Off'}
                        />
                      </Stack>
                      {group.options.map((option, oi) => (
                        <Stack key={option.value} direction="row" gap={1} alignItems="center">
                          <Typography sx={{ flex: 1 }} variant="body2">
                            {option.label}
                          </Typography>
                          <TextField
                            size="small"
                            label="Extra ₹"
                            type="number"
                            disabled={!on}
                            value={option.extraPrice}
                            onChange={(e) => {
                              const extraPrice = Number(e.target.value) || 0;
                              const groups = draft.groups.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      options: g.options.map((row, j) => (j === oi ? { ...row, extraPrice } : row)),
                                    }
                                  : g,
                              );
                              patch({ groups });
                            }}
                            sx={{ width: 120 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  );
                })
              )}

              <Divider />
              <Typography fontWeight={800}>Add-ons</Typography>
              <Typography variant="body2" color="text.secondary">
                Tick extras customers can add with this item.
              </Typography>
              <Stack>
                {applicable.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No add-ons for this category yet. Create them in the Add-ons tab.
                  </Typography>
                ) : null}
                {applicable.map((row) => (
                  <FormControlLabel
                    key={row.id}
                    sx={{ alignItems: 'flex-start', ml: 0, mr: 0 }}
                    control={
                      <Checkbox
                        checked={draft.addOnIds.includes(row.id)}
                        onChange={(_, on) =>
                          patch({
                            addOnIds: on
                              ? [...draft.addOnIds, row.id]
                              : draft.addOnIds.filter((id) => id !== row.id),
                          })
                        }
                      />
                    }
                    label={
                      <Stack gap={0.15}>
                        <Typography fontSize={13} fontWeight={700}>
                          {row.title || row.name} · {formatCurrency(row.price)}
                        </Typography>
                        {row.description ? (
                          <Typography variant="caption" color="text.secondary">
                            {row.description}
                          </Typography>
                        ) : null}
                      </Stack>
                    }
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <ProductPreviewCard
              name={draft.name}
              description={draft.description}
              imageUrls={draft.imageUrls}
              hue={draft.imageHue}
              basePrice={draft.basePrice}
              variants={draft.variants}
              selectedAmount={draft.selectedAmount}
              onSelectAmount={(selectedAmount) => patch({ selectedAmount })}
              groups={
                draft.customizationEnabled
                  ? draft.groups.filter((group) => group.enabled !== false)
                  : []
              }
              selected={draft.selected}
              onSelectOption={(key, value) => patch({ selected: { ...draft.selected, [key]: value } })}
              addOns={selectedAddOns}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!draft.name.trim() || saving} onClick={save}>
          {saving ? 'Saving…' : product ? 'Save item' : 'Add to menu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
