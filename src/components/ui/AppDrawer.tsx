import { Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { ReactNode } from 'react';

interface AppDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}

export function AppDrawer({ open, title, onClose, children, width = 460, footer }: AppDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: width }, p: 0 } }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <Stack sx={{ px: 2.5, pb: 2.5, gap: 2, flex: 1, overflow: 'auto' }}>{children}</Stack>
        {footer ? <Stack sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider' }}>{footer}</Stack> : null}
      </Stack>
    </Drawer>
  );
}
