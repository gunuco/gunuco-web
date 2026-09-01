import { Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { brand } from '@/theme/colors';

export const tableSurfaces = {
  search: brand.creamPaper,
  body: brand.creamPaper,
} as const;

export const filterSelectMenuProps = {
  displayEmpty: true,
  MenuProps: {
    anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
    transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
    marginThreshold: 8,
    disableScrollLock: true,
    PaperProps: { sx: { mt: 0.5, maxHeight: 280 } },
  },
};

/** Stable labels: always shrunk so fields do not jump on click. */
export const filterFieldProps = {
  size: 'small' as const,
  InputLabelProps: { shrink: true },
  SelectProps: filterSelectMenuProps,
};

export function FilterBar({
  connected,
  singleRow,
  children,
}: {
  connected?: boolean;
  singleRow?: boolean;
  children: ReactNode;
}) {
  return (
    <Stack
      direction={singleRow ? 'row' : { xs: 'column', md: 'row' }}
      gap={1.5}
      flexWrap={singleRow ? 'nowrap' : 'wrap'}
      alignItems="center"
      sx={{
        p: 1.5,
        pl: 2,
        borderRadius: connected ? '12px 12px 0 0' : 1.5,
        bgcolor: tableSurfaces.search,
        border: `1px solid ${brand.line}`,
        borderBottom: connected ? 'none' : undefined,
        overflowX: singleRow ? 'auto' : 'visible',
        width: '100%',
        minWidth: 0,
        WebkitOverflowScrolling: singleRow ? 'touch' : undefined,
        '& .MuiTextField-root': singleRow
          ? { minWidth: 140, flex: '0 0 auto' }
          : {
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 140 },
              flex: { xs: '1 1 100%', sm: '1 1 140px' },
            },
        '& > .MuiButton-root': singleRow
          ? { flex: '0 0 auto' }
          : { width: { xs: '100%', sm: 'auto' } },
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
