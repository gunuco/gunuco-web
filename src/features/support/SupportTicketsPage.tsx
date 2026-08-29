import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { Badge, Box, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { TicketWorkspace } from '@/features/support/TicketWorkspace';
import { useSupportStore } from '@/store/supportStore';
import { brand } from '@/theme/colors';
import type { SupportTicket, TicketStatus } from '@/types';
import { formatDateTime } from '@/utils/format';

type InboxFilter = 'open' | 'pending' | 'closed';

function matchesFilter(ticket: SupportTicket, filter: InboxFilter) {
  if (filter === 'open') return ticket.status === 'new' || ticket.status === 'open';
  return ticket.status === filter;
}

const FILTERS: Array<{ value: InboxFilter; label: string; icon: typeof ForumRoundedIcon }> = [
  { value: 'open', label: 'Open', icon: ForumRoundedIcon },
  { value: 'pending', label: 'Pending', icon: HourglassBottomRoundedIcon },
  { value: 'closed', label: 'Closed', icon: CheckCircleRoundedIcon },
];

export function SupportTicketsPage() {
  const tickets = useSupportStore((s) => s.tickets);
  const setStatus = useSupportStore((s) => s.setStatus);
  const [filter, setFilter] = useState<InboxFilter>('open');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => matchesFilter(t, 'open')).length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    }),
    [tickets],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets
      .filter((ticket) => matchesFilter(ticket, filter))
      .filter((ticket) => {
        if (!q) return true;
        return (
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.orderNumber.toLowerCase().includes(q) ||
          ticket.customerName.toLowerCase().includes(q) ||
          ticket.phone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tickets, filter, search]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  const openTicket = (ticket: SupportTicket) => {
    setSelectedId(ticket.id);
    if (ticket.status === 'new') setStatus(ticket.id, 'open' as TicketStatus);
  };

  return (
    <Stack gap={1.5} sx={{ height: { md: 'calc(100vh - 108px)' }, minHeight: { xs: 480, md: 560 } }}>
      <PageHeader
        highlightTitle
        eyebrow="Support desk"
        title="Tickets"
        subtitle="Icon filters for open, pending, and closed. Open a ticket to chat, refund, and close."
      />
      <Paper
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${brand.line}`,
          borderRadius: 1.5,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          gap={1.25}
          sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${brand.line}`, bgcolor: brand.cream }}
        >
          <ToggleButtonGroup
            exclusive
            value={filter}
            onChange={(_e, value: InboxFilter | null) => {
              if (value) {
                setFilter(value);
                setSelectedId(null);
              }
            }}
            size="small"
          >
            {FILTERS.map((item) => {
              const Icon = item.icon;
              return (
                <ToggleButton key={item.value} value={item.value} sx={{ px: 1.25, gap: 0.75 }}>
                  <Tooltip title={item.label}>
                    <Badge
                      badgeContent={counts[item.value]}
                      color={item.value === 'closed' ? 'success' : item.value === 'pending' ? 'warning' : 'primary'}
                      max={99}
                    >
                      <Icon fontSize="small" />
                    </Badge>
                  </Tooltip>
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, ml: 1.25, fontWeight: 700 }}>
                    {item.label}
                  </Box>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder="Search ticket, order, or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 240 } }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ flex: 1, minHeight: 0 }}>
          <Stack
            sx={{
              width: { md: 320 },
              flexShrink: 0,
              borderRight: { md: `1px solid ${brand.line}` },
              overflow: 'auto',
              display: { xs: selected ? 'none' : 'flex', md: 'flex' },
            }}
          >
            {rows.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No {filter} tickets.
              </Typography>
            ) : (
              rows.map((ticket) => {
                const active = ticket.id === selectedId;
                return (
                  <Stack
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    gap={0.4}
                    sx={{
                      px: 1.75,
                      py: 1.35,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${brand.line}`,
                      bgcolor: active ? alpha(brand.wine, 0.08) : 'transparent',
                      borderLeft: active ? `3px solid ${brand.wine}` : '3px solid transparent',
                      '&:hover': { bgcolor: alpha(brand.gold, 0.12) },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                      <Typography fontWeight={800} fontSize={13}>
                        {ticket.ticketNumber}
                      </Typography>
                      <StatusChip status={ticket.status} />
                    </Stack>
                    <Typography fontWeight={700} fontSize={13} noWrap>
                      {ticket.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {ticket.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.orderNumber} · {formatDateTime(ticket.updatedAt)}
                    </Typography>
                  </Stack>
                );
              })
            )}
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex' }}>
            {selected ? (
              <TicketWorkspace ticket={selected} onBack={() => setSelectedId(null)} />
            ) : (
              <Stack alignItems="center" justifyContent="center" gap={1} sx={{ flex: 1, color: 'text.secondary' }}>
                <SupportAgentRoundedIcon sx={{ fontSize: 40, color: brand.goldDark }} />
                <Typography fontWeight={800}>Select a ticket</Typography>
                <Typography variant="body2">Chat, customer details, refunds, and close live in this panel.</Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
