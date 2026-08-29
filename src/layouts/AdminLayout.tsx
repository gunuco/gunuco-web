import { Alert, Box, Snackbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { PageFade } from '@/components/ui/PageFade';
import { SkipLink } from '@/components/ui/SkipLink';
import { Header } from '@/layouts/Header';
import { Sidebar, SIDEBAR_WIDTH } from '@/layouts/Sidebar';
import { useUiStore } from '@/store/uiStore';

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'clip' }}>
      <SkipLink />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Header onMenu={() => setMobileOpen(true)} />
      <Box
        id="main-content"
        component="main"
        tabIndex={-1}
        sx={{
          ml: { lg: `${SIDEBAR_WIDTH}px` },
          px: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 1.25, md: 1.5 },
          pb: { xs: 2, md: 2.5 },
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          maxWidth: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <PageFade>
          <Outlet />
        </PageFade>
      </Box>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3200}
        onClose={clearToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={clearToast} severity={toast?.severity ?? 'info'} variant="filled" sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
