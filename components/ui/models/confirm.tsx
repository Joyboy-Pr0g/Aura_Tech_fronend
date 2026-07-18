'use client';

import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from './modal';
import { Button } from '../button';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ConfirmModalProps {
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    loading: boolean;
    confirmText: string;
    cancelText: string;
    confirmVariant: 'danger' | 'primary' | 'link' | 'outline' | 'ghost';
    cancelVariant: 'outline' | 'primary' | 'link' | 'ghost';
}

export const ConfirmModal = ({ name, onConfirm, onCancel, isOpen, setIsOpen, loading, confirmText, cancelText, confirmVariant, cancelVariant }: ConfirmModalProps) => {
    const { t } = useLocale();

    return (
        <Modal open={isOpen} onOpenChange={setIsOpen}>
            <ModalContent size="md">
                <ModalHeader>
                    <ModalTitle>{t('common.deleteTitle', { name })}</ModalTitle>
                    <ModalDescription>{t('common.deleteConfirm', { name })}</ModalDescription>
                </ModalHeader>
                <ModalBody>
                    <p className='text-white/50'>{t('common.cannotUndo')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button disabled={loading} variant={cancelVariant} onClick={onCancel}>{cancelText}</Button>
                    <Button disabled={loading} variant={confirmVariant} onClick={onConfirm}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
