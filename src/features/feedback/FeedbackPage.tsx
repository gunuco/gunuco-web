import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CustomizationsCell } from '@/components/orders/CustomerCell';
import { HighlightName } from '@/components/orders/HighlightName';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FilterBar, filterFieldProps } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { FEEDBACK_STATUS_LABELS } from '@/constants/status';
import { FeedbackDialog } from '@/features/feedback/FeedbackDialog';
import { RowControls } from '@/features/feedback/RowControls';
import { customerIdFromPhone, findOrderByNumber } from '@/features/support/customerLookup';
import { useOrders } from '@/hooks/useOrders';
import {
  useApproveFeedback,
  useFeedback,
  useRejectFeedback,
  useTestimonials,
  useUpdateTestimonial,
} from '@/hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import type { FeedbackItem, Order, Testimonial } from '@/types';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';

export function FeedbackPage() {
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role ? canManageCatalog(user.role) : false;
  const moderator = user?.name ?? 'Moderator';
  const list = useFeedback();
  const quotes = useTestimonials();
  const ordersQuery = useOrders({ page: 1, pageSize: 200 });
  const approve = useApproveFeedback();
  const reject = useRejectFeedback();
  const updateQuote = useUpdateTestimonial();
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [status, setStatus] = useState<FeedbackItem['status'] | ''>('');
  const [search, setSearch] = useState('');

  const orderByNumber = useMemo(() => {
    const map = new Map<string, Order>();
    for (const order of ordersQuery.data?.data ?? []) map.set(order.orderNumber, order);
    return map;
  }, [ordersQuery.data?.data]);

  const quoteByFeedback = useMemo(() => {
    const map = new Map<string, Testimonial>();
    for (const row of quotes.data ?? []) map.set(row.sourceFeedbackId, row);
    return map;
  }, [quotes.data]);

  const customerOf = (row: FeedbackItem) => {
    const order = orderByNumber.get(row.orderNumber) ?? findOrderByNumber(row.orderNumber);
    const name = order?.customerName ?? row.customerName;
    const phone = order?.customerPhone ?? '';
    return { order, name, phone, customerId: customerIdFromPhone(phone, name) };
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list.data ?? []).filter((row) => {
      if (status && row.status !== status) return false;
      if (!q) return true;
      const order = orderByNumber.get(row.orderNumber) ?? findOrderByNumber(row.orderNumber);
      const name = order?.customerName ?? row.customerName;
      const phone = order?.customerPhone ?? '';
      const customerId = customerIdFromPhone(phone, name);
      return (
        name.toLowerCase().includes(q) ||
        customerId.toLowerCase().includes(q) ||
        phone.includes(q) ||
        row.orderNumber.toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q)
      );
    });
  }, [list.data, search, status, orderByNumber]);

  const runApprove = (row: FeedbackItem) => {
    if (!row.consent) return;
    approve.mutate({ id: row.id, moderator }, { onSuccess: () => setSelected(null) });
  };

  const runReject = (row: FeedbackItem) => {
    reject.mutate({ id: row.id, moderator }, { onSuccess: () => setSelected(null) });
  };

  const runHide = (quote: Testimonial, hidden: boolean) => {
    updateQuote.mutate({ id: quote.id, payload: { active: !hidden } });
  };

  const columns: Column<FeedbackItem>[] = [
    {
      id: 'cid',
      label: 'Customer ID',
      render: (r) => (
        <Typography fontWeight={800} fontSize={13.5}>
          {customerOf(r).customerId}
        </Typography>
      ),
    },
    {
      id: 'cust',
      label: 'Customer',
      render: (r) => <HighlightName value={customerOf(r).name} tone="wine" />,
    },
    { id: 'msg', label: 'Message', render: (r) => <CustomizationsCell value={r.message} /> },
    {
      id: 'st',
      label: 'Status',
      render: (r) => <StatusChip status={r.status} label={FEEDBACK_STATUS_LABELS[r.status]} />,
    },
    {
      id: 'home',
      label: 'Home page',
      render: (r) => {
        const quote = quoteByFeedback.get(r.id);
        if (quote?.active) return <StatusChip status="published" label="Visible" />;
        if (quote) return <StatusChip status="hidden" label="Hidden" />;
        return '—';
      },
    },
    {
      id: 'ctrl',
      label: 'Controls',
      noWrap: true,
      minWidth: 280,
      render: (r) => {
        if (!canEdit) return null;
        const quote = quoteByFeedback.get(r.id);
        const busy =
          isPendingForId(approve, r.id) ||
          isPendingForId(reject, r.id) ||
          (quote ? isPendingForId(updateQuote, quote.id) : false);
        const showApprove = (r.status === 'pending' || r.status === 'rejected') && r.consent;
        const showReject = r.status === 'pending' || r.status === 'approved';
        return (
          <RowControls>
            {showApprove ? (
              <Button size="small" variant="contained" disabled={busy} onClick={() => runApprove(r)}>
                Approve
              </Button>
            ) : null}
            {showReject ? (
              <Button size="small" color="error" disabled={busy} onClick={() => runReject(r)}>
                Reject
              </Button>
            ) : null}
            {quote?.active ? (
              <Button size="small" disabled={busy} onClick={() => runHide(quote, true)}>
                Hide
              </Button>
            ) : null}
            {quote && !quote.active ? (
              <Button size="small" disabled={busy} onClick={() => runHide(quote, false)}>
                Unhide
              </Button>
            ) : null}
          </RowControls>
        );
      },
    },
  ];

  const showTable = list.isLoading || rows.length > 0;
  const selectedQuote = selected ? quoteByFeedback.get(selected.id) : undefined;
  const selectedOrder =
    selected ? (orderByNumber.get(selected.orderNumber) ?? findOrderByNumber(selected.orderNumber)) : undefined;

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Voice"
        title="Customer Feedback"
        subtitle="Approve publishes only the message as a home-page testimonial. Open a row for Order ID, consent, and customer details."
        actions={
          <Button component={RouterLink} to="/testimonials" variant="outlined">
            Testimonials
          </Button>
        }
      />
      <Stack gap={0}>
        <FilterBar connected={showTable}>
          <TextField
            {...filterFieldProps}
            label="Search"
            placeholder="Customer ID, name, or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            {...filterFieldProps}
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FeedbackItem['status'] | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="withdrawn">Withdrawn</MenuItem>
          </TextField>
        </FilterBar>
        <DataTable
          connected={showTable}
          headerFit
          minWidth={1080}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={list.isLoading ? 6 : false}
          onRowClick={(row) => setSelected(row)}
          emptyMessage="No feedback matches these filters."
        />
      </Stack>
      <FeedbackDialog
        open={Boolean(selected)}
        row={selected}
        order={selectedOrder}
        testimonial={selectedQuote}
        canEdit={canEdit}
        approving={selected ? isPendingForId(approve, selected.id) : false}
        rejecting={selected ? isPendingForId(reject, selected.id) : false}
        hiding={selectedQuote ? isPendingForId(updateQuote, selectedQuote.id) : false}
        onClose={() => setSelected(null)}
        onApprove={() => selected && runApprove(selected)}
        onReject={() => selected && runReject(selected)}
        onHide={selectedQuote ? () => runHide(selectedQuote, true) : undefined}
        onUnhide={selectedQuote ? () => runHide(selectedQuote, false) : undefined}
      />
    </Stack>
  );
}
