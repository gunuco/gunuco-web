import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Chip, Divider, InputAdornment, Stack, Switch, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { DetailField } from '@/components/ui/DetailField';
import { formatMinOrder, formatOfferReward, formatUsage } from '@/features/offers/offerUtils';
import { brand } from '@/theme/colors';
import type { Category, Offer, OfferAppliesTo, OfferKind, OfferReward, Product } from '@/types';

export const emptyOfferForm = {
  name: '',
  description: '',
  kind: 'coupon' as OfferKind,
  code: '',
  reward: 'percent' as OfferReward,
  value: '10',
  minOrderAmount: '',
  maxDiscount: '',
  appliesTo: 'all' as OfferAppliesTo,
  categoryIds: [] as string[],
  productIds: [] as string[],
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  active: true,
};

export type OfferForm = typeof emptyOfferForm;

export function formFromOffer(row: Offer): OfferForm {
  return {
    name: row.name,
    description: row.description,
    kind: row.kind,
    code: row.code,
    reward: row.reward,
    value: String(row.value),
    minOrderAmount: row.minOrderAmount ? String(row.minOrderAmount) : '',
    maxDiscount: row.maxDiscount != null ? String(row.maxDiscount) : '',
    appliesTo: row.appliesTo,
    categoryIds: [...row.categoryIds],
    productIds: [...row.productIds],
    startsAt: row.startsAt.slice(0, 10),
    endsAt: row.endsAt.slice(0, 10),
    usageLimit: row.usageLimit != null ? String(row.usageLimit) : '',
    active: row.active,
  };
}

function ChoiceChip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Chip
      clickable={!disabled}
      size="small"
      variant="outlined"
      label={label}
      onClick={disabled ? undefined : onClick}
      sx={{
        fontWeight: selected ? 800 : 700,
        bgcolor: selected ? alpha(brand.wine, 0.14) : brand.creamPaper,
        border: `1.5px solid ${selected ? brand.wine : brand.line}`,
        color: selected ? brand.wine : brand.ink,
        '& .MuiChip-label': { color: 'inherit' },
      }}
    />
  );
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function OfferDialog({
  open,
  isNew,
  form,
  used,
  canEdit,
  saving,
  deleting,
  categories,
  products,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  isNew: boolean;
  form: OfferForm;
  used?: number;
  canEdit: boolean;
  saving: boolean;
  deleting?: boolean;
  categories: Category[];
  products: Product[];
  onChange: (next: Partial<OfferForm>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  const leafCategories = categories.filter((c) => c.parentId != null);
  const canSave =
    Boolean(form.name.trim()) &&
    Boolean(form.value) &&
    (form.kind === 'automatic' || Boolean(form.code.trim())) &&
    (form.appliesTo !== 'category' || form.categoryIds.length > 0) &&
    (form.appliesTo !== 'product' || form.productIds.length > 0);

  return (
    <AppModal
      open={open}
      title={isNew ? 'New offer' : form.kind === 'coupon' ? 'Edit coupon' : 'Edit offer'}
      onClose={onClose}
      maxWidth="md"
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
            <Button variant="contained" disabled={!canSave || saving} onClick={onSave}>
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
            </Button>
          </>
        ) : null
      }
    >
      <Stack gap={2}>
        <DetailField label="Name">
          {canEdit ? (
            <TextField
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              required
              fullWidth
              placeholder="Festive 10% on casual cakes"
            />
          ) : (
            <Typography fontWeight={800}>{form.name || '—'}</Typography>
          )}
        </DetailField>
        <DetailField label="Description">
          {canEdit ? (
            <TextField
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              placeholder="Shown internally. Keep it short — when it applies and any cap."
            />
          ) : (
            <Typography>{form.description || '—'}</Typography>
          )}
        </DetailField>

        <Divider />

        <DetailField label="How it applies">
          {canEdit ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <ChoiceChip
                label="Automatic"
                selected={form.kind === 'automatic'}
                onClick={() => onChange({ kind: 'automatic', code: '' })}
              />
              <ChoiceChip
                label="Coupon code"
                selected={form.kind === 'coupon'}
                onClick={() => onChange({ kind: 'coupon' })}
              />
            </Stack>
          ) : (
            <Typography fontWeight={800}>{form.kind === 'coupon' ? 'Coupon' : 'Automatic'}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {form.kind === 'coupon'
              ? 'Customer enters this code at checkout.'
              : 'Applied automatically when the cart matches the rules. No code.'}
          </Typography>
        </DetailField>

        {form.kind === 'coupon' ? (
          <DetailField label="Coupon code">
            {canEdit ? (
              <TextField
                value={form.code}
                onChange={(e) => onChange({ code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                required
                fullWidth
                placeholder="GUNUCO50"
                inputProps={{ style: { letterSpacing: '0.08em', fontWeight: 800 } }}
              />
            ) : (
              <Typography fontWeight={800}>{form.code || '—'}</Typography>
            )}
          </DetailField>
        ) : null}

        <DetailField label="Discount">
          {canEdit ? (
            <Stack gap={1.25}>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <ChoiceChip
                  label="Percent"
                  selected={form.reward === 'percent'}
                  onClick={() => onChange({ reward: 'percent' })}
                />
                <ChoiceChip
                  label="Flat ₹"
                  selected={form.reward === 'flat'}
                  onClick={() => onChange({ reward: 'flat', maxDiscount: '' })}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                <TextField
                  label={form.reward === 'percent' ? 'Percent off' : 'Amount off'}
                  type="number"
                  value={form.value}
                  onChange={(e) => onChange({ value: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment:
                      form.reward === 'flat' ? <InputAdornment position="start">₹</InputAdornment> : undefined,
                    endAdornment:
                      form.reward === 'percent' ? <InputAdornment position="end">%</InputAdornment> : undefined,
                  }}
                />
                {form.reward === 'percent' ? (
                  <TextField
                    label="Max discount"
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => onChange({ maxDiscount: e.target.value })}
                    fullWidth
                    placeholder="Optional cap"
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    helperText="Leave empty for no cap"
                  />
                ) : null}
              </Stack>
            </Stack>
          ) : (
            <Typography fontWeight={800}>
              {formatOfferReward({
                reward: form.reward,
                value: Number(form.value) || 0,
                maxDiscount: form.maxDiscount.trim() === '' ? null : Number(form.maxDiscount),
              })}
            </Typography>
          )}
        </DetailField>

        <DetailField label="Min order amount">
          {canEdit ? (
            <TextField
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => onChange({ minOrderAmount: e.target.value })}
              fullWidth
              placeholder="0 = no minimum"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              helperText="Offer only applies once the cart reaches this total."
            />
          ) : (
            <Typography fontWeight={800}>{formatMinOrder(Number(form.minOrderAmount) || 0)}</Typography>
          )}
        </DetailField>

        <Divider />

        <DetailField label="Applies to">
          {canEdit ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <ChoiceChip
                label="Entire cart"
                selected={form.appliesTo === 'all'}
                onClick={() => onChange({ appliesTo: 'all' })}
              />
              <ChoiceChip
                label="Categories"
                selected={form.appliesTo === 'category'}
                onClick={() => onChange({ appliesTo: 'category' })}
              />
              <ChoiceChip
                label="Products"
                selected={form.appliesTo === 'product'}
                onClick={() => onChange({ appliesTo: 'product' })}
              />
            </Stack>
          ) : (
            <Typography fontWeight={800}>
              {form.appliesTo === 'all' ? 'Entire cart' : form.appliesTo === 'category' ? 'Categories' : 'Products'}
            </Typography>
          )}
        </DetailField>

        {form.appliesTo === 'category' ? (
          <DetailField label="Categories">
            <ChipBox>
              {leafCategories.map((category) => (
                <ChoiceChip
                  key={category.id}
                  label={category.name}
                  selected={form.categoryIds.includes(category.id)}
                  disabled={!canEdit}
                  onClick={() => onChange({ categoryIds: toggleId(form.categoryIds, category.id) })}
                />
              ))}
            </ChipBox>
          </DetailField>
        ) : null}

        {form.appliesTo === 'product' ? (
          <DetailField label="Products">
            <ChipBox>
              {products.map((product) => (
                <ChoiceChip
                  key={product.id}
                  label={product.name}
                  selected={form.productIds.includes(product.id)}
                  disabled={!canEdit}
                  onClick={() => onChange({ productIds: toggleId(form.productIds, product.id) })}
                />
              ))}
            </ChipBox>
          </DetailField>
        ) : null}

        <Divider />

        <DetailField label="Schedule">
          {canEdit ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                label="Starts"
                type="date"
                value={form.startsAt}
                onChange={(e) => onChange({ startsAt: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ends"
                type="date"
                value={form.endsAt}
                onChange={(e) => onChange({ endsAt: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          ) : (
            <Typography>
              {form.startsAt} – {form.endsAt}
            </Typography>
          )}
        </DetailField>

        <DetailField label="Usage limit">
          {canEdit ? (
            <TextField
              type="number"
              value={form.usageLimit}
              onChange={(e) => onChange({ usageLimit: e.target.value })}
              fullWidth
              placeholder="Leave empty for unlimited"
              helperText={!isNew && used != null ? `${used} used so far` : 'Total redemptions allowed across all customers.'}
            />
          ) : (
            <Typography>
              {formatUsage({
                used: used ?? 0,
                usageLimit: form.usageLimit.trim() === '' ? null : Number(form.usageLimit),
              } as Offer)}
            </Typography>
          )}
        </DetailField>

        <DetailField label="Status">
          {canEdit ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch size="small" checked={form.active} onChange={(_, on) => onChange({ active: on })} />
              <Typography fontWeight={800}>{form.active ? 'Active' : 'Off'}</Typography>
            </Stack>
          ) : (
            <Typography>{form.active ? 'Active' : 'Off'}</Typography>
          )}
        </DetailField>
      </Stack>
    </AppModal>
  );
}

function ChipBox({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75,
        maxHeight: 200,
        overflow: 'auto',
        p: 1.25,
        borderRadius: 1.2,
        border: `1px solid ${brand.line}`,
        bgcolor: brand.cream,
      }}
    >
      {children}
    </Box>
  );
}
