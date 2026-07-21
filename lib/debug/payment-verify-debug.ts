export function isPaymentVerifyDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENT_VERIFY_DEBUG === 'true';
}

export function paymentVerifyDebug(label: string, data?: unknown): void {
  if (!isPaymentVerifyDebugEnabled()) return;
  if (data !== undefined) {
    console.log(`[payment-verify] ${label}`, data);
    return;
  }
  console.log(`[payment-verify] ${label}`);
}
