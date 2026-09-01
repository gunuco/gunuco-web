import { Stack, Typography } from '@mui/material';
import { HighlightName } from '@/components/orders/HighlightName';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { seedOrders } from '@/mocks/data/orders';
import type { CancellationRecord, RefundRecord, ReturnRecord } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';

function orderNo(id: string) {
  return seedOrders.find((o) => o.id === id)?.orderNumber ?? id;
}

const CANCELLATIONS: CancellationRecord[] = [
  {
    id: 'c1',
    orderNumber: orderNo('ord_08'),
    customerName: 'Sana Qureshi',
    reason: 'Changed plans',
    originalAmount: 1569,
    refundAmount: 1569,
    actor: 'customer',
    createdAt: '2026-08-12T08:55:00.000Z',
  },
];

export function CancellationsPage() {
  const columns: Column<CancellationRecord>[] = [
    { id: 'ord', label: 'Order ID', render: (r) => (
      <Typography fontWeight={800} fontSize={13.5}>{r.orderNumber}</Typography>
    ) },
    { id: 'cust', label: 'Customer', render: (r) => <HighlightName value={r.customerName} tone="wine" /> },
    { id: 'reason', label: 'Reason', render: (r) => r.reason },
    { id: 'orig', label: 'Original', render: (r) => formatCurrency(r.originalAmount) },
    { id: 'ref', label: 'Refund', render: (r) => formatCurrency(r.refundAmount) },
    { id: 'actor', label: 'Actor', render: (r) => r.actor },
    { id: 'at', label: 'When', render: (r) => formatDateTime(r.createdAt) },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Policy"
        title="Cancel Orders"
        subtitle="0–30 min: 100% refund. 30–60 min: 50%. After 60 min: Raise Support Ticket. Preparing does not change eligibility."
      />
      <DataTable columns={columns} rows={CANCELLATIONS} rowKey={(r) => r.id} />
    </Stack>
  );
}

const REFUNDS: RefundRecord[] = [
  {
    id: 'rf1',
    orderNumber: orderNo('ord_08'),
    customerName: 'Sana Qureshi',
    amount: 1569,
    method: 'upi',
    status: 'processing',
    retries: 0,
    initiatedAt: '2026-08-12T08:56:00.000Z',
    completedAt: null,
  },
];

export function RefundsPage() {
  const columns: Column<RefundRecord>[] = [
    { id: 'id', label: 'Refund ID', render: (r) => r.id.toUpperCase() },
    { id: 'ord', label: 'Order ID', render: (r) => (
      <Typography fontWeight={800} fontSize={13.5}>{r.orderNumber}</Typography>
    ) },
    { id: 'cust', label: 'Customer', render: (r) => <HighlightName value={r.customerName} tone="wine" /> },
    { id: 'amt', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { id: 'm', label: 'Method', render: (r) => r.method.toUpperCase() },
    { id: 'st', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { id: 'try', label: 'Retries', render: (r) => r.retries },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Finance"
        title="Refunds"
        subtitle="Never refund more than the captured amount. Failed gateway refunds retry up to three times, then Manual Review."
      />
      <DataTable columns={columns} rows={REFUNDS} rowKey={(r) => r.id} />
    </Stack>
  );
}

const RETURNS: ReturnRecord[] = [
  {
    id: 'rt1',
    orderNumber: orderNo('ord_12'),
    customerName: 'Rahul Khanna',
    reason: 'Damaged finish',
    severity: 'high',
    resolution: 'pending',
    createdAt: '2026-08-12T12:10:00.000Z',
  },
];

export function ReturnsPage() {
  const columns: Column<ReturnRecord>[] = [
    { id: 'ord', label: 'Order ID', render: (r) => (
      <Typography fontWeight={800} fontSize={13.5}>{r.orderNumber}</Typography>
    ) },
    { id: 'cust', label: 'Customer', render: (r) => <HighlightName value={r.customerName} tone="wine" /> },
    { id: 'reason', label: 'Reason', render: (r) => r.reason },
    { id: 'sev', label: 'Severity', render: (r) => r.severity },
    { id: 'res', label: 'Resolution', render: (r) => r.resolution.replace('_', ' ') },
    { id: 'at', label: 'Raised', render: (r) => formatDateTime(r.createdAt) },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Quality"
        title="Returns"
        subtitle="Returned food never becomes sellable again. Quantities enter Pending Disposal with method, Admin and timestamp."
      />
      <DataTable columns={columns} rows={RETURNS} rowKey={(r) => r.id} />
      <Typography variant="body2" color="text.secondary">
        High-severity cases require escalation. Approved replacements create a priority production-house order.
      </Typography>
    </Stack>
  );
}
