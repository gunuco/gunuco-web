import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { brand } from '@/theme/colors';

export function HighlightName({
  value,
  tone = 'wine',
}: {
  value: string;
  tone?: 'wine' | 'gold';
}) {
  const wine = tone === 'wine';
  return (
    <Box
      title={value}
      sx={{
        display: 'inline-block',
        maxWidth: '100%',
        px: 0.85,
        py: 0.25,
        borderRadius: 0.8,
        bgcolor: wine ? alpha(brand.wine, 0.1) : alpha(brand.gold, 0.18),
        border: `1px solid ${wine ? alpha(brand.wine, 0.18) : alpha(brand.gold, 0.32)}`,
      }}
    >
      <Typography
        noWrap
        fontSize={13}
        fontWeight={750}
        sx={{ color: wine ? brand.wine : brand.goldDark, lineHeight: 1.35 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
