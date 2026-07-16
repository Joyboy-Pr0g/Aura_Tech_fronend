'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAddress } from '@/lib/types/entities';
import { toast } from '@/components/ui/Toaster';
import { addAddress, deleteAddress, updateAddress } from '@/features/cart/services/cart-client';
import { MapPin, Pencil, Plus, Trash2, Star } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface AddressListProps {
  initialAddresses: CustomerAddress[];
}

type AddressFormState = Omit<CustomerAddress, 'id'>;

const emptyAddressForm = (): AddressFormState => ({
  label: '',
  full_name: '',
  phone: '',
  city: '',
  governorate: '',
  district: "Sana'a",
  street_address: '',
  postal_code: '1010',
  is_default: false,
  type: 'both',
});

const addressToForm = (address: CustomerAddress): AddressFormState => ({
  label: address.label,
  full_name: address.full_name,
  phone: address.phone,
  city: address.city,
  governorate: address.governorate,
  district: address.district ?? "Sana'a",
  street_address: address.street_address,
  postal_code: address.postal_code ?? '1010',
  is_default: address.is_default,
  type: address.type,
});

export function AddressList({ initialAddresses }: AddressListProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyAddressForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyAddressForm());
    setShowForm(true);
  };

  const openEditForm = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm(addressToForm(address));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddressForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        setAddresses((prev) =>
          prev.map((address) =>
            address.id === editingId
              ? { ...address, ...form, id: editingId }
              : form.is_default
                ? { ...address, is_default: false }
                : address,
          ),
        );
        toast(t('address.updated'), 'success');
      } else {
        const newAddress = await addAddress(form);
        setAddresses((prev) => {
          const next = form.is_default
            ? prev.map((address) => ({ ...address, is_default: false }))
            : prev;
          return [...next, newAddress];
        });
        toast(t('address.added'), 'success');
      }
      closeForm();
      router.refresh();
    } catch {
      toast(editingId ? t('address.updateFailed') : t('address.addFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((address) => address.id !== id));
    if (editingId === id) closeForm();
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('address.title')}</h2>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t('address.add')}
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-5">
          <h3 className="font-semibold text-white mb-4">
            {editingId ? t('address.edit') : t('address.new')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {fields.map(({ key, labelKey, placeholderKey }) => (
              <div key={key}>
                <label className="label-dark">{t(labelKey)}</label>
                <input
                  value={form[key as keyof AddressFormState] as string}
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
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
                onChange={(e) => setForm((current) => ({ ...current, street_address: e.target.value }))}
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
                onChange={(e) => setForm((current) => ({ ...current, is_default: e.target.checked }))}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="is_default" className="text-sm text-white/60">{t('address.setDefault')}</label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? t('address.saving') : editingId ? t('address.saveChanges') : t('address.save')}
              </button>
              <button type="button" onClick={closeForm} className="btn-outline">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="card-dark p-5 flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{address.label}</p>
                  {address.is_default && <Star size={14} className="text-warning fill-warning shrink-0" />}
                </div>
                <p className="text-sm text-white/60">{address.full_name} · {address.phone}</p>
                <p className="text-sm text-white/40">
                  {address.street_address}, {address.city}, {address.governorate}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(address)}
                  className="text-white/40 hover:text-primary-400 transition-colors"
                  aria-label={t('address.edit')}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-danger/40 hover:text-danger transition-colors"
                  aria-label={t('address.remove')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
