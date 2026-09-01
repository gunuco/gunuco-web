import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Button, Chip, Divider, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AppModal } from '@/components/ui/AppModal';
import { DetailField } from '@/components/ui/DetailField';
import { CUSTOM_CAKE_STATUS_LABELS } from '@/constants/status';
import { customerIdFromPhone } from '@/features/support/customerLookup';
import { brand } from '@/theme/colors';
import type { CustomCakeRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export const emptyCakeForm = {
  customerName: '',
  phone: '',
  occasion: '',
  flavour: '',
  weightKg: '1',
  notes: '',
  quotedPrice: '',
  status: 'new' as CustomCakeRequest['status'],
};

export type CakeForm = typeof emptyCakeForm;

export function formFromCake(row: CustomCakeRequest): CakeForm {
  return {
    customerName: row.customerName,
    phone: row.phone,
    occasion: row.occasion,
    flavour: row.flavour,
    weightKg: String(row.weightKg),
    notes: row.notes,
    quotedPrice: row.quotedPrice != null ? String(row.quotedPrice) : '',
    status: row.status,
  };
}

export function CustomCakeDialog({
  open,
  isNew,
  form,
  receivedAt,
  canEdit,
  saving,
  deleting,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  isNew: boolean;
  form: CakeForm;
  receivedAt?: string;
  canEdit: boolean;
  saving: boolean;
  deleting?: boolean;
  onChange: (next: Partial<CakeForm>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  const customerId = customerIdFromPhone(form.phone, form.customerName);

  return (
    <AppModal
      open={open}
      title={isNew ? 'New custom cake' : 'Custom cake'}
      onClose={onClose}
      maxWidth="sm"
      actions={
        canEdit ? (
          <>
            {!isNew && onDelete ? (
              <Button
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                disabled={saving || deleting}
                onClick={onDelete}
              >
                Delete
              </Button>
            ) : null}
            <Button variant="contained" disabled={!form.customerName.trim() || saving} onClick={onSave}>
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
            </Button>
          </>
        ) : null
      }
    >
      <Stack gap={2}>
        <DetailField label="Customer ID">
          <Typography fontWeight={800}>{customerId}</Typography>
        </DetailField>
        <DetailField label="Customer">
          {canEdit ? (
            <TextField
              value={form.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
              required
              fullWidth
            />
          ) : (
            <Typography fontWeight={800}>{form.customerName || '—'}</Typography>
          )}
        </DetailField>
        <DetailField label="Details">
          {canEdit ? (
            <TextField value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} fullWidth />
          ) : (
            <Typography variant="body2">{form.phone || '—'}</Typography>
          )}
        </DetailField>

        <Divider />

        <DetailField label="Occasion">
          {canEdit ? (
            <TextField value={form.occasion} onChange={(e) => onChange({ occasion: e.target.value })} fullWidth />
          ) : (
            <Typography>{form.occasion || '—'}</Typography>
          )}
        </DetailField>
        <DetailField label="Flavour">
          {canEdit ? (
            <TextField value={form.flavour} onChange={(e) => onChange({ flavour: e.target.value })} fullWidth />
          ) : (
            <Typography>{form.flavour || '—'}</Typography>
          )}
        </DetailField>
        <DetailField label="Weight">
          {canEdit ? (
            <TextField
              type="number"
              value={form.weightKg}
              onChange={(e) => onChange({ weightKg: e.target.value })}
              fullWidth
              InputProps={{ endAdornment: <Typography color="text.secondary">kg</Typography> }}
            />
          ) : (
            <Typography>{form.weightKg} kg</Typography>
          )}
        </DetailField>
        <DetailField label="Selected option">
          {canEdit ? (
            <TextField
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              multiline
              minRows={2}
              fullWidth
              placeholder="Tiers, finish, lettering, dietary notes…"
            />
          ) : (
            <Typography>{form.notes || '—'}</Typography>
          )}
        </DetailField>

        <Divider />

        <DetailField label="Quote">
          {canEdit ? (
            <TextField
              type="number"
              value={form.quotedPrice}
              onChange={(e) => onChange({ quotedPrice: e.target.value })}
              fullWidth
              placeholder="Optional"
              InputProps={{
                startAdornment: (
                  <Typography color="text.secondary" sx={{ mr: 0.75, fontWeight: 700 }}>
                    ₹
                  </Typography>
                ),
              }}
            />
          ) : (
            <Typography fontWeight={800}>
              {form.quotedPrice ? formatCurrency(Number(form.quotedPrice)) : '—'}
            </Typography>
          )}
        </DetailField>
        <DetailField label="Status">
          {canEdit ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {(Object.entries(CUSTOM_CAKE_STATUS_LABELS) as Array<[CustomCakeRequest['status'], string]>).map(
                ([value, label]) => {
                  const on = form.status === value;
                  return (
                    <Chip
                      key={value}
                      clickable
                      size="small"
                      variant="outlined"
                      label={label}
                      onClick={() => onChange({ status: value })}
                      sx={{
                        fontWeight: on ? 800 : 700,
                        bgcolor: on ? alpha(brand.wine, 0.14) : brand.creamPaper,
                        border: `1.5px solid ${on ? brand.wine : brand.line}`,
                        color: on ? brand.wine : brand.ink,
                        '& .MuiChip-label': { color: 'inherit' },
                      }}
                    />
                  );
                },
              )}
            </Stack>
          ) : (
            <Typography>{CUSTOM_CAKE_STATUS_LABELS[form.status]}</Typography>
          )}
        </DetailField>
        {!isNew && receivedAt ? (
          <DetailField label="Received">
            <Typography>{formatDate(receivedAt)}</Typography>
          </DetailField>
        ) : null}
      </Stack>
    </AppModal>
  );
}
