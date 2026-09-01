import { Button, Divider, Stack, Typography } from '@mui/material';
import { AppModal } from '@/components/ui/AppModal';
import { StatusChip } from '@/components/ui/StatusChip';
import { FEEDBACK_STATUS_LABELS } from '@/constants/status';
import { DetailField } from '@/components/ui/DetailField';
import { customerIdFromPhone } from '@/features/support/customerLookup';
import type { FeedbackItem, Order, Testimonial } from '@/types';
import { publicDisplayName } from '@/utils/publicName';
import { formatDateTime } from '@/utils/format';

export function FeedbackDialog({
  open,
  row,
  order,
  testimonial,
  canEdit,
  approving,
  rejecting,
  hiding,
  onClose,
  onApprove,
  onReject,
  onHide,
  onUnhide,
}: {
  open: boolean;
  row: FeedbackItem | null;
  order?: Order;
  testimonial?: Testimonial;
  canEdit: boolean;
  approving: boolean;
  rejecting: boolean;
  hiding?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onHide?: () => void;
  onUnhide?: () => void;
}) {
  const pending = row?.status === 'pending';
  const rejected = row?.status === 'rejected';
  const approved = row?.status === 'approved';
  const busy = approving || rejecting || Boolean(hiding);
  const canPublish = Boolean(row?.consent);
  const showApprove = Boolean(canEdit && row && (pending || rejected));
  const showReject = Boolean(canEdit && row && (pending || approved));
  const showHide = Boolean(canEdit && testimonial?.active && onHide);
  const showUnhide = Boolean(canEdit && testimonial && !testimonial.active && onUnhide);
  const name = order?.customerName ?? row?.customerName ?? '';
  const phone = order?.customerPhone ?? '';
  const customerId = customerIdFromPhone(phone, name);

  return (
    <AppModal
      open={open}
      title="Customer feedback"
      onClose={onClose}
      maxWidth="sm"
      actions={
        canEdit && row && (showApprove || showReject || showHide || showUnhide) ? (
          <>
            {showReject ? (
              <Button color="error" disabled={busy} onClick={onReject}>
                {rejecting ? 'Rejecting…' : 'Reject'}
              </Button>
            ) : null}
            {showHide ? (
              <Button disabled={busy} onClick={onHide}>
                {hiding ? 'Hiding…' : 'Hide'}
              </Button>
            ) : null}
            {showUnhide ? (
              <Button disabled={busy} onClick={onUnhide}>
                {hiding ? 'Updating…' : 'Unhide'}
              </Button>
            ) : null}
            {showApprove ? (
              <Button variant="contained" disabled={busy || !canPublish} onClick={onApprove}>
                {approving ? 'Publishing…' : 'Approve'}
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {row ? (
        <Stack gap={2}>
          <DetailField label="Order ID">
            <Typography fontWeight={800}>{row.orderNumber}</Typography>
            <Typography variant="body2" color="text.secondary">
              Placed {formatDateTime(order?.createdAt ?? row.createdAt)}
            </Typography>
            {order ? (
              <Typography variant="body2" color="text.secondary">
                Needed by {formatDateTime(order.promisedAt)}
              </Typography>
            ) : null}
          </DetailField>

          <Divider />

          <DetailField label="Customer ID">
            <Typography fontWeight={800}>{customerId}</Typography>
          </DetailField>
          <DetailField label="Customer">
            <Typography fontWeight={800}>{name}</Typography>
          </DetailField>
          <DetailField label="Details">
            <Typography variant="body2">{phone || '—'}</Typography>
            <Typography variant="body2">{order?.customerAddress || '—'}</Typography>
          </DetailField>

          <Divider />

          <DetailField label="Submitted">
            <Typography fontWeight={800}>{formatDateTime(row.createdAt)}</Typography>
          </DetailField>
          <DetailField label="Message">
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.message}</Typography>
          </DetailField>
          <DetailField label="Consent">
            <Typography fontWeight={800}>{row.consent ? 'Yes — may publish' : 'No — keep private'}</Typography>
            {!row.consent ? (
              <Typography variant="caption" color="text.secondary">
                Approve is blocked. The customer did not allow a public testimonial.
              </Typography>
            ) : null}
          </DetailField>
          <DetailField label="Status">
            <StatusChip status={row.status} label={FEEDBACK_STATUS_LABELS[row.status]} />
          </DetailField>
          <DetailField label="Home page">
            <Typography fontWeight={800}>
              {testimonial?.active ? 'Visible' : testimonial ? 'Hidden' : 'Not published'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Only the message is published. Order ID and contact details stay private.
            </Typography>
            <Typography fontWeight={800} sx={{ fontStyle: 'italic', mt: 0.75 }}>
              “{row.message}”
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Shown as {publicDisplayName(name)}
            </Typography>
          </DetailField>
          <DetailField label="Moderator">
            <Typography>{row.moderator || '—'}</Typography>
          </DetailField>
        </Stack>
      ) : null}
    </AppModal>
  );
}
