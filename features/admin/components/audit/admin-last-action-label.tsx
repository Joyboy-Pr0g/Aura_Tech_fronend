'use client';

import { AdminLatestAction } from '@/lib/types/entities';
import { AdminAuditTrigger } from '@/features/admin/components/audit/admin-audit-trigger';

interface AdminLastActionLabelProps {
  action?: AdminLatestAction | null;
  className?: string;
}

export function AdminLastActionLabel({ action, className }: AdminLastActionLabelProps) {
  return <AdminAuditTrigger action={action} className={className} />;
}
