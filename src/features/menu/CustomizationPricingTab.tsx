import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { groupsFromSchema } from '@/features/menu/customizationPricing';
import { useCategories, useUpdateCategory } from '@/hooks/useCategories';
import type { Category, CustomizationMatrix, CustomizationPriceGroup, CustomizationSwitch } from '@/types';
import { formatCurrency } from '@/utils/format';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

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

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">
        ON shows the group on the product editor with priced options. OFF hides it. Inherit uses the parent category.
        Extra rupees here become the default customization pricing for new items.
      </Typography>
      {categories
        .filter((row) => row.active)
        .map((category) => (
          <CategoryCard key={category.id} category={category} canEdit={canEdit} saving={isPendingForId(update, category.id)} onSave={(payload) => update.mutate({ id: category.id, payload })} />
        ))}
    </Stack>
  );
}

function CategoryCard({
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
    category.customizationPricing ?? groupsFromSchema(category.attributeSchema, category.customizationPricing),
  );

  useEffect(() => {
    setMatrix(category.customization);
    setPricing(category.customizationPricing ?? groupsFromSchema(category.attributeSchema, category.customizationPricing));
  }, [category]);

  return (
    <Paper variant="outlined" sx={{ p: 1.75 }}>
      <Typography fontWeight={800} fontSize={13}>
        {category.name}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.25, mb: 1.5 }}>
        {GROUPS.map((group) => (
          <TextField
            key={group.key}
            select
            size="small"
            label={group.label}
            value={matrix[group.key]}
            disabled={!canEdit}
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
          sx={{ mt: 1.5 }}
          variant="contained"
          size="small"
          disabled={saving}
          onClick={() => onSave({ customization: matrix, customizationPricing: pricing })}
        >
          Save {category.name}
        </Button>
      ) : null}
    </Paper>
  );
}
