import { Stack } from '@mui/material';
import type { ReactNode } from 'react';

export function RowControls({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="row"
      gap={0.75}
      flexWrap="wrap"
      justifyContent="center"
      useFlexGap
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Stack>
  );
}
