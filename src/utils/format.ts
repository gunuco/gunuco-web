import { APP_CONFIG } from '@/config/app.config';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(APP_CONFIG.locale).format(value);
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, hh:mm a');
}

export function formatShortDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM, h:mm a');
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy');
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'hh:mm a');
}

export function fromNow(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function percentChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
