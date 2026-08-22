import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { Box, Button, Chip, Divider, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '@/components/ui/StatusChip';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/status';
import { findCustomer, findOrder } from '@/features/support/customerLookup';
import { useAuthStore } from '@/store/authStore';
import { useSupportStore } from '@/store/supportStore';
import { useUiStore } from '@/store/uiStore';
import { brand } from '@/theme/colors';
import type { SupportTicket, TicketStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { canPingPhone, smsHref, telHref, whatsappHref } from '@/utils/phone';

const STATUSES: TicketStatus[] = ['new', 'open', 'pending', 'closed'];

const QUICK_REPLIES = [
  'Thanks for waiting — I am checking this with the kitchen now.',
  'Refund is on the way. It can take 3–5 working days to show on your statement.',
  'Could you share a photo of the cake and the box label?',
  'We can close this if everything looks good on your side.',
];

export function TicketWorkspace({ ticket, onBack }: { ticket: SupportTicket; onBack?: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const notify = useUiStore((s) => s.notify);
  const messages = useSupportStore((s) => s.messages);
  const refunds = useSupportStore((s) => s.refunds);
  const setStatus = useSupportStore((s) => s.setStatus);
  const sendMessage = useSupportStore((s) => s.sendMessage);
  const issueRefund = useSupportStore((s) => s.issueRefund);
  const [reply, setReply] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundKind, setRefundKind] = useState<'full' | 'partial'>('full');
  const scroller = useRef<HTMLDivElement>(null);

  const thread = useMemo(
    () => messages.filter((msg) => msg.ticketId === ticket.id),
    [messages, ticket.id],
  );
  const order = findOrder(ticket.orderId);
  const customer = findCustomer(ticket.phone, ticket.customerName);
  const ticketRefunds = refunds.filter((row) => row.ticketId === ticket.id);
  const ping = canPingPhone(ticket.phone);
  const pingText = `Hi ${ticket.customerName}, this is GUNUCO support about ticket ${ticket.ticketNumber} / order ${ticket.orderNumber}.`;
  const maxRefund = order?.total ?? 0;
  const closed = ticket.status === 'closed';

  useEffect(() => {
    setReply('');
    setCloseNote(ticket.resolutionNote ?? '');
    setRefundReason('');
    setRefundKind('full');
    setRefundAmount(order ? String(order.total) : '');
  }, [ticket.id, ticket.resolutionNote, order]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread.length, ticket.id]);

  const postReply = (body = reply) => {
    const text = body.trim();
    if (!text || closed) return;
    sendMessage(ticket.id, user?.name ?? 'Agent', text);
    setReply('');
  };

  const closeTicket = () => {
    if (!closeNote.trim()) return;
    setStatus(ticket.id, 'closed', closeNote.trim());
    notify('Ticket closed', 'success');
  };

  const submitRefund = () => {
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Enter a refund amount', 'error');
      return;
    }
    if (maxRefund && amount > maxRefund) {
      notify('Refund cannot exceed the order total', 'error');
      return;
    }
    if (!refundReason.trim()) {
      notify('Add a refund reason', 'error');
      return;
    }
    const kind = amount >= maxRefund && maxRefund > 0 ? 'full' : refundKind;
    issueRefund({
      ticketId: ticket.id,
      orderId: ticket.orderId,
      orderNumber: ticket.orderNumber,
      customerName: ticket.customerName,
      amount,
      kind,
      reason: refundReason.trim(),
      agentName: user?.name ?? 'Agent',
    });
    sendMessage(
      ticket.id,
      user?.name ?? 'Agent',
      `Refund of ${formatCurrency(amount)} (${kind}) has been initiated. Reason: ${refundReason.trim()}`,
    );
    setRefundReason('');
    notify('Refund initiated', 'success');
  };

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ flex: 1, minHeight: 0, height: '100%' }}>
      <Stack sx={{ flex: 1.4, minWidth: 0, minHeight: 420, borderRight: { lg: `1px solid ${brand.line}` } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${brand.line}` }}
        >
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
            {onBack ? (
              <IconButton size="small" onClick={onBack} sx={{ display: { md: 'none' } }} aria-label="Back to tickets">
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            ) : null}
            <Stack gap={0.25} sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} noWrap>
                Ticket {ticket.ticketNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {ticket.channel} · Order {ticket.orderNumber}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" gap={0.75} flexWrap="wrap" justifyContent="flex-end">
            <StatusChip status={ticket.status} />
            <Chip size="small" label={ticket.priority} />
          </Stack>
        </Stack>
        <Box ref={scroller} sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.75 }}>
          <Stack gap={1.1}>
            {thread.map((msg) => {
              const agent = msg.author === 'agent';
              return (
                <Stack
                  key={msg.id}
                  sx={{
                    alignSelf: agent ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    px: 1.4,
                    py: 1,
                    borderRadius: agent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: agent ? alpha(brand.wine, 0.1) : alpha(brand.gold, 0.18),
                  }}
                >
                  <Typography variant="caption" fontWeight={800}>
                    {msg.authorName}
                  </Typography>
                  <Typography variant="body2">{msg.body}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(msg.createdAt)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
        <Stack gap={1} sx={{ p: 2, borderTop: `1px solid ${brand.line}`, bgcolor: brand.cream }}>
          {closed ? (
            <Typography variant="body2" color="text.secondary">
              Closed{ticket.resolutionNote ? ` — ${ticket.resolutionNote}` : ''}
            </Typography>
          ) : (
            <>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {QUICK_REPLIES.map((line) => (
                  <Chip
                    key={line}
                    size="small"
                    label={line.length > 42 ? `${line.slice(0, 42)}…` : line}
                    onClick={() => postReply(line)}
                    sx={{ maxWidth: '100%' }}
                  />
                ))}
              </Stack>
              <Stack direction="row" gap={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Reply to the customer…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  multiline
                  minRows={2}
                  maxRows={5}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      postReply();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  disabled={!reply.trim()}
                  onClick={() => postReply()}
                  sx={{ minWidth: 48, minHeight: 40, px: 1.5 }}
                >
                  <SendRoundedIcon fontSize="small" />
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Stack>

      <Stack sx={{ flex: 1, minWidth: 280, maxWidth: { lg: 380 }, overflow: 'auto', p: 2 }} gap={2}>
        <Stack gap={0.4}>
          <Typography variant="subtitle2" color="text.secondary">
            Customer
          </Typography>
          <Typography fontWeight={800}>{ticket.customerName}</Typography>
          <Typography variant="body2">{ticket.phone}</Typography>
          <Typography variant="body2" color="text.secondary">
            {customer?.address ?? order?.customerAddress ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {customer ? `${customer.orderCount} orders` : 'No profile match'} · Assigned {ticket.assignedAgent ?? '—'}
          </Typography>
        </Stack>
        {ping ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button size="small" variant="contained" startIcon={<CallRoundedIcon />} href={telHref(ticket.phone)}>
              Call
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ChatRoundedIcon />}
              href={whatsappHref(ticket.phone, pingText)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </Button>
            <Button size="small" variant="outlined" startIcon={<SmsRoundedIcon />} href={smsHref(ticket.phone, pingText)}>
              SMS
            </Button>
          </Stack>
        ) : null}
        <Button
          size="small"
          variant="outlined"
          startIcon={<PersonRoundedIcon />}
          onClick={() => navigate(`/support/customers?phone=${encodeURIComponent(ticket.phone)}`)}
        >
          Full customer profile
        </Button>

        {order ? (
          <Stack gap={0.75}>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Related order
            </Typography>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography fontWeight={700}>{order.orderNumber}</Typography>
              <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
            </Stack>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <StatusChip status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
              <StatusChip
                status={order.paymentStatus === 'completed' ? 'completed' : 'unpaid'}
                label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {order.items.map((item) => item.productName).join(', ')}
            </Typography>
          </Stack>
        ) : null}

        <Divider />
        <Typography variant="subtitle2" color="text.secondary">
          Ticket status
        </Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={ticket.status}
          disabled={closed}
          onChange={(e) => {
            const next = e.target.value as TicketStatus;
            if (next === 'closed') return;
            setStatus(ticket.id, next);
          }}
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status} disabled={status === 'closed'}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        {!closed ? (
          <Stack gap={1}>
            <TextField
              size="small"
              label="Resolution note"
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              multiline
              minRows={2}
            />
            <Button color="error" variant="outlined" disabled={!closeNote.trim()} onClick={closeTicket}>
              Resolve & close
            </Button>
          </Stack>
        ) : null}

        <Divider />
        <Stack direction="row" alignItems="center" gap={0.75}>
          <CurrencyRupeeRoundedIcon fontSize="small" />
          <Typography variant="subtitle2" color="text.secondary">
            Refunds
          </Typography>
        </Stack>
        {ticketRefunds.map((row) => (
          <Stack key={row.id} direction="row" justifyContent="space-between" gap={1}>
            <Typography variant="body2">
              {formatCurrency(row.amount)} · {row.kind}
            </Typography>
            <StatusChip status={row.status} />
          </Stack>
        ))}
        {closed ? (
          <Typography variant="caption" color="text.secondary">
            Reopen is not available. Issue refunds on an open or pending ticket.
          </Typography>
        ) : (
          <Stack gap={1}>
            <TextField
              select
              size="small"
              label="Type"
              value={refundKind}
              onChange={(e) => {
                const next = e.target.value as 'full' | 'partial';
                setRefundKind(next);
                if (next === 'full' && maxRefund) setRefundAmount(String(maxRefund));
              }}
            >
              <MenuItem value="full">Full</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Amount"
              type="number"
              value={refundAmount}
              onChange={(e) => {
                setRefundAmount(e.target.value);
                const amount = Number(e.target.value);
                if (maxRefund && amount < maxRefund) setRefundKind('partial');
              }}
              helperText={maxRefund ? `Max ${formatCurrency(maxRefund)}` : undefined}
            />
            <TextField
              size="small"
              label="Reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
            <Button variant="contained" onClick={submitRefund}>
              Issue refund
            </Button>
          </Stack>
        )}
        <Button size="small" variant="text" onClick={() => navigate('/support/refunds')}>
          All desk refunds
        </Button>
      </Stack>
    </Stack>
  );
}
