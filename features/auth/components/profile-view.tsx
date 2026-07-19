'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/lib/types/entities';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  createUpdateProfileSchema,
  createChangePasswordSchema,
  UpdateProfileInput,
  ChangePasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import { updateProfile, changePassword, sendEmailVerification } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { PasswordStrengthHint } from '@/features/auth/components/password-strength-hint';
import { EmailVerificationModal } from '@/features/auth/components/email-verification-modal';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { toast } from '@/components/ui/Toaster';
import { KeyRound, Mail, Phone, Shield, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProfileViewProps {
  user: User;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatUserStatus(status: User['status'], t: (key: string) => string): string {
  const key = `admin.userStatus.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

function formatUserRole(role: User['role'], t: (key: string) => string): string {
  const key = `admin.role.${role}`;
  const translated = t(key);
  return translated === key ? role.replace('_', ' ') : translated;
}

export function ProfileView({ user: initialUser }: ProfileViewProps) {
  const router = useRouter();
  const { t, dir } = useLocale();
  const [user, setUser] = useState(initialUser);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const inputTextClass = dir === 'rtl' ? 'text-end' : 'text-start';
  const updateProfileSchema = useMemo(() => createUpdateProfileSchema(t), [t]);
  const changePasswordSchema = useMemo(() => createChangePasswordSchema(t), [t]);

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: initialUser.full_name,
      email: initialUser.email,
      phone: initialUser.phone ?? '',
    },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const watchedNewPassword = passwordForm.watch('new_password');
  const watchedConfirmPassword = passwordForm.watch('confirm_password');
  const watchedEmail = profileForm.watch('email');

  const emailChanged =
    watchedEmail.trim().toLowerCase() !== user.email.toLowerCase();
  const emailIsValid = updateProfileSchema.shape.email.safeParse(watchedEmail).success;
  const emailIsVerified = verifiedEmail === watchedEmail.trim().toLowerCase();

  const handleSendVerification = async () => {
    setProfileError('');
    setSendingVerification(true);
    try {
      await sendEmailVerification({ email: watchedEmail.trim() });
      setVerifiedEmail(null);
      setVerificationModalOpen(true);
      toast(t('settings.verificationSent'), 'success');
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSendingVerification(false);
    }
  };

  const onProfileSubmit = async (values: UpdateProfileInput) => {
    setProfileError('');

    const emailChangedOnSubmit =
      values.email.trim().toLowerCase() !== user.email.toLowerCase();
    if (emailChangedOnSubmit && verifiedEmail !== values.email.trim().toLowerCase()) {
      setProfileError(t('settings.emailNotVerified'));
      return;
    }

    try {
      const updated = await updateProfile(values);
      setUser(updated);
      setVerifiedEmail(null);
      profileForm.reset(values);
      toast(t('settings.profileUpdated'), 'success');
      router.refresh();
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordInput) => {
    setPasswordError('');
    try {
      await changePassword(values);
      passwordForm.reset();
      toast(t('settings.passwordUpdated'), 'success');
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  };

  const statusVariant = user.status === 'active' ? 'success' : 'danger';
  const tabTriggerClass =
    'px-4 py-2.5 text-sm font-medium text-white/50 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 -mb-px transition-colors';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
        <p className="mt-1 text-sm text-white/50">{t('settings.subtitle')}</p>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="relative px-6 pt-6 pb-5 border-b border-white/10 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 border border-primary-500/30 text-xl font-bold text-primary-300">
              {getInitials(user.full_name) || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-white truncate">{user.full_name}</h3>
              <p className="text-sm rtl:text-right text-white/60 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-sm rtl:text-right text-white/50 truncate">{user.phone}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Badge variant="secondary" className="capitalize">
                {formatUserRole(user.role, t)}
              </Badge>
              <Badge variant={statusVariant} className="capitalize">
                {formatUserStatus(user.status, t)}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs.Root defaultValue="profile" className="p-6">
          <Tabs.List className="flex rtl:flex-row-reverse gap-1 border-b border-white/10 mb-6">
            <Tabs.Trigger value="profile" className={tabTriggerClass}>
              <span className="inline-flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {t('settings.tabProfile')}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="password" className={tabTriggerClass}>
              <span className="inline-flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                {t('settings.tabPassword')}
              </span>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex rtl:flex-row-reverse items-center gap-2 text-white/40 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">{t('settings.role')}</span>
                </div>
                <p className="text-white capitalize rtl:text-right">{formatUserRole(user.role, t)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex rtl:flex-row-reverse items-center gap-2 text-white/40 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">{t('settings.status')}</span>
                </div>
                <p className={cn('capitalize rtl:text-right', user.status === 'active' ? 'text-success' : 'text-danger')}>
                  {formatUserStatus(user.status, t)}
                </p>
              </div>
            </div>

            {profileError && (
              <Alert variant="error">{profileError}</Alert>
            )}

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 rtl:text-right">
                  <Label htmlFor="full_name">{t('settings.fullName')}</Label>
                  <Input
                    id="full_name"
                    dir={dir}
                    className={cn(inputTextClass, 'rtl:text-right')}
                    error={!!profileForm.formState.errors.full_name}
                    {...profileForm.register('full_name')}
                  />
                  {profileForm.formState.errors.full_name && (
                    <p className="text-xs text-danger">
                      {profileForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 rtl:text-right">
                  <Label htmlFor="phone">{t('settings.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                    <Input
                      id="phone"
                      type="tel"
                      dir={dir}
                      className={cn('ps-10', inputTextClass, 'rtl:text-right')}
                      placeholder={t('settings.phonePlaceholder')}
                      error={!!profileForm.formState.errors.phone}
                      {...profileForm.register('phone')}
                    />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <p className="text-xs text-danger">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 rtl:text-right">
                <Label htmlFor="email">{t('settings.email')}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      dir={dir}
                      className={cn('ps-10', inputTextClass)}
                      error={!!profileForm.formState.errors.email}
                      {...profileForm.register('email', {
                        onChange: () => setVerifiedEmail(null),
                      })}
                    />
                  </div>
                  {emailChanged && emailIsValid && (
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
                        {sendingVerification
                          ? t('settings.sendingCode')
                          : t('settings.verifyEmail')}
                      </Button>
                    )
                  )}
                </div>
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-danger">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
                {emailChanged && emailIsValid && !emailIsVerified && (
                  <p className="text-xs text-white/40">{t('settings.verifyEmailHint')}</p>
                )}
              </div>

              <div className="rtl:text-right">
                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty || (emailChanged && !emailIsVerified)}
                >
                  {profileForm.formState.isSubmitting
                    ? t('settings.saving')
                    : t('settings.saveProfile')}
                </Button>
              </div>
            </form>
          </Tabs.Content>

          <Tabs.Content value="password" className="space-y-4">
            <p className="text-sm text-white/50">{t('settings.passwordSubtitle')}</p>

            {passwordError && (
              <Alert variant="error">{passwordError}</Alert>
            )}

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <div className="space-y-2 rtl:text-right">
                <Label htmlFor="current_password">{t('settings.currentPassword')}</Label>
                <Input
                  id="current_password"
                  type="password"
                  dir={dir}
                  className={inputTextClass}
                  autoComplete="current-password"
                  error={!!passwordForm.formState.errors.current_password}
                  {...passwordForm.register('current_password')}
                />
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-danger">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 rtl:text-right">
                <Label htmlFor="new_password">{t('settings.newPassword')}</Label>
                <Input
                  id="new_password"
                  type="password"
                  dir={dir}
                  className={inputTextClass}
                  autoComplete="new-password"
                  error={!!passwordForm.formState.errors.new_password}
                  {...passwordForm.register('new_password', {
                    onBlur: () => setNewPasswordFocused(false),
                  })}
                  onFocus={() => setNewPasswordFocused(true)}
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-danger">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
                <PasswordStrengthHint
                  password={watchedNewPassword}
                  visible={newPasswordFocused}
                />
              </div>

              <div className="space-y-2 rtl:text-right">
                <Label htmlFor="confirm_password">{t('settings.confirmPassword')}</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  dir={dir}
                  className={inputTextClass}
                  autoComplete="new-password"
                  error={!!passwordForm.formState.errors.confirm_password}
                  {...passwordForm.register('confirm_password', {
                    onBlur: () => setConfirmPasswordFocused(false),
                  })}
                  onFocus={() => setConfirmPasswordFocused(true)}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-danger">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
                <PasswordStrengthHint
                  password={watchedNewPassword}
                  confirmPassword={watchedConfirmPassword}
                  showMatch
                  visible={confirmPasswordFocused}
                />
              </div>

              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting
                  ? t('settings.updatingPassword')
                  : t('settings.updatePassword')}
              </Button>
            </form>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <EmailVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        email={watchedEmail.trim()}
        onVerified={(email) => setVerifiedEmail(email.toLowerCase())}
      />
    </div>
  );
}
