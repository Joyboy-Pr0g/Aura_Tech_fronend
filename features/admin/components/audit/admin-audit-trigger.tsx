'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/en';
import { AdminLatestAction, User } from '@/lib/types/entities';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const ACTION_KEYS: Record<string, TranslationKey> = {
  create: 'admin.actionLog.create',
  update: 'admin.actionLog.update',
  delete: 'admin.actionLog.delete',
  soft_delete: 'admin.actionLog.softDelete',
  restore: 'admin.actionLog.restore',
  activate: 'admin.actionLog.activate',
  deactivate: 'admin.actionLog.deactivate',
  approve: 'admin.actionLog.approve',
  reject: 'admin.actionLog.reject',
  status_change: 'admin.actionLog.statusChange',
  unassign_parent: 'admin.actionLog.unassignParent',
};

interface AdminAuditTriggerProps {
  createdBy?: Pick<User, 'email' | 'full_name'> | null;
  updatedBy?: Pick<User, 'email' | 'full_name'> | null;
  action?: AdminLatestAction | null;
  className?: string;
}

function AuditRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <dt className="shrink-0 text-sm text-white/50 sm:w-36">{label}</dt>
      <dd className="text-sm text-white/90">{value}</dd>
    </div>
  );
}

export function AdminAuditTrigger({
  createdBy,
  updatedBy,
  action,
  className,
}: AdminAuditTriggerProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const creator = createdBy?.full_name || createdBy?.email;
  const editor = updatedBy?.full_name || updatedBy?.email;
  const hasCreator = Boolean(creator);
  const hasEditor = Boolean(editor && editor !== creator);
  const hasAction = Boolean(action);
  const hasAudit = hasCreator || hasEditor || hasAction;

  if (!hasAudit) {
    return <span className={cn('text-xs text-white/30', className)}>—</span>;
  }

  const actionLabel =
    action && ACTION_KEYS[action.action]
      ? t(ACTION_KEYS[action.action])
      : action?.action ?? '—';

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          'h-7 gap-1.5 border-white/10 bg-transparent px-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white',
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        {t('admin.audit')}
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>{t('admin.audit')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <dl className="space-y-4">
              {hasCreator && <AuditRow label={t('admin.createdBy')} value={creator!} />}
              {hasEditor && <AuditRow label={t('admin.updatedBy')} value={editor!} />}
              {hasAction && (
                <>
                  <AuditRow
                    label={t('admin.lastActionBy')}
                    value={action!.admin_name || action!.admin_email || t('admin.unknown')}
                  />
                  <AuditRow label={t('admin.lastAction')} value={actionLabel} />
                  <AuditRow
                    label={t('admin.lastActionAt')}
                    value={formatDateTime(action!.created_at)}
                  />
                </>
              )}
            </dl>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
