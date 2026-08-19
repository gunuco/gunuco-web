import { APP_CONFIG } from '@/config/app.config';

const SEQUENCE_LENGTH = 4;

/** DDMMYY in the production-house timezone. 10 Dec 2026 → 101226 */
export function orderDatePrefix(date: Date | string = new Date()): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: APP_CONFIG.timezone,
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
      .formatToParts(value)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.day}${parts.month}${parts.year}`;
}

export function formatOrderNumber(date: Date | string, sequence: number): string {
  return `${orderDatePrefix(date)}${String(sequence).padStart(SEQUENCE_LENGTH, '0')}`;
}

/** Daily 4-digit run that resets at midnight IST. */
export function nextOrderNumber(existingNumbers: string[], now = new Date()): string {
  const prefix = orderDatePrefix(now);
  let max = 0;
  for (const number of existingNumbers) {
    if (!number.startsWith(prefix) || number.length !== prefix.length + SEQUENCE_LENGTH) continue;
    const sequence = Number(number.slice(prefix.length));
    if (Number.isFinite(sequence) && sequence > max) max = sequence;
  }
  return formatOrderNumber(now, max + 1);
}

export function assignDailyOrderNumbers<T extends { createdAt: string; orderNumber: string }>(rows: T[]): T[] {
  const counters = new Map<string, number>();
  const sorted = rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => a.row.createdAt.localeCompare(b.row.createdAt) || a.index - b.index);

  const numbers = new Map<number, string>();
  for (const { row, index } of sorted) {
    const prefix = orderDatePrefix(row.createdAt);
    const sequence = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, sequence);
    numbers.set(index, formatOrderNumber(row.createdAt, sequence));
  }

  return rows.map((row, index) => ({ ...row, orderNumber: numbers.get(index)! }));
}

export function sortOrdersLatestFirst<T extends { createdAt: string; orderNumber?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const byTime = b.createdAt.localeCompare(a.createdAt);
    if (byTime !== 0) return byTime;
    return (b.orderNumber ?? '').localeCompare(a.orderNumber ?? '');
  });
}
