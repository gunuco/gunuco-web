import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { AppModal } from '@/components/ui/AppModal';
import { DetailField } from '@/components/ui/DetailField';
import { brand } from '@/theme/colors';
import type { Testimonial } from '@/types';

export const emptyTestimonialForm = {
  displayName: '',
  quote: '',
  channels: ['website'] as Array<'app' | 'website'>,
  active: true,
};

export type TestimonialForm = typeof emptyTestimonialForm;

export function formFromTestimonial(row: Testimonial): TestimonialForm {
  return {
    displayName: row.displayName,
    quote: row.quote,
    channels: [...row.channels],
    active: row.active,
  };
}

function toggleChannel(channels: Array<'app' | 'website'>, value: 'app' | 'website') {
  if (channels.includes(value)) {
    const next = channels.filter((c) => c !== value);
    return next.length ? next : channels;
  }
  return [...channels, value];
}

export function TestimonialDialog({
  open,
  form,
  canEdit,
  saving,
  deleting,
  onChange,
  onClose,
  onSave,
  onDelete,
  onHide,
  onUnhide,
}: {
  open: boolean;
  form: TestimonialForm;
  canEdit: boolean;
  saving: boolean;
  deleting?: boolean;
  onChange: (next: Partial<TestimonialForm>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onHide: () => void;
  onUnhide: () => void;
}) {
  const busy = saving || deleting;
  const canSave = Boolean(form.displayName.trim() && form.quote.trim());

  return (
    <AppModal
      open={open}
      title="Testimonial"
      onClose={onClose}
      maxWidth="sm"
      actions={
        canEdit ? (
          <>
            {onDelete ? (
              <Button
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                disabled={busy}
                onClick={onDelete}
              >
                Delete
              </Button>
            ) : null}
            {form.active ? (
              <Button
                startIcon={<VisibilityOffRoundedIcon />}
                disabled={busy}
                onClick={onHide}
              >
                Hide
              </Button>
            ) : (
              <Button
                startIcon={<VisibilityRoundedIcon />}
                disabled={busy}
                onClick={onUnhide}
              >
                Unhide
              </Button>
            )}
            <Button variant="contained" disabled={!canSave || busy} onClick={onSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        ) : null
      }
    >
      <Stack gap={2}>
        <DetailField label="Display name">
          {canEdit ? (
            <TextField
              value={form.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              fullWidth
              helperText="Public name only — never a full legal name, phone, or Order ID."
            />
          ) : (
            <Typography fontWeight={800}>{form.displayName}</Typography>
          )}
        </DetailField>
        <DetailField label="Home page message">
          {canEdit ? (
            <TextField
              value={form.quote}
              onChange={(e) => onChange({ quote: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          ) : (
            <Typography sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>“{form.quote}”</Typography>
          )}
        </DetailField>
        <DetailField label="Channels">
          {canEdit ? (
            <Stack direction="row" gap={0.75}>
              {(['website', 'app'] as const).map((channel) => {
                const on = form.channels.includes(channel);
                return (
                  <Chip
                    key={channel}
                    clickable
                    size="small"
                    variant="outlined"
                    label={channel === 'website' ? 'Website' : 'App'}
                    onClick={() => onChange({ channels: toggleChannel(form.channels, channel) })}
                    sx={{
                      fontWeight: on ? 800 : 700,
                      bgcolor: on ? alpha(brand.wine, 0.14) : brand.creamPaper,
                      border: `1.5px solid ${on ? brand.wine : brand.line}`,
                      color: on ? brand.wine : brand.ink,
                      '& .MuiChip-label': { color: 'inherit' },
                    }}
                  />
                );
              })}
            </Stack>
          ) : (
            <Typography>{form.channels.join(', ') || '—'}</Typography>
          )}
        </DetailField>
        <DetailField label="Home page">
          <Typography fontWeight={800}>{form.active ? 'Visible' : 'Hidden'}</Typography>
        </DetailField>
      </Stack>
    </AppModal>
  );
}
