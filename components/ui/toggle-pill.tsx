'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TogglePillProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TogglePill({
  checked,
  onCheckedChange,
  label,
  icon,
  disabled = false,
  className,
  id,
}: TogglePillProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-all select-none',
        checked
          ? 'border-primary-500/40 bg-primary-500/10 text-primary-300 shadow-[0_0_16px_rgba(0,217,255,0.12)]'
          : 'border-white/10 bg-dark-900/80 text-white/55 hover:border-white/20 hover:bg-white/[0.03] hover:text-white/75',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all',
          checked
            ? 'border-primary-500 bg-primary-500 text-dark-950'
            : 'border-white/20 bg-dark-950/60',
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      {icon && (
        <span className={cn('shrink-0', checked ? 'text-primary-400' : 'text-white/35')}>
          {icon}
        </span>
      )}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </label>
  );
}
