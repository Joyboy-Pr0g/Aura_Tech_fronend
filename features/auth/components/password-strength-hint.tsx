'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PasswordStrengthHintProps {
  password: string;
  confirmPassword?: string;
  showMatch?: boolean;
  visible?: boolean;
}

function getRules(password: string) {
  return {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /\d/.test(password),
  };
}

export function PasswordStrengthHint({
  password,
  confirmPassword = '',
  showMatch = false,
  visible = true,
}: PasswordStrengthHintProps) {
  const { t } = useLocale();

  if (!visible) return null;

  const rules = getRules(password);
  const passwordsMatch =
    showMatch && confirmPassword.length > 0 && password === confirmPassword;

  const items = [
    { ok: rules.minLength, label: t('settings.passwordRuleMinLength') },
    { ok: rules.uppercase, label: t('settings.passwordRuleUppercase') },
    { ok: rules.lowercase, label: t('settings.passwordRuleLowercase') },
    { ok: rules.digit, label: t('settings.passwordRuleDigit') },
  ];

  if (showMatch) {
    items.push({
      ok: passwordsMatch,
      label: t('settings.passwordRuleMatch'),
    });
  }

  return (
    <div
      className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 shadow-lg shadow-black/20"
      role="note"
      aria-live="polite"
    >
      <p className="mb-2 text-xs font-medium text-white/50">
        {t('settings.passwordHintTitle')}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            {item.ok ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-white/30" />
            )}
            <span className={cn(item.ok ? 'text-success' : 'text-white/50')}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
