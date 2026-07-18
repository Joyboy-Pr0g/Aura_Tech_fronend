'use client';

import { User } from '@/lib/types/entities';
import { AdminAuditTrigger } from '@/features/admin/components/audit/admin-audit-trigger';

interface AdminAuditLabelProps {
  createdBy?: Pick<User, 'email' | 'full_name'> | null;
  updatedBy?: Pick<User, 'email' | 'full_name'> | null;
  className?: string;
}

export function AdminAuditLabel({ createdBy, updatedBy, className }: AdminAuditLabelProps) {
  return (
    <AdminAuditTrigger
      createdBy={createdBy}
      updatedBy={updatedBy}
      className={className}
    />
  );
}
