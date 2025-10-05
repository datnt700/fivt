'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '../_validations/transaction-schema';
import { useCategories, useCreateCategory } from '../_hooks/use-categories';
import { useCreateTransaction } from '../_hooks/use-transaction';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog';

interface CreateTransactionFormProps {
  onSuccess?: () => void;
}

export function CreateTransactionForm({
  onSuccess,
}: CreateTransactionFormProps) {
  const { data: categories, isLoading } = useCategories();
  const createTransaction = useCreateTransaction();
  const locale = useLocale();
  const [cateValue, setCateValue] = useState<string>('');

  const tCategory = useTranslations('category');
  const tTransaction = useTranslations('transactions');
  const tCommon = useTranslations('common');

  const [isOpen, setIsOpen] = useState(false);
  const createCategory = useCreateCategory();

  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      type: 'INCOME',
      categoryId: '',
      description: '',
    },
  });

  const handleCategoryCreated = async () => {
    const created = await createCategory.mutateAsync(cateValue.trim());
    qc.setQueryData<Array<{ id: string; name: string }>>(
      ['categories', locale],
      old => {
        const prev = old ?? [];
        const id = String(created.id);
        if (prev.some(x => String(x.id) === id)) return prev;
        return [...prev, { id, name: created.name }];
      }
    );
    setValue('categoryId', String(created.id), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setIsOpen(false);
  };

  const onSubmit = async (values: CreateTransactionFormValues) => {
    try {
      await createTransaction.mutateAsync(values);
      reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to create transaction:', error);
    }
  };

  if (isLoading) return <p>{tCategory('noCategories')}</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4"
    >
      {/* Date */}
      <div className="w-full">
        <Label className="mb-3" htmlFor="date">
          {tTransaction('dateFilter')}
        </Label>
        <Input type="date" id="date" {...register('date')} />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="w-full">
        <Label className="mb-3" htmlFor="amount">
          {tTransaction('amount')}
        </Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="w-full">
        <Label className="mb-3" htmlFor="type">
          {tTransaction('nameType')}
        </Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tTransaction('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">
                  {tTransaction('type.income')}
                </SelectItem>
                <SelectItem value="EXPENSE">
                  {tTransaction('type.expense')}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="w-full">
        <div className=" flex items-end gap-3">
          <div className="w-full">
            <Label className="mb-3" htmlFor="categoryId">
              {tTransaction('category')}
            </Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  key={`${categories?.length}-${field.value ?? ''}`}
                  value={field.value ?? ''}
                  onValueChange={async val => {
                    field.onChange(val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tCategory('selected')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
          >
            {tCategory('addCategory')}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{tTransaction('category')}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-orange-500 ">
                <input
                  id="category"
                  type="text"
                  name="category"
                  onChange={e => setCateValue(e.target.value)}
                  className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {tCommon('cancel')}
                </Button>
                <Button onClick={handleCategoryCreated}>
                  {tCommon('save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Description */}
      <div className="w-full">
        <Label className="mb-3" htmlFor="description">
          {tTransaction('description')}
        </Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || createTransaction.isPending}
        >
          {tTransaction('addTransaction')}
        </Button>
      </div>

      {createTransaction.isError && (
        <p className="text-red-500 text-sm">
          ⚠️ {(createTransaction.error as Error).message}
        </p>
      )}
    </form>
  );
}
