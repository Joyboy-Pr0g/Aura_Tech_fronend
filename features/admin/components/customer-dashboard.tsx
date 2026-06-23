import Link from 'next/link';
import { User } from '@/lib/types/entities';
import { Package, ShoppingCart, MapPin } from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
}

export function CustomerDashboard({ user }: CustomerDashboardProps) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-white/50 mt-1">{user.full_name || user.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/orders" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <Package size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">My Orders</h3>
          <p className="text-sm text-white/40 mt-1">Track your orders</p>
        </Link>

        <Link href="/dashboard/cart" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <ShoppingCart size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Cart</h3>
          <p className="text-sm text-white/40 mt-1">Review your items</p>
        </Link>

        <Link href="/dashboard/addresses" className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
          <MapPin size={28} className="text-primary-500 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Addresses</h3>
          <p className="text-sm text-white/40 mt-1">Manage delivery addresses</p>
        </Link>
      </div>
    </div>
  );
}
