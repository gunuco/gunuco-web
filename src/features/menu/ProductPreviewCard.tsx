import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Addon, CustomizationPriceGroup, PriceTier } from '@/types';
import { brand } from '@/theme/colors';
import { formatCurrency } from '@/utils/format';
import { previewTotal } from '@/features/menu/customizationPricing';

export function ProductPreviewCard({
  name,
  description,
  imageUrl,
  hue,
  basePrice,
  variants,
  selectedAmount,
  onSelectAmount,
  groups,
  selected,
  onSelectOption,
  addOns,
}: {
  name: string;
  description: string;
  imageUrl?: string;
  hue: number;
  basePrice: number;
  variants: PriceTier[];
  selectedAmount: number | null;
  onSelectAmount: (amount: number) => void;
  groups: CustomizationPriceGroup[];
  selected: Record<string, string>;
  onSelectOption: (key: string, value: string) => void;
  addOns: Addon[];
}) {
  const quote = previewTotal(
    basePrice,
    variants,
    selectedAmount,
    groups,
    selected,
    addOns.reduce((sum, row) => sum + row.price, 0),
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: { lg: 'sticky' },
        top: 16,
        bgcolor: brand.creamPaper,
      }}
    >
      <Box
        sx={{
          height: 168,
          bgcolor: imageUrl ? '#111' : `hsl(${hue} 38% 28%)`,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Stack gap={1.25} sx={{ p: 2 }}>
        <Typography variant="caption" fontWeight={800} sx={{ color: brand.goldDark, letterSpacing: '0.08em' }}>
          CUSTOMER PREVIEW
        </Typography>
        <Typography fontWeight={800} fontSize={18} lineHeight={1.25}>
          {name || 'Untitled item'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description || 'Description appears here as you type.'}
        </Typography>
        {variants.length ? (
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {variants.map((row) => {
              const on = (selectedAmount ?? variants[0]?.amount) === row.amount;
              return (
                <Chip
                  key={row.id}
                  size="small"
                  label={`${row.label} · ${formatCurrency(row.price)}`}
                  onClick={() => onSelectAmount(row.amount)}
                  sx={{
                    fontWeight: 700,
                    bgcolor: on ? alpha(brand.wine, 0.12) : undefined,
                    border: on ? `1px solid ${brand.wine}` : undefined,
                    color: on ? brand.wine : undefined,
                  }}
                />
              );
            })}
          </Stack>
        ) : null}
        {groups.map((group) => (
          <Stack key={group.key} gap={0.5}>
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              {group.label}
              {group.required ? ' *' : ''}
            </Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {group.options.map((option) => {
                const on = selected[group.key] === option.value;
                return (
                  <Chip
                    key={option.value}
                    size="small"
                    variant={on ? 'filled' : 'outlined'}
                    label={
                      option.extraPrice
                        ? `${option.label} +${formatCurrency(option.extraPrice)}`
                        : option.label
                    }
                    onClick={() => onSelectOption(group.key, option.value)}
                  />
                );
              })}
            </Stack>
          </Stack>
        ))}
        {addOns.length ? (
          <Typography variant="caption" color="text.secondary">
            Add-ons: {addOns.map((row) => row.name).join(', ')}
          </Typography>
        ) : null}
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Item total</Typography>
          <Typography fontWeight={800} fontSize={18}>
            {formatCurrency(quote.total)}
          </Typography>
        </Stack>
        {quote.extras || quote.addOnTotal ? (
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(quote.variantPrice)}
            {quote.extras ? ` + ${formatCurrency(quote.extras)} custom` : ''}
            {quote.addOnTotal ? ` + ${formatCurrency(quote.addOnTotal)} add-ons` : ''}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
