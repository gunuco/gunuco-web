import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Button, Collapse, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FilterBar, filterFieldProps, filterSelectMenuProps } from '@/components/ui/FilterBar';
import { groupsFromSchema } from '@/features/menu/customizationPricing';
import { useCategories, useUpdateCategory } from '@/hooks/useCategories';
import type { Category, CustomizationMatrix, CustomizationPriceGroup, CustomizationSwitch } from '@/types';
import { formatCurrency } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';
import { getParentCategories } from '@/utils/category';
import { brand } from '@/theme/colors';

const GROUPS: Array<{ key: keyof CustomizationMatrix; label: string }> = [
  { key: 'flavour', label: 'Flavour' },
  { key: 'egg', label: 'Egg / eggless' },
  { key: 'sweetener', label: 'Sugar type' },
  { key: 'flour', label: 'Flour type' },
  { key: 'size', label: 'Size / weight' },
];

export function CustomizationPricingTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const { data: categories = [] } = useCategories();
  const update = useUpdateCategory();
  const [categoryId, setCategoryId] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const parents = getParentCategories(categories).filter((row) => row.active);
  const rows = useMemo(() => {
    return categories.filter((row) => {
      if (!row.active) return false;
      if (!categoryId) return true;
      return row.id === categoryId || row.parentId === categoryId;
    });
  }, [categories, categoryId]);

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">
        Open one category to edit. ON shows the group on the product. Extra rupees become the default for new items.
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
            setOpenId(null);
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          {parents.map((row) => (
            <MenuItem key={row.id} value={row.id}>
              {row.name}
            </MenuItem>
          ))}
        </TextField>
      </FilterBar>
      {rows.map((category) => {
        const open = openId === category.id;
        const optionCount = groupsFromSchema(category.attributeSchema, category.customizationPricing).reduce(
          (sum, group) => sum + group.options.length,
          0,
        );
        return (
          <Paper key={category.id} variant="outlined" sx={{ overflow: 'hidden' }}>
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              onClick={() => setOpenId(open ? null : category.id)}
              sx={{ px: 1.5, py: 1.15, cursor: 'pointer', '&:hover': { bgcolor: brand.wash } }}
            >
              <IconButton size="small" aria-label={open ? 'Collapse' : 'Expand'}>
                <ExpandMoreRoundedIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontWeight={800} fontSize={13}>
                  {category.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {optionCount ? `${optionCount} priced options` : 'No priced fields'}
                </Typography>
              </Box>
            </Stack>
            <Collapse in={open} unmountOnExit>
              <Box sx={{ px: 1.75, pb: 1.75, pt: 0.5, borderTop: `1px solid ${brand.line}` }}>
                <CategoryEditor
                  category={category}
                  canEdit={canEdit}
                  saving={isPendingForId(update, category.id)}
                  onSave={(payload) => update.mutate({ id: category.id, payload })}
                />
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}

function CategoryEditor({
  category,
  canEdit,
  saving,
  onSave,
}: {
  category: Category;
  canEdit: boolean;
  saving: boolean;
  onSave: (payload: Partial<Category>) => void;
}) {
  const [matrix, setMatrix] = useState<CustomizationMatrix>(category.customization);
  const [pricing, setPricing] = useState<CustomizationPriceGroup[]>(
    () => category.customizationPricing ?? groupsFromSchema(category.attributeSchema, category.customizationPricing),
  );

  useEffect(() => {
    setMatrix(category.customization);
    setPricing(category.customizationPricing ?? groupsFromSchema(category.attributeSchema, category.customizationPricing));
  }, [category]);

  return (
    <Stack gap={1.5}>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {GROUPS.map((group) => (
          <TextField
            key={group.key}
            select
            size="small"
            label={group.label}
            value={matrix[group.key]}
            disabled={!canEdit}
            SelectProps={filterSelectMenuProps}
            onChange={(e) => setMatrix((current) => ({ ...current, [group.key]: e.target.value as CustomizationSwitch }))}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="on">ON</MenuItem>
            <MenuItem value="off">OFF</MenuItem>
            <MenuItem value="inherit">Inherit</MenuItem>
          </TextField>
        ))}
      </Stack>
      {pricing.length ? (
        <Stack gap={1.25}>
          {pricing.map((group, gi) => (
            <Stack key={group.key} gap={0.75}>
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                {group.label} extras
              </Typography>
              {group.options.map((option, oi) => (
                <Stack key={option.value} direction="row" gap={1} alignItems="center">
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {option.label}
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    label="Extra ₹"
                    value={option.extraPrice}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const extraPrice = Number(e.target.value) || 0;
                      setPricing((current) =>
                        current.map((g, i) =>
                          i === gi
                            ? { ...g, options: g.options.map((row, j) => (j === oi ? { ...row, extraPrice } : row)) }
                            : g,
                        ),
                      );
                    }}
                    sx={{ width: 120 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ width: 72 }}>
                    {option.extraPrice ? `+${formatCurrency(option.extraPrice)}` : 'included'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No priced customization fields on this category.
        </Typography>
      )}
      {canEdit ? (
        <Button
          variant="contained"
          size="small"
          disabled={saving}
          onClick={() => onSave({ customization: matrix, customizationPricing: pricing })}
          sx={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : `Save ${category.name}`}
        </Button>
      ) : null}
    </Stack>
  );
}
