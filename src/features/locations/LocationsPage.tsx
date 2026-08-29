import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useLocations } from '@/hooks/useResources';

export function LocationsPage() {
  const list = useLocations();

  return (
    <Stack gap={2.5}>
      <PageHeader
        title="Locations"
        eyebrow="Network"
        subtitle="Owner-only. Production house is the launch location. Branch creation stays behind a feature flag."
      />
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
        {(list.data ?? []).map((loc) => (
          <Card key={loc.id} sx={{ minWidth: 0, width: '100%', maxWidth: { md: 420 } }}>
            <CardContent>
              <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
                <PlaceRoundedIcon color="primary" />
                <Typography fontWeight={800}>{loc.name}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {loc.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loc.city} · {loc.phone}
              </Typography>
              <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                {loc.isProduction ? <Chip size="small" color="primary" label="Production" /> : null}
                <Chip size="small" color="success" label={loc.active ? 'Active' : 'Inactive'} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
