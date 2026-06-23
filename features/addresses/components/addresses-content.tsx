import { getAddressesServer } from '@/features/cart/services/cart-server';
import { AddressList } from '@/features/addresses/components/address-list';

export async function AddressesContent() {
  const addresses = await getAddressesServer();
  return <AddressList initialAddresses={addresses ?? []} />;
}
