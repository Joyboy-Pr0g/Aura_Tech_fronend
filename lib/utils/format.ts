export function formatCurrency(amount: number | string): string {
  return `${Number(amount).toLocaleString('ar-YE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
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
