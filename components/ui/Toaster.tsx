'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

function addToast(toast: Omit<Toast, 'id'>) {
  toasts = [...toasts, { ...toast, id: Math.random().toString(36).slice(2) }];
  emit();
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(message: string, type: Toast['type'] = 'info') {
  addToast({ message, type });
}

const TYPE_STYLES = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-danger/40 bg-danger/10 text-danger',
  info: 'border-primary-500/40 bg-primary-500/10 text-primary-400',
};

export function Toaster() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    const timers = currentToasts.map((t) =>
      setTimeout(() => removeToast(t.id), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [currentToasts]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {currentToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={cn(
              'flex items-center gap-3 border rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
              'pointer-events-auto min-w-[260px] max-w-sm',
              TYPE_STYLES[t.type],
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
