import { Box, CircularProgress, Typography } from '@mui/material';

export function RouteFallback() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      <CircularProgress size={28} aria-label="Loading page" />
      <Typography variant="body2" color="text.secondary">
        Loading…
      </Typography>
    </Box>
  );
}
