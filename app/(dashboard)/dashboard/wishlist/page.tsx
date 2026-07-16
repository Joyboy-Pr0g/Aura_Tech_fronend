import { WishlistView } from '@/features/engagement/components/wishlist-view';
import { getWishlistServer } from '@/features/engagement/services/engagement-server';

export default async function WishlistPage() {
  const wishlist = await getWishlistServer();

  return <WishlistView initialWishlist={wishlist} />;
}
