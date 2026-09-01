import { Box, Stack, Typography } from '@mui/material';
import logo from '@/assets/gunuco-logo.jpg';
import { brand } from '@/theme/colors';

interface GunucoMarkProps {
  size?: number;
  withWordmark?: boolean;
  inverted?: boolean;
  priority?: boolean;
}

/** Wordmark + giraffe mark. */
export function GunucoMark({
  size = 40,
  withWordmark = false,
  inverted = false,
  priority = false,
}: GunucoMarkProps) {
  return (
    <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
      <Box
        component="img"
        src={logo}
        alt={withWordmark ? '' : 'GUNUCO'}
        width={size}
        height={size}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          bgcolor: brand.wine,
          boxShadow: inverted
            ? `0 0 0 2px ${brand.gold}aa, 0 8px 18px ${brand.wineDark}47`
            : `0 0 0 2px ${brand.gold}55, 0 8px 18px ${brand.wine}38`,
        }}
      />
      {withWordmark ? (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Fraunces Variable", "Fraunces", serif',
              fontWeight: 650,
              letterSpacing: '-0.04em',
              fontSize: size > 36 ? 22 : 18,
              lineHeight: 1,
              color: inverted ? brand.cream : brand.wine,
            }}
          >
            GUNUCO
          </Typography>
          <Typography
            sx={{
              mt: 0.35,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: inverted ? 'rgba(247,241,234,0.88)' : brand.goldDark,
            }}
          >
            ATELIER
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}
