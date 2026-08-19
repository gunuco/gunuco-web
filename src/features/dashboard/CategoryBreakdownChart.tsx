import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { brand } from '@/theme/colors';
import type { CategoryBreakdownPoint } from '@/types';
import { formatCurrency } from '@/utils/format';

const COLORS = [brand.wine, brand.gold, '#3B6B8C', '#2F6B4F', '#B45309'];

export function CategoryBreakdownChart({
  data,
  loading,
}: {
  data?: CategoryBreakdownPoint[];
  loading?: boolean;
}) {
  const rows = data ?? [];
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: 360 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Mix
        </Typography>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Category breakdown
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={260} />
        ) : (
          <Stack direction="row" alignItems="center" gap={1} sx={{ height: 270 }}>
            <Box sx={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rows}
                    dataKey="value"
                    nameKey="categoryName"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {rows.map((entry, i) => (
                      <Cell key={entry.categoryId} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack gap={1} sx={{ flex: 1 }}>
              {rows.map((row, i) => (
                <Stack key={row.categoryId} direction="row" justifyContent="space-between" gap={1}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="body2">{row.categoryName}</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(row.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
