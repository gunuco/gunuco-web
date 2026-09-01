import { createTheme } from '@mui/material/styles';
import { brand, semantic } from '@/theme/colors';

/**
 * xs = phone only. sm/md/lg all start at 768px so small laptops,
 * large laptops and desktops share one layout. Content uses % widths.
 */
const sans = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", "Segoe UI", sans-serif';

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 768,
      lg: 768,
      xl: 1536,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: brand.wine,
      light: brand.wineMid,
      dark: brand.wineDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brand.gold,
      light: brand.goldLight,
      dark: brand.goldDark,
      contrastText: brand.ink,
    },
    background: {
      default: brand.cream,
      paper: brand.creamPaper,
    },
    text: {
      primary: brand.ink,
      secondary: brand.muted,
    },
    divider: brand.line,
    success: { main: semantic.success, light: semantic.successBg },
    warning: { main: semantic.warning, light: semantic.warningBg },
    error: { main: semantic.error, light: semantic.errorBg },
    info: { main: semantic.info, light: semantic.infoBg },
  },
  typography: {
    fontFamily: sans,
    h1: { fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    subtitle1: { fontWeight: 650 },
    subtitle2: { fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 },
    button: { textTransform: 'none', fontWeight: 650 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 8px 24px rgba(22, 19, 20, 0.05)',
    '0 12px 32px rgba(22, 19, 20, 0.06)',
    '0 16px 40px rgba(22, 19, 20, 0.07)',
    '0 20px 48px rgba(22, 19, 20, 0.08)',
    '0 20px 48px rgba(22, 19, 20, 0.08)',
    '0 20px 48px rgba(22, 19, 20, 0.08)',
    '0 20px 48px rgba(22, 19, 20, 0.08)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 1px 2px rgba(22, 19, 20, 0.04)',
    '0 20px 48px rgba(22, 19, 20, 0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: brand.cream },
        '::-webkit-scrollbar': { width: 8, height: 8 },
        '::-webkit-scrollbar-thumb': { background: brand.line, borderRadius: 8 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16, minHeight: 44 },
        sizeSmall: { minHeight: 32, paddingInline: 10, fontSize: 12 },
        containedPrimary: {
          boxShadow: '0 6px 16px rgba(93, 0, 30, 0.18)',
        },
        outlined: {
          borderColor: brand.line,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: {
          boxShadow: '0 8px 24px rgba(22,19,20,0.04)',
          border: `1px solid ${brand.line}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(22,19,20,0.04)',
          border: `1px solid ${brand.line}`,
          borderRadius: 16,
          backgroundColor: brand.creamPaper,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 650, borderRadius: 999 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: brand.creamPaper,
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          marginThreshold: 8,
          disableScrollLock: true,
          PaperProps: {
            sx: {
              mt: 0.5,
              maxHeight: 280,
            },
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
        marginThreshold: 8,
      },
      styleOverrides: {
        paper: {
          marginTop: 4,
          maxHeight: 280,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none' } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: brand.wineDark,
          fontSize: 12,
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44 },
        sizeSmall: { minWidth: 40, minHeight: 40 },
      },
    },
  },
});
