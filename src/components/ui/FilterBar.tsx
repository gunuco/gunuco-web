import { Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { brand } from '@/theme/colors';

export const tableSurfaces = {
  search: brand.creamPaper,
  body: brand.creamPaper,
} as const;

/** Stable labels: always shrunk so fields do not jump on click. */
export const filterFieldProps = {
  size: 'small' as const,
  InputLabelProps: { shrink: true },
};

export function FilterBar({
  connected,
  children,
}: {
  connected?: boolean;
  children: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      gap={1.5}
      flexWrap="wrap"
      alignItems="center"
      sx={{
        p: 1.5,
        pl: 2,
        borderRadius: connected ? '12px 12px 0 0' : 1.5,
        bgcolor: tableSurfaces.search,
        border: `1px solid ${brand.line}`,
        borderBottom: connected ? 'none' : undefined,
        '& .MuiInputLabel-root': {
          color: brand.muted,
          fontWeight: 700,
          transition: 'none',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: brand.wine,
        },
        '& .MuiInputLabel-root.Mui-disabled': {
          color: alpha(brand.muted, 0.7),
        },
        '& .MuiOutlinedInput-root': {
          bgcolor: '#FAFAF8',
          color: brand.ink,
          minHeight: 40,
          '& fieldset': { borderColor: brand.line },
          '&:hover fieldset': { borderColor: brand.goldDark },
          '&.Mui-focused fieldset': { borderColor: brand.wine },
          '&.Mui-disabled': {
            bgcolor: alpha(brand.cream, 0.8),
          },
          '& input, & .MuiSelect-select': {
            color: brand.ink,
            WebkitTextFillColor: brand.ink,
          },
        },
      }}
    >
      {children}
    </Stack>
  );
}
