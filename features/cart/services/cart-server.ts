import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Cart, CustomerAddress, Payment, PaymentMethod } from '@/lib/types/entities';

export async function getCartServer() {
  const res = await serverFetch<Cart>('/cart');
  return res.data!;
}

export async function getAddressesServer() {
  const res = await serverFetch<CustomerAddress[]>('/addresses');
  return res.data!;
}

export async function getPaymentMethodsServer() {
  const res = await serverFetch<PaymentMethod[]>('/payments/methods');
  return res.data!;
}

export async function getPaymentForOrderServer(orderId: string): Promise<Payment | null> {
  try {
    const res = await serverFetch<Payment>(endpoints.payments.order(orderId));
    return res.data ?? null;
  } catch {
    return null;
  }
}
