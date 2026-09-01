import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Stack, Typography } from '@mui/material';

export class PanelErrorBoundary extends Component<
  { children: ReactNode; fallbackTitle?: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Stack gap={1.25} sx={{ p: 3 }}>
          <Typography fontWeight={800}>{this.props.fallbackTitle ?? 'Could not open this panel'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {this.state.error.message}
          </Typography>
          <Button type="button" variant="outlined" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
        </Stack>
      );
    }
    return this.props.children;
  }
}
