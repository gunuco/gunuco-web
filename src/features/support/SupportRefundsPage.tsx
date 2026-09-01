import { Button, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HighlightName } from '@/components/orders/HighlightName';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useSupportStore } from '@/store/supportStore';
import type { SupportRefund } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';

export function SupportRefundsPage() {
  const navigate = useNavigate();
  const refunds = useSupportStore((s) => s.refunds);

  const columns: Column<SupportRefund>[] = useMemo(
    () => [
      { id: 'id', label: 'Refund', render: (r) => r.id.toUpperCase() },
      { id: 'ord', label: 'Order ID', render: (r) => (
        <Typography fontWeight={800} fontSize={13.5}>{r.orderNumber}</Typography>
      ) },
      { id: 'cust', label: 'Customer', render: (r) => <HighlightName value={r.customerName} tone="wine" /> },
      { id: 'amt', label: 'Amount', render: (r) => formatCurrency(r.amount) },
      { id: 'kind', label: 'Type', render: (r) => r.kind },
      { id: 'st', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
      { id: 'agent', label: 'Agent', render: (r) => r.agentName },
      { id: 'at', label: 'Initiated', render: (r) => formatDateTime(r.initiatedAt) },
    ],
    [],
  );

  return (
    <Stack gap={2}>
      <PageHeader
        highlightTitle
        eyebrow="Support desk"
        title="Refunds"
        subtitle="Refunds issued from tickets. Never exceed the captured order amount."
      />
      {refunds.length === 0 ? (
        <Stack gap={1}>
          <Typography variant="body2" color="text.secondary">
            No desk refunds yet. Open a ticket to issue a full or partial refund.
          </Typography>
          <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={() => navigate('/support')}>
            Open tickets
          </Button>
        </Stack>
      ) : (
        <DataTable columns={columns} rows={refunds} rowKey={(r) => r.id} />
      )}
    </Stack>
  );
}
