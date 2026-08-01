'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  add_stock: 'admin.addStock',
};

interface AdminAuditTriggerProps {
  createdBy?: Pick<User, 'email' | 'full_name'> | null;
  updatedBy?: Pick<User, 'email' | 'full_name'> | null;
  action?: AdminLatestAction | null;
  className?: string;
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getChangeEntries(changes: Record<string, unknown> | null | undefined) {
  if (!changes || typeof changes !== 'object') return [];
  return Object.entries(changes)
    .filter(([key]) => key.trim())
    .map(([key, value]) => ({ key: key.trim(), value: formatChangeValue(value) }));
}

function AuditRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <dt className="shrink-0 text-sm text-white/50 sm:w-36">{label}</dt>
      <dd className="text-sm text-white/90">{value}</dd>
    </div>
  );
}

function AuditChangesBadges({
  changes,
  label,
}: {
  changes: Record<string, unknown>;
  label: string;
}) {
  const entries = getChangeEntries(changes);
  if (!entries.length) return null;

  return (
    <div className="space-y-2 border-t mt-4 border-white/10 pt-4">
      <p className="text-sm text-white/50">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(({ key, value }) => (
          <Badge
            key={key}
            variant="secondary"
            title={`${key}: ${value}`}
            className="max-w-full rounded-lg px-2.5 py-1 font-normal"
          >
            <span className="text-white/45">{key}</span>
            <span className="mx-1 text-white/25">·</span>
            <span className="truncate text-white/85 max-w-[14rem]">{value}</span>
          </Badge>
        ))}
      </div>
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
  const changeEntries = getChangeEntries(action?.changes_json);

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
        {changeEntries.length > 0 && (
          <Badge variant="default" className="h-4 min-w-4 px-1 text-[10px] leading-none">
            {changeEntries.length}
          </Badge>
        )}
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
            {action?.changes_json && Object.keys(action.changes_json).length > 0 && (
              <AuditChangesBadges changes={action.changes_json} label={t('admin.actionChanges')} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
