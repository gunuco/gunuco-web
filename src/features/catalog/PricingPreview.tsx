import { Paper, Stack, Typography } from '@mui/material';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { quoteProduct } from '@/utils/pricing';

export function PricingPreview({
  product,
  attributes,
}: {
  product: Product;
  attributes: Record<string, string | number | boolean | string[]>;
}) {
  const quote = quoteProduct(product, attributes);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Live price preview
      </Typography>
      <Stack gap={0.5}>
        <Row label="Base (selected tier)" value={formatCurrency(quote.base)} />
        <Row label="GST 5%" value={formatCurrency(quote.tax)} />
        <Row label="Total" value={formatCurrency(quote.total)} strong />
      </Stack>
    </Paper>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={strong ? 800 : 600}>{value}</Typography>
    </Stack>
  );
}
