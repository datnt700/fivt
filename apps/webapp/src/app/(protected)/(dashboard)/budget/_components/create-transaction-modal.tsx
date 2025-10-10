'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateTransactionForm } from './create-transaction-form';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTransactionModalProps) {
  const t = useTranslations('budget');

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTransaction')}</DialogTitle>
        </DialogHeader>

        <CreateTransactionForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
