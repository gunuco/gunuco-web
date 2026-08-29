import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export function PageFade({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <Box key={location.pathname} className="page-fade">
      {children}
    </Box>
  );
}
