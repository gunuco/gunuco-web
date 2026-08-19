import { Card, CardContent, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_CONFIG } from '@/config/app.config';
import { formatCurrency } from '@/utils/format';

type DeliveryBand = {
  fromKm: number;
  toKm: number;
  fee: number;
  label: string;
};

export function FulfilmentSettingsPage() {
  const columns: Column<DeliveryBand>[] = [
    { id: 'from', label: 'From', render: (r) => `${r.fromKm} km` },
    { id: 'to', label: 'To', render: (r) => `${r.toKm} km` },
    { id: 'rule', label: 'Boundary', render: (r) => r.label },
    { id: 'fee', label: 'Fee', render: (r) => (r.fee === 0 ? 'Free' : formatCurrency(r.fee)) },
    { id: 'st', label: 'Status', render: () => <Chip size="small" label="Active" color="success" /> },
  ];
  const rows: DeliveryBand[] = [...APP_CONFIG.deliveryBands];

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Fulfilment"
        title="Delivery & Pickup Settings"
        subtitle="Pickup-at-Store is always free. Doorstep fees use road distance. Custom Cakes stay fee-exempt."
      />
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch defaultChecked />
              <Typography fontWeight={700}>Pickup-at-Store</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch defaultChecked />
              <Typography fontWeight={700}>Doorstep-Delivery</Typography>
            </Stack>
            <TextField label="Max doorstep distance" value={`${APP_CONFIG.maxDoorstepKm} km`} InputProps={{ readOnly: true }} />
          </Stack>
        </CardContent>
      </Card>
      <Typography variant="h6">Distance bands</Typography>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.label} />
      <Card>
        <CardContent>
          <Typography variant="h6">NYC Cookies delivery coverage</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Visible only for GUNUCO NYC COOKIES. Regular City is ON. All-India is OFF by default. Nationwide orders use
            courier tracking, never local riders.
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip color="success" label="Regular City Delivery ON" />
            <Chip label="All-India Delivery OFF" />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
