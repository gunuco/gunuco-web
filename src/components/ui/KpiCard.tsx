import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { ReactNode } from 'react';
import { brand } from '@/theme/colors';
import { percentChange } from '@/utils/format';

interface KpiCardProps {
  label: string;
  value: string;
  change?: number;
  hint?: string;
  icon?: ReactNode;
  loading?: boolean;
  spark?: number[];
  accent?: string;
  variant?: 'soft' | 'solid';
}

export function KpiCard({
  label,
  value,
  change,
  hint,
  icon,
  loading,
  spark,
  accent = brand.wine,
  variant = 'soft',
}: KpiCardProps) {
  const up = (change ?? 0) >= 0;
  const solid = variant === 'solid';

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        color: solid ? brand.cream : 'inherit',
        bgcolor: solid ? accent : undefined,
        border: solid ? 'none' : undefined,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 40px rgba(28,25,23,0.08)',
        },
      }}
    >
      {!solid ? <BoxWash color={accent} /> : null}
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {loading ? (
          <Stack gap={1}>
            <Skeleton width={90} />
            <Skeleton width={140} height={36} />
            <Skeleton width={80} />
          </Stack>
        ) : (
          <Stack gap={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ color: solid ? 'rgba(247,241,234,0.72)' : 'text.secondary' }}>
                {label}
              </Typography>
              {icon ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: solid ? 'rgba(247,241,234,0.14)' : alpha(accent, 0.1),
                    color: solid ? brand.goldLight : accent,
                  }}
                >
                  {icon}
                </Stack>
              ) : null}
            </Stack>
            <Typography variant="h4" sx={{ fontSize: 30, color: solid ? brand.cream : 'inherit' }}>
              {value}
            </Typography>
            <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" gap={1} alignItems="center">
                {change !== undefined ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.25}
                    sx={{ color: solid ? brand.goldLight : up ? 'success.main' : 'error.main' }}
                  >
                    {up ? <TrendingUpRoundedIcon fontSize="small" /> : <TrendingDownRoundedIcon fontSize="small" />}
                    <Typography variant="caption" fontWeight={700}>
                      {percentChange(change)}
                    </Typography>
                  </Stack>
                ) : null}
                {hint ? (
                  <Typography variant="caption" sx={{ color: solid ? 'rgba(247,241,234,0.7)' : 'text.secondary' }}>
                    {hint}
                  </Typography>
                ) : null}
              </Stack>
              {spark?.length ? <MiniSpark values={spark} color={solid ? brand.goldLight : accent} /> : null}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function BoxWash({ color }: { color: string }) {
  return (
    <Stack
      sx={{
        position: 'absolute',
        right: -40,
        top: -48,
        width: 140,
        height: 140,
        borderRadius: '50%',
        bgcolor: alpha(color, 0.07),
        pointerEvents: 'none',
      }}
    />
  );
}

function MiniSpark({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 72;
  const h = 28;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / Math.max(max - min, 1)) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
