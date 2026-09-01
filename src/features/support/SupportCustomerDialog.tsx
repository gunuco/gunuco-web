import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { DetailField } from '@/components/ui/DetailField';
import { customerIdFromPhone, type CustomerProfile } from '@/features/support/customerLookup';
import type { SupportTicket } from '@/types';
import { brand } from '@/theme/colors';
import { canPingPhone, mailtoHref, openContactHref, smsHref, telHref, whatsappHref } from '@/utils/phone';

const contactBtnSx = {
  minWidth: 0,
  flex: '1 1 0',
  height: 32,
  px: 0.75,
  whiteSpace: 'nowrap',
  fontSize: 12,
  '& .MuiButton-startIcon': { mr: 0.5 },
} as const;

function onContact(href: string) {
  return (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
    openContactHref(href);
  };
}

export function SupportCustomerDialog({
  open,
  ticket,
  customer,
  email,
  address,
  pingText,
  onClose,
}: {
  open: boolean;
  ticket: SupportTicket;
  customer?: CustomerProfile;
  email: string;
  address: string;
  pingText: string;
  onClose: () => void;
}) {
  const ping = canPingPhone(ticket.phone);
  if (!open) return null;

  return (
    <Box
      role="dialog"
      aria-label="Customer profile"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        bgcolor: 'rgba(74, 48, 54, 0.35)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: { xs: '100%', sm: 420 },
          maxWidth: '100%',
          height: '100%',
          bgcolor: brand.creamPaper,
          overflow: 'auto',
          p: 2.5,
          boxShadow: '-12px 0 32px rgba(22,19,20,0.12)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Customer profile</Typography>
          <IconButton type="button" onClick={onClose} size="small" aria-label="Close">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Stack gap={2}>
          <DetailField label="Customer ID">
            <Typography fontWeight={800}>
              {customer?.id ?? customerIdFromPhone(ticket.phone, ticket.customerName)}
            </Typography>
          </DetailField>
          <DetailField label="Customer">
            <Typography fontWeight={800}>{ticket.customerName}</Typography>
          </DetailField>
          <DetailField label="Details">
            <Typography variant="body2">{ticket.phone}</Typography>
            <Typography variant="body2">{address || '—'}</Typography>
          </DetailField>
          <DetailField label="Email">
            <Typography variant="body2">{email}</Typography>
          </DetailField>
          <DetailField label="Account">
            <Typography fontWeight={800}>
              {customer ? `${customer.orderCount} orders` : 'No order history match'}
            </Typography>
          </DetailField>
          <Typography variant="body2" color="text.secondary">
            Assigned {ticket.assignedAgent ?? '—'}
            {ticket.escalationOwner ? ` · Escalation ${ticket.escalationOwner}` : ''}
          </Typography>
          <Stack direction="row" flexWrap="nowrap" gap={0.5} sx={{ width: '100%', minWidth: 0 }}>
            {ping ? (
              <>
                <Button type="button" size="small" variant="contained" startIcon={<CallRoundedIcon />} onClick={onContact(telHref(ticket.phone))} sx={contactBtnSx}>
                  Call
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  startIcon={<ChatRoundedIcon />}
                  onClick={onContact(whatsappHref(ticket.phone, pingText))}
                  sx={contactBtnSx}
                >
                  WhatsApp
                </Button>
                <Button type="button" size="small" variant="outlined" startIcon={<SmsRoundedIcon />} onClick={onContact(smsHref(ticket.phone, pingText))} sx={contactBtnSx}>
                  SMS
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              size="small"
              variant={ping ? 'outlined' : 'contained'}
              startIcon={<EmailRoundedIcon />}
              onClick={onContact(mailtoHref(email, `GUNUCO support ${ticket.ticketNumber}`, pingText))}
              sx={contactBtnSx}
            >
              Email
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
