import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { ReactNode } from 'react';

interface AppModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AppModal({ open, title, onClose, children, actions, maxWidth = 'sm' }: AppModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth disableScrollLock>
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }} size="small" aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>{actions}</DialogActions> : null}
    </Dialog>
  );
}
