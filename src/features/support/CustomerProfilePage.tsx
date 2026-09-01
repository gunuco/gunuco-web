import { Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HighlightName } from '@/components/orders/HighlightName';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DetailField } from '@/components/ui/DetailField';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
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
  const [search, setSearch] = useState('');

  const rows = useMemo(() => customersFromOrders(), []);
  const phoneParam = params.get('phone') ?? '';

  useEffect(() => {
    if (!phoneParam) return;
    const match = findCustomer(phoneParam);
    if (match) setSelectedKey(match.key);
  }, [phoneParam]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const blob = `${row.id} ${row.name} ${row.phone} ${row.email} ${row.address}`.toLowerCase();
      return blob.includes(q) || phoneDigits(row.phone).includes(q.replace(/\D/g, ''));
    });
  }, [rows, search]);

  const selected = rows.find((r) => r.key === selectedKey) ?? null;
  const selectedTickets = selected
    ? tickets.filter((t) => phoneDigits(t.phone) === phoneDigits(selected.phone))
    : [];
  const selectedRefunds = selected ? refunds.filter((r) => r.customerName === selected.name) : [];

  const columns: Column<CustomerProfile>[] = [
    {
      id: 'id',
      label: 'Customer ID',
      render: (r) => (
        <Typography fontWeight={800} fontSize={13} sx={{ letterSpacing: '0.02em' }}>
          {r.id}
        </Typography>
      ),
    },
    { id: 'name', label: 'Customer', render: (r) => <HighlightName value={r.name} tone="wine" /> },
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
      <Stack gap={0}>
        <FilterBar connected={filtered.length > 0 || Boolean(search)}>
          <TextField
            {...filterFieldProps}
            label="Search"
            placeholder="Customer ID, name, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { sm: 280 }, flex: { sm: '1 1 280px' } }}
          />
        </FilterBar>
        <DataTable
          connected
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.key}
          onRowClick={(row) => setSelectedKey(row.key)}
          emptyMessage={search.trim() ? 'No customers match that search.' : 'No customers yet.'}
        />
      </Stack>
      <AppDrawer
        open={Boolean(selected)}
        title={selected ? `${selected.name} · ${selected.id}` : 'Customer'}
        onClose={() => setSelectedKey(null)}
        width={520}
      >
        {selected ? (
          <Stack gap={2}>
            <DetailField label="Customer ID">
              <Typography fontWeight={800}>{selected.id}</Typography>
            </DetailField>
            <DetailField label="Customer">
              <Typography fontWeight={800}>{selected.name}</Typography>
            </DetailField>
            <DetailField label="Details">
              <Typography variant="body2" sx={{ pointerEvents: 'none' }}>
                {selected.phone}
              </Typography>
              <Typography variant="body2">{selected.address}</Typography>
            </DetailField>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={() => navigate('/support')}>
                Tickets
              </Button>
              <Button size="small" variant="outlined" onClick={() => navigate('/support/refunds')}>
                Refunds
              </Button>
            </Stack>
            {selectedTickets.length ? (
              <DetailField label="Tickets">
                {selectedTickets.map((ticket) => (
                  <Stack
                    key={ticket.id}
                    direction="row"
                    justifyContent="space-between"
                    gap={1}
                    sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', cursor: 'pointer' }}
                    onClick={() => navigate('/support')}
                  >
                    <Typography fontWeight={800}>{ticket.ticketNumber}</Typography>
                    <StatusChip status={ticket.status} />
                  </Stack>
                ))}
              </DetailField>
            ) : null}
            {selectedRefunds.length ? (
              <DetailField label="Refunds">
                {selectedRefunds.map((row) => (
                  <Typography key={row.id} variant="body2">
                    {formatCurrency(row.amount)} · {row.kind} · {row.status}
                  </Typography>
                ))}
              </DetailField>
            ) : null}
            <DetailField label="Orders">
              {selected.orders.map((order) => (
                <OrderLine key={order.id} order={order} />
              ))}
            </DetailField>
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
        <Typography fontWeight={800}>{order.orderNumber}</Typography>
        <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
      </Stack>
      <StatusChip status={order.status} />
      <Typography variant="body2" color="text.secondary">
        {order.items.map((i) => i.productName).join(', ')} · {formatDateTime(order.createdAt)}
      </Typography>
    </Stack>
  );
}
