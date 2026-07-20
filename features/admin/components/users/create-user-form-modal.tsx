'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail } from 'lucide-react';
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
import { createSendEmailVerificationSchema } from '@/features/auth/schemas/auth-schemas';
import { sendRegistrationEmailVerification } from '@/features/auth/services/auth-service';
import { EmailVerificationModal } from '@/features/auth/components/email-verification-modal';
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
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const schema = useMemo(() => createAdminUserSchema(t), [t]);
  const emailFieldSchema = useMemo(() => createSendEmailVerificationSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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

  const watchedEmail = watch('email') ?? '';
  const normalizedEmail = watchedEmail.trim().toLowerCase();
  const emailIsValid = emailFieldSchema.shape.email.safeParse(watchedEmail).success;
  const emailIsVerified = verifiedEmail === normalizedEmail;

  useEffect(() => {
    if (!open) return;
    reset({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
    });
    setVerifiedEmail(null);
    setVerificationModalOpen(false);
  }, [open, reset]);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      await sendRegistrationEmailVerification({ email: normalizedEmail });
      setVerifiedEmail(null);
      setVerificationModalOpen(true);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSendingVerification(false);
    }
  };

  const onSubmit = async (values: AdminUserFormValues) => {
    const email = values.email.trim().toLowerCase();
    if (verifiedEmail !== email) {
      toast(t('auth.emailNotVerified'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createAdminUser({
        full_name: values.full_name.trim(),
        email,
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
    <>
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
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                    <Input
                      id="user-email"
                      type="email"
                      className="ps-10"
                      {...register('email', {
                        onChange: () => setVerifiedEmail(null),
                      })}
                      error={Boolean(errors.email)}
                    />
                  </div>
                  {emailIsValid && (
                    emailIsVerified ? (
                      <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-3 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium hidden sm:inline">
                          {t('settings.verified')}
                        </span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 whitespace-nowrap"
                        disabled={sendingVerification}
                        onClick={handleSendVerification}
                      >
                        {sendingVerification ? t('settings.sendingCode') : t('settings.verifyEmail')}
                      </Button>
                    )
                  )}
                </div>
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                {emailIsValid && !emailIsVerified && (
                  <p className="text-xs text-white/40">{t('auth.verifyEmailHint')}</p>
                )}
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
              <Button type="submit" disabled={submitting || !emailIsVerified}>
                {submitting ? t('admin.saving') : t('admin.create')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <EmailVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        email={normalizedEmail}
        variant="register"
        onVerified={(email) => setVerifiedEmail(email.toLowerCase())}
      />
    </>
  );
}
