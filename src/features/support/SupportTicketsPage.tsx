import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { seedOrders } from '@/mocks/data/orders';
import type { SupportTicket } from '@/types';
import { formatDateTime } from '@/utils/format';

function orderNo(id: string) {
  return seedOrders.find((o) => o.id === id)?.orderNumber ?? id;
}

const TICKETS: SupportTicket[] = [
  {
    id: 't1',
    ticketNumber: '2608-01',
    orderId: 'ord_01',
    orderNumber: orderNo('ord_01'),
    customerName: 'Diya Kapoor',
    phone: '+91 98180 44021',
    message: 'Can I change the pickup time for my chocolate truffle?',
    channel: 'Application Support Form',
    priority: 'normal',
    status: 'new',
    assignedAgent: 'Meera Iyer',
    escalationOwner: null,
    createdAt: '2026-08-12T10:20:00.000Z',
    updatedAt: '2026-08-12T10:20:00.000Z',
  },
  {
    id: 't2',
    ticketNumber: '2608-02',
    orderId: 'ord_02',
    orderNumber: orderNo('ord_02'),
    customerName: 'Arjun Mehta',
    phone: '+91 98200 11882',
    message: 'Need clarification on cancellation window.',
    channel: 'Guided Support',
    priority: 'high',
    status: 'open',
    assignedAgent: 'Meera Iyer',
    escalationOwner: null,
    createdAt: '2026-08-12T08:40:00.000Z',
    updatedAt: '2026-08-12T09:10:00.000Z',
  },
  {
    id: 't3',
    ticketNumber: '2608-03',
    orderId: 'ord_08',
    orderNumber: orderNo('ord_08'),
    customerName: 'Sana Qureshi',
    phone: '+91 90000 22112',
    message: 'Refund not visible after cancellation.',
    channel: 'Application Support Form',
    priority: 'urgent',
    status: 'pending',
    assignedAgent: 'Vikram Shah',
    escalationOwner: 'Ananya Rao',
    createdAt: '2026-08-11T16:00:00.000Z',
    updatedAt: '2026-08-12T07:30:00.000Z',
  },
];

export function SupportTicketsPage() {
  const columns: Column<SupportTicket>[] = [
    { id: 'id', label: 'Ticket ID', render: (r) => r.ticketNumber },
    { id: 'order', label: 'Order ID', render: (r) => r.orderNumber },
    { id: 'cust', label: 'Customer', render: (r) => `${r.customerName}` },
    { id: 'msg', label: 'Message', render: (r) => r.message.slice(0, 48) + '…' },
    { id: 'pri', label: 'Priority', render: (r) => <Chip size="small" label={r.priority} /> },
    { id: 'st', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { id: 'agent', label: 'Assigned', render: (r) => r.assignedAgent ?? '—' },
    { id: 'esc', label: 'Escalation', render: (r) => r.escalationOwner ?? '—' },
    { id: 'at', label: 'Created', render: (r) => formatDateTime(r.createdAt) },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Support"
        title="Support Tickets"
        subtitle="Same records as support.gunuco.com. Ticket actions never bypass order, payment or refund rules."
      />
      <Grid container spacing={2}>
        {['Total', 'New', 'Open', 'Pending', 'Closed'].map((label, i) => (
          <Grid item xs={6} sm={4} md={2} key={label}>
            <KpiCard
              label={label}
              value={String([TICKETS.length, 1, 1, 1, 0][i])}
              icon={<SupportAgentRoundedIcon fontSize="small" />}
            />
          </Grid>
        ))}
      </Grid>
      <DataTable columns={columns} rows={TICKETS} rowKey={(r) => r.id} />
      <Typography variant="caption" color="text.secondary">
        Closing requires a resolution note. Reopening requires a reason. Branch Managers are limited to assigned-location tickets.
      </Typography>
    </Stack>
  );
}
