'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAddress } from '@/lib/types/entities';
import { toast } from '@/components/ui/Toaster';
import { addAddress, deleteAddress } from '@/features/cart/services/cart-client';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface AddressListProps {
  initialAddresses: CustomerAddress[];
}

export function AddressList({ initialAddresses }: AddressListProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    full_name: '',
    phone: '',
    city: '',
    governorate: '',
    district: 'Sana\'a' as string,
    street_address: '',
    postal_code: '1010' as string,
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
      toast(t('address.added'), 'success');
      setShowForm(false);
      setForm({ label: '', full_name: '', phone: '', city: '', governorate: '', district: 'Sana\'a', street_address: '', postal_code: '1010', is_default: false, type: 'both' });
      router.refresh();
    } catch {
      toast(t('address.addFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast(t('address.deleted'), 'info');
    router.refresh();
  };

  const fields = [
    { key: 'label', labelKey: 'address.label' as const, placeholderKey: 'address.labelPlaceholder' as const },
    { key: 'full_name', labelKey: 'address.fullName' as const, placeholderKey: 'auth.fullNamePlaceholder' as const },
    { key: 'phone', labelKey: 'address.phone' as const, placeholderKey: 'auth.phonePlaceholder' as const },
    { key: 'city', labelKey: 'address.city' as const, placeholderKey: null },
    { key: 'governorate', labelKey: 'address.governorate' as const, placeholderKey: null },
  ];

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('address.title')}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t('address.add')}
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-5">
          <h3 className="font-semibold text-white mb-4">{t('address.new')}</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            {fields.map(({ key, labelKey, placeholderKey }) => (
              <div key={key}>
                <label className="label-dark">{t(labelKey)}</label>
                <input
                  value={(form as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input-dark"
                  placeholder={placeholderKey ? t(placeholderKey) : undefined}
                  required
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="label-dark">{t('address.street')}</label>
              <input
                value={form.street_address}
                onChange={(e) => setForm((f) => ({ ...f, street_address: e.target.value }))}
                className="input-dark"
                placeholder={t('address.streetPlaceholder')}
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
              <label htmlFor="is_default" className="text-sm text-white/60">{t('address.setDefault')}</label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? t('address.saving') : t('address.save')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="card-dark p-12 text-center">
          <MapPin size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">{t('address.empty')}</p>
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
