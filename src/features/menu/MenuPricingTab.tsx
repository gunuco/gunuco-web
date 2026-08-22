import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { productBasePrice } from '@/features/menu/customizationPricing';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';

export function MenuPricingTab() {
  const { data: categories = [] } = useCategories();
  const products = useProducts();

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">
        Base price is the default selling price. Variants are absolute prices for size/weight. Customization extras add
        on top of the selected variant.
      </Typography>
      <Grid container spacing={2}>
        {(products.data ?? []).map((product) => {
          const extras = (product.customizationGroups ?? []).flatMap((group) =>
            group.options.filter((row) => row.extraPrice > 0),
          );
          return (
            <Grid item xs={12} md={6} lg={4} key={product.id}>
              <Card>
                <CardContent>
                  <Typography fontWeight={800}>{product.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getCategoryById(categories, product.subcategoryId)?.name} · {product.sku}
                  </Typography>
                  <Stack direction="row" gap={1} alignItems="baseline" sx={{ mt: 1.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      Base
                    </Typography>
                    <Typography fontWeight={800}>{formatCurrency(productBasePrice(product))}</Typography>
                  </Stack>
                  <Stack sx={{ mt: 1.25 }} gap={0.6}>
                    {product.priceTiers.map((tier) => (
                      <Stack key={tier.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{tier.label}</Typography>
                        <Typography fontWeight={700}>{formatCurrency(tier.price)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {extras.length ? (
                    <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 1.25 }}>
                      {extras.map((row) => (
                        <Chip
                          key={`${product.id}-${row.value}`}
                          size="small"
                          label={`${row.label} +${formatCurrency(row.extraPrice)}`}
                        />
                      ))}
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
