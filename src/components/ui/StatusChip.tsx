import { Box, Chip } from '@mui/material';
import { STATUS_COLOR } from '@/constants/status';
import { brand, semantic } from '@/theme/colors';

interface StatusChipProps {
  status: string;
  label?: string;
}

const DOT: Record<string, string> = {
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
  orange: semantic.warning,
  default: '#A8A29E',
};

const TONE: Record<string, { bg: string; fg: string }> = {
  success: { bg: semantic.successBg, fg: semantic.successFg },
  warning: { bg: semantic.warningBg, fg: semantic.warningFg },
  error: { bg: semantic.errorBg, fg: semantic.errorFg },
  info: { bg: semantic.infoBg, fg: semantic.infoFg },
  orange: { bg: semantic.warningBg, fg: semantic.warningFg },
  default: { bg: brand.cream, fg: brand.ink },
};

export function StatusChip({ status, label }: StatusChipProps) {
  const color = STATUS_COLOR[status] ?? 'default';
  return (
    <Chip
      size="small"
      variant="outlined"
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: DOT[color],
              boxShadow: `0 0 0 3px ${DOT[color]}22`,
            }}
          />
          {label ?? status.replaceAll('_', ' ')}
        </Box>
      }
      sx={{
        textTransform: 'capitalize',
        borderColor: 'transparent',
        bgcolor: TONE[color].bg,
        color: TONE[color].fg,
        fontWeight: 650,
        height: 24,
        maxWidth: '100%',
        minWidth: 0,
        flexShrink: 1,
        '& .MuiChip-label': {
          px: 0.75,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  );
}
