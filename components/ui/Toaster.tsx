'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
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
  success: 'border-success bg-dark-900 text-success shadow-[0_8px_32px_rgba(0,0,0,0.65)]',
  error: 'border-danger bg-dark-900 text-danger shadow-[0_8px_32px_rgba(0,0,0,0.65)]',
  info: 'border-primary-500 bg-dark-900 text-primary-300 shadow-[0_8px_32px_rgba(0,0,0,0.65)]',
};

export function Toaster() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [dir, setDir] = useState<'ltr' | 'rtl'>('rtl');

  useEffect(() => {
    const root = document.documentElement;
    const syncDir = () => setDir(root.dir === 'ltr' ? 'ltr' : 'rtl');
    syncDir();
    const observer = new MutationObserver(syncDir);
    observer.observe(root, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers = currentToasts.map((t) =>
      setTimeout(() => removeToast(t.id), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [currentToasts]);

  const enterX = dir === 'rtl' ? -80 : 80;
  const exitX = dir === 'rtl' ? 80 : -80;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] space-y-2 pointer-events-none isolate"
      aria-live="polite"
    >
      <AnimatePresence>
        {currentToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: enterX, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: exitX, y: -8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={cn(
              'flex items-center gap-3 border-2 rounded-xl px-4 py-3.5 text-sm font-semibold',
              'pointer-events-auto min-w-[280px] max-w-md backdrop-blur-none',
              TYPE_STYLES[t.type],
            )}
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
