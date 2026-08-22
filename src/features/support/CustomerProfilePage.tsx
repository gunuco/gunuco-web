import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { customersFromOrders, findCustomer, type CustomerProfile } from '@/features/support/customerLookup';
import { brand } from '@/theme/colors';
import { useSupportStore } from '@/store/supportStore';
import type { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { phoneDigits } from '@/utils/phone';

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tickets = useSupportStore((s) => s.tickets);
  const refunds = useSupportStore((s) => s.refunds);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const rows = useMemo(() => customersFromOrders(), []);
  const phoneParam = params.get('phone') ?? '';

  useEffect(() => {
    if (!phoneParam) return;
    const match = findCustomer(phoneParam);
    if (match) setSelectedKey(match.key);
  }, [phoneParam]);

  const selected = rows.find((r) => r.key === selectedKey) ?? null;
  const selectedTickets = selected
    ? tickets.filter((t) => phoneDigits(t.phone) === phoneDigits(selected.phone))
    : [];
  const selectedRefunds = selected ? refunds.filter((r) => r.customerName === selected.name) : [];

  const columns: Column<CustomerProfile>[] = [
    { id: 'name', label: 'Name', render: (r) => r.name },
    {
      id: 'phone',
      label: 'Phone',
      render: (r) => (
        <Typography
          component="a"
          href={`tel:${r.phone.replace(/\s/g, '')}`}
          sx={{ color: brand.wine, fontWeight: 700, textDecoration: 'none' }}
        >
          {r.phone}
        </Typography>
      ),
    },
    { id: 'addr', label: 'Address', render: (r) => r.address },
    { id: 'n', label: 'Orders', render: (r) => r.orderCount },
    { id: 'last', label: 'Last order', render: (r) => formatDateTime(r.lastOrderAt) },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        highlightTitle
        eyebrow="Support desk"
        title="Customers"
        subtitle="Open a row for phone, address, orders, tickets, and refunds. Tickets deep-link here."
      />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.key} onRowClick={(row) => setSelectedKey(row.key)} />
      <AppDrawer
        open={Boolean(selected)}
        title={selected?.name ?? 'Customer'}
        onClose={() => setSelectedKey(null)}
        width={520}
      >
        {selected ? (
          <Stack gap={2}>
            <Typography
              component="a"
              href={`tel:${selected.phone.replace(/\s/g, '')}`}
              sx={{ color: brand.wine, fontWeight: 700, textDecoration: 'none' }}
            >
              {selected.phone}
            </Typography>
            <Typography variant="body2">{selected.address}</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={() => navigate('/support')}>
                Tickets
              </Button>
              <Button size="small" variant="outlined" onClick={() => navigate('/support/refunds')}>
                Refunds
              </Button>
            </Stack>
            {selectedTickets.length ? (
              <Stack gap={0.75}>
                <Typography fontWeight={800} fontSize={13}>
                  Tickets
                </Typography>
                {selectedTickets.map((ticket) => (
                  <Stack
                    key={ticket.id}
                    direction="row"
                    justifyContent="space-between"
                    gap={1}
                    sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', cursor: 'pointer' }}
                    onClick={() => navigate('/support')}
                  >
                    <Typography fontWeight={700}>{ticket.ticketNumber}</Typography>
                    <StatusChip status={ticket.status} />
                  </Stack>
                ))}
              </Stack>
            ) : null}
            {selectedRefunds.length ? (
              <Stack gap={0.5}>
                <Typography fontWeight={800} fontSize={13}>
                  Desk refunds
                </Typography>
                {selectedRefunds.map((row) => (
                  <Typography key={row.id} variant="body2">
                    {formatCurrency(row.amount)} · {row.kind} · {row.status}
                  </Typography>
                ))}
              </Stack>
            ) : null}
            <Typography fontWeight={800} fontSize={13}>
              Orders
            </Typography>
            {selected.orders.map((order) => (
              <OrderLine key={order.id} order={order} />
            ))}
          </Stack>
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function OrderLine({ order }: { order: Order }) {
  return (
    <Stack gap={0.35} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" gap={1}>
        <Typography fontWeight={700}>{order.orderNumber}</Typography>
        <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
      </Stack>
      <StatusChip status={order.status} />
      <Typography variant="caption" color="text.secondary">
        {order.items.map((i) => i.productName).join(', ')} · {formatDateTime(order.createdAt)}
      </Typography>
    </Stack>
  );
}
