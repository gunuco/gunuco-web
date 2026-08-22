import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { brand } from '@/theme/colors';
import { formatShortDateTime } from '@/utils/format';

export function OrderIdCell({ orderNumber, placedAt }: { orderNumber: string; placedAt: string }) {
  return (
    <Stack alignItems="center" gap={0.5} sx={{ width: '100%' }}>
      <Typography fontWeight={800} fontSize={13.5} sx={{ letterSpacing: '0.01em', lineHeight: 1.2 }}>
        {orderNumber}
      </Typography>
      <Box
        sx={{
          px: 0.85,
          py: 0.2,
          borderRadius: 1,
          bgcolor: alpha(brand.gold, 0.16),
          border: `1px solid ${alpha(brand.gold, 0.28)}`,
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: brand.goldDark, lineHeight: 1.35 }}>
          {formatShortDateTime(placedAt)}
        </Typography>
      </Box>
    </Stack>
  );
}
