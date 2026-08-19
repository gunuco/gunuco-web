import { Chip, Stack, Typography } from '@mui/material';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { seedOrders } from '@/mocks/data/orders';
import type { FeedbackItem, Testimonial } from '@/types';
import { formatDateTime } from '@/utils/format';

function orderNo(id: string) {
  return seedOrders.find((o) => o.id === id)?.orderNumber ?? id;
}

const FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb1',
    orderNumber: orderNo('ord_07'),
    customerName: 'Kabir Singh',
    message: 'The ganache finish was perfect and delivery was on time.',
    consent: true,
    status: 'pending',
    moderator: null,
    createdAt: '2026-08-12T11:00:00.000Z',
  },
  {
    id: 'fb2',
    orderNumber: orderNo('ord_11'),
    customerName: 'Priya Menon',
    message: 'Loved the pistachio rose flavour. Will order again.',
    consent: true,
    status: 'approved',
    moderator: 'Ananya Rao',
    createdAt: '2026-08-10T18:20:00.000Z',
  },
];

export function FeedbackPage() {
  const columns: Column<FeedbackItem>[] = [
    { id: 'at', label: 'Submitted', render: (r) => formatDateTime(r.createdAt) },
    { id: 'ord', label: 'Order ID', render: (r) => r.orderNumber },
    { id: 'cust', label: 'Customer', render: (r) => r.customerName },
    { id: 'msg', label: 'Message', render: (r) => r.message },
    { id: 'consent', label: 'Testimonial consent', render: (r) => (r.consent ? 'Yes' : 'No') },
    { id: 'st', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { id: 'mod', label: 'Moderator', render: (r) => r.moderator ?? '—' },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Voice"
        title="Customer Feedback"
        subtitle="Message-only, order-level feedback. No stars, ratings or public product reviews."
      />
      <DataTable columns={columns} rows={FEEDBACK} rowKey={(r) => r.id} />
    </Stack>
  );
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tm1',
    displayName: 'Priya M.',
    quote: 'Loved the pistachio rose flavour. Will order again.',
    imageHue: 130,
    channels: ['app', 'website'],
    displayOrder: 1,
    active: true,
    sourceFeedbackId: 'fb2',
  },
];

export function TestimonialsPage() {
  const columns: Column<Testimonial>[] = [
    { id: 'name', label: 'Display name', render: (r) => r.displayName },
    { id: 'quote', label: 'Quote', render: (r) => r.quote },
    {
      id: 'ch',
      label: 'Channels',
      render: (r) => (
        <Stack direction="row" gap={0.5}>
          {r.channels.map((c) => (
            <Chip key={c} size="small" label={c} />
          ))}
        </Stack>
      ),
    },
    { id: 'st', label: 'Published', render: (r) => (r.active ? 'Yes' : 'No') },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Brand"
        title="Testimonials"
        subtitle="Created only from approved feedback with explicit public consent. Never publish phone, email, address or Order ID."
      />
      <DataTable columns={columns} rows={TESTIMONIALS} rowKey={(r) => r.id} />
      <Typography variant="body2" color="text.secondary">
        App and static website consume the same published carousel API.
      </Typography>
    </Stack>
  );
}
