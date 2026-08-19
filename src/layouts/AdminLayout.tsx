import { Alert, Box, Snackbar } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Sidebar, SIDEBAR_WIDTH } from '@/layouts/Sidebar';
import { useUiStore } from '@/store/uiStore';

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Header onMenu={() => setMobileOpen(true)} />
      <Box
        component="main"
        sx={{
          ml: { lg: `${SIDEBAR_WIDTH}px` },
          px: { xs: 2, md: 3 },
          pt: { xs: 1.25, md: 1.5 },
          pb: { xs: 2, md: 2.5 },
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
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
