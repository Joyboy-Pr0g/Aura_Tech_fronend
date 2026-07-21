'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Plus, Smartphone, Trash2, Wallet } from 'lucide-react';
import { PaymentDevice, PaymentProvider } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import {
  deleteAdminPaymentDevice,
  deleteAdminPaymentProvider,
  getAdminPaymentDevices,
  getAdminPaymentProviders,
} from '@/features/admin/services/admin-payment-bridge-client';
import { DeviceFormModal, type DeviceFormMode } from '@/features/admin/components/payment-bridge/device-form-modal';
import { ProviderFormModal, type ProviderFormMode } from '@/features/admin/components/payment-bridge/provider-form-modal';
import { ApiKeyRevealModal } from '@/features/admin/components/payment-bridge/api-key-reveal-modal';

type BridgeTab = 'devices' | 'providers';

interface AdminPaymentBridgePanelProps {
  initialDevices: PaymentDevice[];
  initialProviders: PaymentProvider[];
  initialTab?: BridgeTab;
}

export function AdminPaymentBridgePanel({
  initialDevices,
  initialProviders,
  initialTab = 'devices',
}: AdminPaymentBridgePanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BridgeTab>(initialTab);
  const [devices, setDevices] = useState(initialDevices);
  const [providers, setProviders] = useState(initialProviders);
  const [isPending, startTransition] = useTransition();
  const [deviceFormMode, setDeviceFormMode] = useState<DeviceFormMode | null>(null);
  const [providerFormMode, setProviderFormMode] = useState<ProviderFormMode | null>(null);
  const [isDeviceFormOpen, setIsDeviceFormOpen] = useState(false);
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);
  const [deleteDevice, setDeleteDevice] = useState<PaymentDevice | null>(null);
  const [deleteProvider, setDeleteProvider] = useState<PaymentProvider | null>(null);
  const [isDeleteDeviceOpen, setIsDeleteDeviceOpen] = useState(false);
  const [isDeleteProviderOpen, setIsDeleteProviderOpen] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

  useEffect(() => {
    setDevices(initialDevices);
    setProviders(initialProviders);
  }, [initialDevices, initialProviders]);

  const refresh = () => {
    startTransition(async () => {
      try {
        const [nextDevices, nextProviders] = await Promise.all([
          getAdminPaymentDevices(),
          getAdminPaymentProviders(),
        ]);
        setDevices(nextDevices);
        setProviders(nextProviders);
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleDeleteDevice = async () => {
    if (!deleteDevice) return;
    startTransition(async () => {
      try {
        await deleteAdminPaymentDevice(deleteDevice.id);
        toast(t('admin.paymentBridgeDeviceDeleted'), 'success');
        setIsDeleteDeviceOpen(false);
        setDeleteDevice(null);
        refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleDeleteProvider = async () => {
    if (!deleteProvider) return;
    startTransition(async () => {
      try {
        await deleteAdminPaymentProvider(deleteProvider.id);
        toast(t('admin.paymentBridgeProviderDeleted'), 'success');
        setIsDeleteProviderOpen(false);
        setDeleteProvider(null);
        refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const openRegisterDevice = () => {
    setDeviceFormMode({ type: 'register' });
    setIsDeviceFormOpen(true);
  };

  const openAddProvider = () => {
    setProviderFormMode({ type: 'create' });
    setIsProviderFormOpen(true);
  };

  const renderDeviceActions = (device: PaymentDevice) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5">
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuItem onClick={() => { setDeviceFormMode({ type: 'edit', device }); setIsDeviceFormOpen(true); }}>
          <Pencil size={14} className="me-2" />
          {t('admin.paymentBridgeEditDevice')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-danger focus:text-danger"
          onClick={() => { setDeleteDevice(device); setIsDeleteDeviceOpen(true); }}
        >
          <Trash2 size={14} className="me-2" />
          {t('admin.paymentBridgeDeleteDevice')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderProviderActions = (provider: PaymentProvider) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5">
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuItem onClick={() => { setProviderFormMode({ type: 'edit', provider }); setIsProviderFormOpen(true); }}>
          <Pencil size={14} className="me-2" />
          {t('admin.paymentBridgeEditProvider')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-danger focus:text-danger"
          onClick={() => { setDeleteProvider(provider); setIsDeleteProviderOpen(true); }}
        >
          <Trash2 size={14} className="me-2" />
          {t('admin.paymentBridgeDeleteProvider')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const countLabel = activeTab === 'devices'
    ? t('admin.paymentBridgeDevicesCount', { count: devices.length })
    : t('admin.paymentBridgeProvidersCount', { count: providers.length });

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.paymentBridgeTitle', icon: Smartphone, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.paymentBridgeTitle')}
        countLabel={countLabel}
        filters={
          <Button onClick={activeTab === 'devices' ? openRegisterDevice : openAddProvider}>
            <Plus size={16} />
            {activeTab === 'devices'
              ? t('admin.paymentBridgeRegisterDevice')
              : t('admin.paymentBridgeAddProvider')}
          </Button>
        }
      />

      <div className="flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-2',
            activeTab === 'devices' ? 'border-primary-400 text-white' : 'border-transparent text-white/50',
          )}
        >
          <Smartphone size={14} />
          {t('admin.paymentBridgeDevicesTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-2',
            activeTab === 'providers' ? 'border-primary-400 text-white' : 'border-transparent text-white/50',
          )}
        >
          <Wallet size={14} />
          {t('admin.paymentBridgeProvidersTab')}
        </button>
      </div>

      {activeTab === 'devices' ? (
        devices.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <p className="text-white/50">{t('admin.paymentBridgeNoDevices')}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block card-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="admin-table-head">
                      <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeDeviceUuid')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeDeviceLabel')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeDeviceStatus')}</th>
                      <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeLastSeen')}</th>
                      <th className="admin-table-actions-head">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-5 py-4 font-mono text-xs text-primary-300">{device.device_uuid}</td>
                        <td className="px-5 py-4 text-white/80">{device.label ?? '—'}</td>
                        <td className="px-5 py-4">
                          <Badge variant={device.enabled ? 'success' : 'secondary'}>
                            {device.enabled ? t('admin.active') : t('admin.inactive')}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-white/50">
                          {device.last_seen ? formatDateTime(device.last_seen) : '—'}
                        </td>
                        <td className="admin-table-actions-cell">{renderDeviceActions(device)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="lg:hidden space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="card-dark p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{device.label ?? t('admin.paymentBridgeUnlabeledDevice')}</p>
                      <p className="text-xs font-mono text-primary-300 break-all mt-1">{device.device_uuid}</p>
                    </div>
                    <Badge variant={device.enabled ? 'success' : 'secondary'}>
                      {device.enabled ? t('admin.active') : t('admin.inactive')}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/50">
                    {t('admin.paymentBridgeLastSeen')}: {device.last_seen ? formatDateTime(device.last_seen) : '—'}
                  </p>
                  <div className="flex justify-end">{renderDeviceActions(device)}</div>
                </div>
              ))}
            </div>
          </>
        )
      ) : providers.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.paymentBridgeNoProviders')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeProviderName')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeProviderAliases')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.paymentBridgeDeviceStatus')}</th>
                    <th className="admin-table-actions-head">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-white">{provider.name}</td>
                      <td className="px-5 py-4 text-white/70">
                        {provider.aliases.length > 0 ? provider.aliases.join(', ') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={provider.is_active ? 'success' : 'secondary'}>
                          {provider.is_active ? t('admin.active') : t('admin.inactive')}
                        </Badge>
                      </td>
                      <td className="admin-table-actions-cell">{renderProviderActions(provider)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="lg:hidden space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="card-dark p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white">{provider.name}</p>
                  <Badge variant={provider.is_active ? 'success' : 'secondary'}>
                    {provider.is_active ? t('admin.active') : t('admin.inactive')}
                  </Badge>
                </div>
                {provider.aliases.length > 0 && (
                  <p className="text-sm text-white/60">{provider.aliases.join(', ')}</p>
                )}
                <div className="flex justify-end">{renderProviderActions(provider)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <DeviceFormModal
        open={isDeviceFormOpen}
        onOpenChange={setIsDeviceFormOpen}
        mode={deviceFormMode}
        onSuccess={() => toast(t('admin.paymentBridgeDeviceSaved'), 'success')}
        onRegistered={(apiKey) => {
          toast(t('admin.paymentBridgeDeviceRegistered'), 'success');
          setRevealedApiKey(apiKey);
          refresh();
        }}
      />

      <ProviderFormModal
        open={isProviderFormOpen}
        onOpenChange={setIsProviderFormOpen}
        mode={providerFormMode}
        onSuccess={() => {
          toast(
            providerFormMode?.type === 'edit'
              ? t('admin.paymentBridgeProviderUpdated')
              : t('admin.paymentBridgeProviderCreated'),
            'success',
          );
          refresh();
        }}
      />

      <ApiKeyRevealModal
        open={Boolean(revealedApiKey)}
        onOpenChange={(open) => !open && setRevealedApiKey(null)}
        apiKey={revealedApiKey ?? ''}
      />

      {deleteDevice && (
        <ConfirmModal
          name={deleteDevice.label ?? deleteDevice.device_uuid}
          onConfirm={handleDeleteDevice}
          onCancel={() => { setIsDeleteDeviceOpen(false); setDeleteDevice(null); }}
          isOpen={isDeleteDeviceOpen}
          setIsOpen={setIsDeleteDeviceOpen}
          loading={isPending}
          confirmText={t('admin.paymentBridgeDeleteDevice')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}

      {deleteProvider && (
        <ConfirmModal
          name={deleteProvider.name}
          onConfirm={handleDeleteProvider}
          onCancel={() => { setIsDeleteProviderOpen(false); setDeleteProvider(null); }}
          isOpen={isDeleteProviderOpen}
          setIsOpen={setIsDeleteProviderOpen}
          loading={isPending}
          confirmText={t('admin.paymentBridgeDeleteProvider')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
