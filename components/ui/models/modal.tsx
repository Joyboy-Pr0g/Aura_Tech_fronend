'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

const ModalContext = React.createContext(false);

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[min(96vw,72rem)]',
} as const;

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <ModalContext.Provider value={open}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}

export const ModalTrigger = DialogPrimitive.Trigger;

export const ModalClose = DialogPrimitive.Close;

export interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: keyof typeof sizeClasses;
  showClose?: boolean;
  closeLabel?: string;
  overlayClassName?: string;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      className,
      children,
      size = 'md',
      showClose = true,
      closeLabel = 'Close',
      overlayClassName,
      onPointerDownOutside,
      onEscapeKeyDown,
      ...props
    },
    ref,
  ) => {
    const open = React.useContext(ModalContext);
    const { t } = useLocale();
    const resolvedCloseLabel = closeLabel ?? t('admin.close');

    return (
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                  'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
                  overlayClassName,
                )}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              forceMount
              onPointerDownOutside={onPointerDownOutside}
              onEscapeKeyDown={onEscapeKeyDown}
              {...props}
            >
              <div
                ref={ref}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                  className={cn(
                    'relative flex w-full flex-col',
                    'rounded-2xl border border-white/10 bg-dark-900/95 backdrop-blur-xl',
                    'shadow-2xl shadow-black/50',
                    'max-h-[min(90vh,840px)]',
                    sizeClasses[size],
                    className,
                  )}
                >
                  {children}
                  {showClose && (
                    <DialogPrimitive.Close
                      className={cn(
                        'absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg',
                        'border border-white/10 text-white/50 transition-colors',
                        'hover:bg-white/5 hover:text-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                      )}
                      aria-label={resolvedCloseLabel}
                    >
                      <X size={18} />
                    </DialogPrimitive.Close>
                  )}
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    );
  },
);
ModalContent.displayName = 'ModalContent';

export function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 border-b border-white/10 px-6 py-5 pe-14', className)}
      {...props}
    />
  );
}

export function ModalTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  );
}

export function ModalDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-white/50', className)}
      {...props}
    />
  );
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-6 py-5', className)}
      {...props}
    />
  );
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
