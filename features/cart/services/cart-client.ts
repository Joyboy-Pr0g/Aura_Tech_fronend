import { clientFetch } from '@/lib/api/client';
import { Cart, CustomerAddress, Payment, PaymentMethod } from '@/lib/types/entities';

export async function addToCart(data: {
  product_id: string;
  variant_id?: string;
  quantity: number;
}) {
  const res = await clientFetch<Cart>('/api/cart/items', {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function getCart() {
  const res = await clientFetch<Cart>('/api/cart');
  return res.data!;
}

export async function removeCartItem(itemId: string) {
  await clientFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearCart() {
  await clientFetch('/api/cart', { method: 'DELETE' });
}

export async function getAddresses() {
  const res = await clientFetch<CustomerAddress[]>('/api/addresses');
  return res.data!;
}

export async function addAddress(data: Omit<CustomerAddress, 'id'>) {
  const res = await clientFetch<CustomerAddress>('/api/addresses', {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function updateAddress(id: string, data: Omit<CustomerAddress, 'id'>) {
  await clientFetch(`/api/addresses/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteAddress(id: string) {
  await clientFetch(`/api/addresses/${id}`, { method: 'DELETE' });
}

export async function getPaymentMethods() {
  const res = await clientFetch<PaymentMethod[]>('/api/payments/methods');
  return res.data!;
}

export async function submitPayment(orderId: string, file: File, paymentMethodId: string) {
  const form = new FormData();
  form.append('receipt', file);
  form.append('payment_method_id', paymentMethodId);
  const res = await clientFetch<Payment>(`/api/payments/orders/${orderId}`, {
    method: 'POST',
    body: form,
  });
  return res.data!;
}

export async function getPendingPayments(limit = 20, cursor?: string) {
  const res = await clientFetch<Payment[]>('/api/payments/pending', {
    searchParams: { limit, cursor },
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function approvePayment(id: string) {
  await clientFetch(`/api/payments/${id}/approve`, { method: 'PATCH' });
}

export async function rejectPayment(id: string, reason: string) {
  await clientFetch(`/api/payments/${id}/reject`, {
    method: 'PATCH',
    body: { reason },
  });
}
