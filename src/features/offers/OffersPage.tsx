import { Chip, Stack, Typography } from '@mui/material';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Offer } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

const OFFERS: Offer[] = [
  {
    id: 'off_1',
    name: 'Festive 10% on Casual Cakes',
    type: 'percent',
    value: 10,
    scope: 'CASUAL_CAKES',
    startsAt: '2026-08-01T00:00:00.000Z',
    endsAt: '2026-08-31T23:59:00.000Z',
    usageLimit: 200,
    used: 48,
    active: true,
  },
  {
    id: 'off_2',
    name: 'NYC Cookies box ₹50 off',
    type: 'flat',
    value: 50,
    scope: 'GUNUCO_NYC_COOKIES',
    startsAt: '2026-08-10T00:00:00.000Z',
    endsAt: '2026-09-10T23:59:00.000Z',
    usageLimit: 80,
    used: 12,
    active: true,
  },
];

export function OffersPage() {
  const columns: Column<Offer>[] = [
    { id: 'name', label: 'Offer', render: (r) => r.name },
    { id: 'type', label: 'Type', render: (r) => (r.type === 'percent' ? `${r.value}%` : formatCurrency(r.value)) },
    { id: 'scope', label: 'Scope', render: (r) => r.scope },
    { id: 'when', label: 'Schedule', render: (r) => `${formatDate(r.startsAt)} – ${formatDate(r.endsAt)}` },
    { id: 'use', label: 'Usage', render: (r) => `${r.used}/${r.usageLimit}` },
    { id: 'st', label: 'Status', render: (r) => <Chip size="small" label={r.active ? 'Active' : 'Off'} /> },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Commerce"
        title="Offers & Discounts"
        subtitle="No stacking. The server applies the single best eligible offer and snapshots it on the order."
      />
      <DataTable columns={columns} rows={OFFERS} rowKey={(r) => r.id} />
      <Typography variant="body2" color="text.secondary">
        Add-on offer scope is deferred at launch. Coupons are not entered by customers.
      </Typography>
    </Stack>
  );
}
