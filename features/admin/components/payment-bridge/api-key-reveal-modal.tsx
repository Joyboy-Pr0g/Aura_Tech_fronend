'use client';

import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { toast } from '@/components/ui/Toaster';

interface ApiKeyRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
}

export function ApiKeyRevealModal({ open, onOpenChange, apiKey }: ApiKeyRevealModalProps) {
  const { t } = useLocale();

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    toast(t('API Key copied successfully'), 'success');
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{t('admin.paymentBridgeApiKeyTitle')}</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm text-white/60">{t('admin.paymentBridgeApiKeyWarning')}</p>
          <pre className="rounded-xl border border-white/10 bg-dark-950 p-4 text-xs text-primary-300 break-all whitespace-pre-wrap font-mono">
            {apiKey}
          </pre>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={copyKey}>
            {t('admin.paymentBridgeCopyApiKey')}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
