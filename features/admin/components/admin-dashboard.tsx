import Link from 'next/link';
import { Banknote, ClipboardList, Package, Users } from 'lucide-react';

const STATS = [
  { label: 'Pending Payments', href: '/admin/payments', icon: <Banknote size={24} />, color: 'text-warning' },
  { label: 'All Orders', href: '/admin/orders', icon: <ClipboardList size={24} />, color: 'text-primary-500' },
  { label: 'Products', href: '/admin/products', icon: <Package size={24} />, color: 'text-secondary-500' },
  { label: 'Users', href: '/admin/users', icon: <Users size={24} />, color: 'text-success' },
];

export function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <p className="text-white/40 mt-1">AURA TECH Management Console</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Link key={s.href} href={s.href} className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
            <div className={`${s.color} mb-3`}>{s.icon}</div>
            <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="card-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Payment Approval Queue</h3>
          <Link href="/admin/payments" className="text-primary-500 hover:text-primary-400 text-sm">
            View all →
          </Link>
        </div>
        <p className="text-white/40 text-sm">Review pending payment receipts from customers and approve or reject them.</p>
        <Link href="/admin/payments" className="btn-primary inline-flex mt-4">
          Open Queue
        </Link>
      </div>
    </div>
  );
}
