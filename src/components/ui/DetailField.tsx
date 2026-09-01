import { Box, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { brand } from '@/theme/colors';

/** Wine + gold section label used in Orders popups. Use this for every details view. */
export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap={0.75}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          px: 1,
          py: 0.35,
          borderRadius: 0.8,
          bgcolor: brand.wine,
          color: brand.cream,
          fontSize: 11.5,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.35,
          borderBottom: `2px solid ${brand.gold}`,
        }}
      >
        {label}
      </Box>
      {children}
    </Stack>
  );
}
