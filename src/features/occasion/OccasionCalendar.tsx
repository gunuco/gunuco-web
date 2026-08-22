import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { brand } from '@/theme/colors';

interface OccasionCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  counts: Map<string, number>;
  selected: Date | null;
  onSelect: (day: Date | null) => void;
  horizonStart: Date;
  horizonEnd: Date;
}

function dayKey(day: Date) {
  return format(day, 'yyyy-MM-dd');
}

function monthDays(month: Date) {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  return { monthStart, days: eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) }) };
}

export function OccasionCalendar({
  month,
  onMonthChange,
  counts,
  selected,
  onSelect,
  horizonStart,
  horizonEnd,
}: OccasionCalendarProps) {
  const first = startOfMonth(month);
  const second = addMonths(first, 1);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography fontWeight={800}>
          {format(first, 'MMMM yyyy')} – {format(second, 'MMMM yyyy')}
        </Typography>
        <Stack direction="row" gap={0.5}>
          <IconButton size="small" onClick={() => onMonthChange(addMonths(first, -1))} aria-label="Previous month">
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onMonthChange(addMonths(first, 1))} aria-label="Next month">
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <MonthGrid
          month={first}
          counts={counts}
          selected={selected}
          onSelect={onSelect}
          onMonthChange={onMonthChange}
          horizonStart={horizonStart}
          horizonEnd={horizonEnd}
        />
        <MonthGrid
          month={second}
          counts={counts}
          selected={selected}
          onSelect={onSelect}
          onMonthChange={onMonthChange}
          horizonStart={horizonStart}
          horizonEnd={horizonEnd}
        />
      </Box>
      {selected ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
          Showing {format(selected, 'dd MMM yyyy')}. Click the day again to clear.
        </Typography>
      ) : null}
    </Paper>
  );
}

function MonthGrid({
  month,
  counts,
  selected,
  onSelect,
  onMonthChange,
  horizonStart,
  horizonEnd,
}: {
  month: Date;
  counts: Map<string, number>;
  selected: Date | null;
  onSelect: (day: Date | null) => void;
  onMonthChange: (month: Date) => void;
  horizonStart: Date;
  horizonEnd: Date;
}) {
  const { monthStart, days } = monthDays(month);
  const start = startOfDay(horizonStart);
  const end = startOfDay(horizonEnd);

  return (
    <Box>
      <Typography fontWeight={800} sx={{ mb: 1.25 }}>
        {format(month, 'MMMM yyyy')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <Typography
            key={label}
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            sx={{ textAlign: 'center', pb: 0.5 }}
          >
            {label}
          </Typography>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const key = dayKey(day);
          const count = counts.get(key) ?? 0;
          const active = selected ? isSameDay(day, selected) : false;
          const dayStart = startOfDay(day);
          const elevated =
            inMonth && !isBefore(dayStart, start) && !isAfter(dayStart, end);
          return (
            <Box
              key={`${monthStart.toISOString()}-${key}`}
              onClick={() => {
                if (!inMonth) {
                  onMonthChange(startOfMonth(day));
                }
                onSelect(active ? null : day);
              }}
              sx={{
                minHeight: 64,
                p: 0.75,
                borderRadius: 1,
                cursor: 'pointer',
                opacity: inMonth ? 1 : 0.35,
                transform: elevated ? 'translateY(-2px)' : 'none',
                bgcolor: active
                  ? alpha(brand.wine, 0.14)
                  : elevated
                    ? alpha(brand.gold, count ? 0.28 : 0.18)
                    : count
                      ? alpha(brand.gold, 0.12)
                      : 'transparent',
                border: `1px solid ${
                  active ? brand.wine : elevated ? brand.gold : count ? alpha(brand.gold, 0.4) : brand.line
                }`,
                boxShadow: elevated ? `0 4px 10px ${alpha(brand.wine, 0.12)}` : 'none',
                '&:hover': { bgcolor: alpha(brand.wine, 0.08) },
              }}
            >
              <Typography
                fontSize={13}
                fontWeight={isToday(day) || active || elevated ? 800 : 600}
                sx={{ color: isToday(day) || active ? brand.wine : elevated ? brand.wine : 'inherit' }}
              >
                {format(day, 'd')}
              </Typography>
              {count ? (
                <Typography fontSize={11} fontWeight={800} sx={{ color: brand.wine, mt: 0.25 }}>
                  {count} {count === 1 ? 'order' : 'orders'}
                </Typography>
              ) : (
                <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.25 }}>
                  {elevated ? '—' : ''}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
