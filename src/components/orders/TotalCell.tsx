import { Box } from '@mui/material';
import { formatCurrency } from '@/utils/format';
import { semantic } from '@/theme/colors';

export function TotalCell({ amount, paid }: { amount: number; paid: boolean }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 0.85,
        py: 0.25,
        borderRadius: 0.8,
        bgcolor: paid ? semantic.successBg : semantic.warningBg,
        color: paid ? semantic.successFg : semantic.warningFg,
        fontWeight: 800,
        fontSize: 13,
        whiteSpace: 'nowrap',
        lineHeight: 1.35,
      }}
    >
      {formatCurrency(amount)}
    </Box>
  );
}
