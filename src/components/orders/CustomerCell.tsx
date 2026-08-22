import { Box, Link, Stack, Tooltip, Typography } from '@mui/material';
import { HighlightName } from '@/components/orders/HighlightName';

const clamp2 = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
} as const;

export function CustomerCell({
  name,
  phone,
  address,
}: {
  name?: string;
  phone: string;
  address: string;
}) {
  const full = [name, phone, address].filter(Boolean).join('\n');
  return (
    <Tooltip
      title={<Box sx={{ whiteSpace: 'pre-line', maxWidth: 280 }}>{full}</Box>}
      placement="top"
      enterDelay={250}
    >
      <Stack alignItems="center" gap={0.15} sx={{ minWidth: 0, width: '100%', textAlign: 'center', cursor: 'default' }}>
        {name ? <HighlightName value={name} tone="wine" /> : null}
        <Link
          href={`tel:${phone.replace(/\s/g, '')}`}
          underline="hover"
          onClick={(e) => e.stopPropagation()}
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.3,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {phone}
        </Link>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.3,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {address}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

export function CustomizationsCell({ value }: { value: string }) {
  if (!value) return null;
  return (
    <Tooltip title={<Box sx={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{value}</Box>} placement="top" enterDelay={250}>
      <Typography
        variant="body2"
        sx={{
          ...clamp2,
          lineHeight: 1.35,
          fontSize: 12.5,
          textAlign: 'center',
          width: '100%',
          cursor: 'default',
        }}
      >
        {value}
      </Typography>
    </Tooltip>
  );
}
