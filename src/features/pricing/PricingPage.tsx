import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';

export function PricingPage() {
  const { data: categories = [] } = useCategories();
  const products = useProducts();

  return (
    <Stack gap={2.5}>
      <PageHeader
        title="Pricing"
        eyebrow="Commerce"
        subtitle="Each product stores a matrix of amount → price. The POS and catalogue preview share one quoting engine."
      />
      <Grid container spacing={2}>
        {(products.data ?? []).map((p) => (
          <Grid item xs={12} md={6} lg={4} key={p.id}>
            <Card>
              <CardContent>
                <Typography fontWeight={800}>{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {getCategoryById(categories, p.subcategoryId)?.name} · {p.sku}
                </Typography>
                <Stack sx={{ mt: 1.5 }} gap={0.75}>
                  {p.priceTiers.map((t) => (
                    <Stack key={t.id} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t.label}</Typography>
                      <Typography fontWeight={700}>{formatCurrency(t.price)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
