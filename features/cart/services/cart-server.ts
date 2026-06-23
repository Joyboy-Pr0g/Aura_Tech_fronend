import { serverFetch } from '@/lib/api/server';
import { Cart, CustomerAddress, PaymentMethod } from '@/lib/types/entities';

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
