import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { brand } from '@/theme/colors';
import type { TrendPoint } from '@/types';
import { formatCurrency } from '@/utils/format';

export function OrdersTrendChart({ data, loading }: { data?: TrendPoint[]; loading?: boolean }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: 360 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Volume
            </Typography>
            <Typography variant="h6">Orders & revenue</Typography>
          </Box>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <LegendDot color={brand.wine} label="Orders" />
            <LegendDot color={brand.gold} label="Revenue" />
          </Stack>
        </Stack>
        {loading ? (
          <Skeleton variant="rounded" height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={data ?? []}>
              <defs>
                <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand.wine} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={brand.wine} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F675F' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6F675F' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #EDE8E1' }}
                formatter={(value, name) =>
                  name === 'revenue' ? formatCurrency(Number(value)) : Number(value)
                }
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke={brand.wine}
                strokeWidth={2.4}
                fill="url(#ordersFill)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={brand.gold}
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
