export type DisplayCurrency = 'SAR' | 'YER';

export function convertSarToYer(amountSar: number | string, rate: number): number {
  const base = Number(amountSar);
  if (!Number.isFinite(base) || !Number.isFinite(rate) || rate <= 0) return base;
  return Math.round(base * rate * 100) / 100;
}

export function formatSar(amount: number | string): string {
  return `${Number(amount).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
}

export function formatYer(amount: number | string): string {
  return `${Number(amount).toLocaleString('ar-YE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ر.ي`;
}

export function formatDisplayPrice(
  amountSar: number | string,
  currency: DisplayCurrency,
  sarToYer?: number | string | null,
): string {
  const rate = sarToYer != null ? Number(sarToYer) : null;
  if (currency === 'YER' && rate != null && rate > 0) {
    return formatYer(convertSarToYer(amountSar, rate));
  }
  return formatSar(amountSar);
}

export function formatCurrency(amount: number | string): string {
  return formatSar(amount);
}

const AR_DATE_LOCALE = 'ar-SA';

const AR_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  calendar: 'gregory',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(AR_DATE_LOCALE, AR_DATE_OPTIONS);
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(AR_DATE_LOCALE, {
    ...AR_DATE_OPTIONS,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  payment_confirmed: 'Payment Confirmed',
  processing: 'Processing',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-warning',
  payment_confirmed: 'text-primary-500',
  processing: 'text-secondary-500',
  ready_to_ship: 'text-primary-400',
  shipped: 'text-primary-500',
  delivered: 'text-success',
  cancelled: 'text-danger',
  refunded: 'text-accent-400',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  approved: 'text-success bg-success/10',
  rejected: 'text-danger bg-danger/10',
  manual_approved: 'text-success bg-success/10',
  refunded: 'text-primary-500 bg-primary-500/10',
};
