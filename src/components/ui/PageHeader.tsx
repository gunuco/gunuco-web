import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { brand } from '@/theme/colors';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  loading?: boolean;
  highlightTitle?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  loading,
  highlightTitle = false,
}: PageHeaderProps) {
  if (loading) {
    return (
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Skeleton width={420} height={32} />
      </Stack>
    );
  }

  const detail = [eyebrow, subtitle].filter(Boolean).join(' - ');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'baseline' }}
      gap={1.5}
      sx={{ mb: 1 }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'baseline' }}
        gap={{ xs: 0.5, md: 1.25 }}
        sx={{ minWidth: 0, flex: 1, flexWrap: 'wrap' }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: 22, md: 26 },
            lineHeight: 1.2,
            flexShrink: 0,
            ...(highlightTitle
              ? {
                  color: brand.wine,
                  borderBottom: `2px solid ${brand.gold}`,
                  pb: 0.15,
                  letterSpacing: '-0.02em',
                }
              : null),
          }}
        >
          {title}
        </Typography>
        {detail ? (
          <Typography
            variant="body2"
            color="text.secondary"
            title={detail}
            sx={{ lineHeight: 1.35, minWidth: 0 }}
          >
            {eyebrow ? (
              <Box component="span" sx={{ color: 'secondary.dark', fontWeight: 700 }}>
                {eyebrow}
              </Box>
            ) : null}
            {eyebrow && subtitle ? ' - ' : null}
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {actions ? (
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      ) : null}
    </Stack>
  );
}

export function CountChip({ label }: { label: string }) {
  return <Chip size="small" label={label} />;
}
