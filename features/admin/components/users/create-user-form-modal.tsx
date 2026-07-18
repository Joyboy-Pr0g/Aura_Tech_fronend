'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { createAdminUserSchema, AdminUserFormValues } from '@/features/admin/schemas/admin-user-schema';
import { createAdminUser } from '@/features/admin/services/admin-users-client';

const ROLES: Role[] = ['admin', 'sub_admin', 'customer'];

interface CreateUserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserFormModal({ open, onOpenChange, onSuccess }: CreateUserFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const schema = useMemo(() => createAdminUserSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
    });
  }, [open, reset]);

  const onSubmit = async (values: AdminUserFormValues) => {
    setSubmitting(true);
    try {
      await createAdminUser({
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.phone.trim(),
        role: values.role,
      });
      toast(t('admin.userCreated'), 'success');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{t('admin.addUser')}</ModalTitle>
          <ModalDescription>{t('admin.addUserDesc')}</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-full-name">{t('admin.userName')}</Label>
              <Input id="user-full-name" {...register('full_name')} error={Boolean(errors.full_name)} />
              {errors.full_name && <p className="text-xs text-danger">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">{t('admin.userEmail')}</Label>
              <Input id="user-email" type="email" {...register('email')} error={Boolean(errors.email)} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">{t('admin.userPhone')}</Label>
              <Input
                id="user-phone"
                placeholder={t('auth.phonePlaceholder')}
                {...register('phone')}
                error={Boolean(errors.phone)}
              />
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">{t('auth.password')}</Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                error={Boolean(errors.password)}
              />
              <p className="text-xs text-white/40">{t('auth.passwordHint')}</p>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">{t('admin.userRole')}</Label>
              <select id="user-role" {...register('role')} className="input-dark w-full">
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`admin.role.${role}`)}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('admin.saving') : t('admin.create')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
