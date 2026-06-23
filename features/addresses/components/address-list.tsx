'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAddress } from '@/lib/types/entities';
import { toast } from '@/components/ui/Toaster';
import { addAddress, deleteAddress } from '@/features/cart/services/cart-client';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';

interface AddressListProps {
  initialAddresses: CustomerAddress[];
}

export function AddressList({ initialAddresses }: AddressListProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    full_name: '',
    phone: '',
    city: '',
    governorate: '',
    district: null as string | null,
    street_address: '',
    postal_code: null as string | null,
    is_default: false,
    type: 'both' as const,
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newAddr = await addAddress(form);
      setAddresses((prev) => [...prev, newAddr!]);
      toast('Address added', 'success');
      setShowForm(false);
      setForm({ label: '', full_name: '', phone: '', city: '', governorate: '', district: null, street_address: '', postal_code: null, is_default: false, type: 'both' });
      router.refresh();
    } catch {
      toast('Failed to add address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast('Address deleted', 'info');
    router.refresh();
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Delivery Addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-5">
          <h3 className="font-semibold text-white mb-4">New Address</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            {[
              { key: 'label', label: 'Label', placeholder: 'Home, Office...' },
              { key: 'full_name', label: 'Full Name', placeholder: 'Your name' },
              { key: 'phone', label: 'Phone', placeholder: '+967 7XX...' },
              { key: 'city', label: 'City', placeholder: "Sana'a" },
              { key: 'governorate', label: 'Governorate', placeholder: "Sana'a" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label-dark">{label}</label>
                <input
                  value={(form as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input-dark"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="label-dark">Street Address</label>
              <input
                value={form.street_address}
                onChange={(e) => setForm((f) => ({ ...f, street_address: e.target.value }))}
                className="input-dark"
                placeholder="Building, street..."
                required
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="is_default" className="text-sm text-white/60">Set as default address</label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Address'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="card-dark p-12 text-center">
          <MapPin size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No addresses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="card-dark p-5 flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{addr.label}</p>
                  {addr.is_default && <Star size={14} className="text-warning fill-warning" />}
                </div>
                <p className="text-sm text-white/60">{addr.full_name} · {addr.phone}</p>
                <p className="text-sm text-white/40">{addr.street_address}, {addr.city}, {addr.governorate}</p>
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-danger/40 hover:text-danger transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
