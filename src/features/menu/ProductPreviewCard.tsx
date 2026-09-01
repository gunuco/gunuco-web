import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { Addon, CustomizationPriceGroup, PriceTier } from '@/types';
import { brand } from '@/theme/colors';
import { formatCurrency } from '@/utils/format';
import { previewTotal } from '@/features/menu/customizationPricing';

export function ProductPreviewCard({
  name,
  description,
  imageUrls = [],
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
  imageUrls?: string[];
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
  const [photo, setPhoto] = useState(0);
  const cover = imageUrls[Math.min(photo, Math.max(imageUrls.length - 1, 0))];

  useEffect(() => {
    setPhoto(0);
  }, [imageUrls[0]]);

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
          bgcolor: cover ? '#111' : `hsl(${hue} 38% 28%)`,
          backgroundImage: cover ? `url(${cover})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {imageUrls.length > 1 ? (
        <Stack direction="row" gap={0.75} sx={{ px: 2, pt: 1.25 }} flexWrap="wrap">
          {imageUrls.map((url, index) => (
            <Box
              key={`${url.slice(0, 18)}-${index}`}
              onClick={() => setPhoto(index)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                cursor: 'pointer',
                border: `2px solid ${index === photo ? brand.wine : brand.line}`,
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </Stack>
      ) : null}
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
                  clickable
                  variant="outlined"
                  label={`${row.label} · ${formatCurrency(row.price)}`}
                  onClick={() => onSelectAmount(row.amount)}
                  sx={{
                    fontWeight: on ? 800 : 700,
                    bgcolor: on ? alpha(brand.wine, 0.14) : brand.creamPaper,
                    border: `1.5px solid ${on ? brand.wine : brand.line}`,
                    color: on ? brand.wine : brand.ink,
                    '& .MuiChip-label': { color: 'inherit' },
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
                    clickable
                    variant="outlined"
                    label={
                      option.extraPrice
                        ? `${option.label} +${formatCurrency(option.extraPrice)}`
                        : option.label
                    }
                    onClick={() => onSelectOption(group.key, option.value)}
                    sx={{
                      fontWeight: on ? 800 : 700,
                      bgcolor: on ? alpha(brand.wine, 0.14) : brand.creamPaper,
                      border: `1.5px solid ${on ? brand.wine : brand.line}`,
                      color: on ? brand.wine : brand.ink,
                      '& .MuiChip-label': { color: 'inherit' },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>
        ))}
        {addOns.length ? (
          <Stack gap={0.35}>
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              Add-ons
            </Typography>
            {addOns.map((row) => (
              <Stack key={row.id} gap={0}>
                <Typography variant="caption" fontWeight={700}>
                  {row.title || row.name} · {formatCurrency(row.price)}
                </Typography>
                {row.description ? (
                  <Typography variant="caption" color="text.secondary">
                    {row.description}
                  </Typography>
                ) : null}
              </Stack>
            ))}
          </Stack>
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
