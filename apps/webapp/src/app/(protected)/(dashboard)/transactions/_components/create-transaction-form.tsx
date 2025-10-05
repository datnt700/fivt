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
import { useTranslations } from 'next-intl';
import { createTransactionSchema, type CreateTransactionFormValues } from '../_validations/transaction-schema';
import { useCategories, useCreateCategory } from '../_hooks/use-categories';
import { useCreateTransaction } from '../_hooks/use-transaction';

interface CreateTransactionFormProps {
  onSuccess?: () => void;
}

export function CreateTransactionForm({ onSuccess }: CreateTransactionFormProps) {
  const { data: categories, isLoading } = useCategories();
  const createTransaction = useCreateTransaction();
  const createCategory = useCreateCategory();
  
  const tCategory = useTranslations('category');
  const tTransaction = useTranslations('transactions');
  
  const {
    register,
    handleSubmit,
    control,
    reset,
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
      className="w-full max-w-md mx-auto flex flex-col gap-4"
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
        <Label className="mb-3" htmlFor="categoryId">
          {tTransaction('category')}
        </Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={async (val) => {
                if (val === '__new__') {
                  const name = prompt('Enter category name:');
                  if (name?.trim()) {
                    try {
                      const created = await createCategory.mutateAsync(name.trim());
                      field.onChange(created.id);
                    } catch (error) {
                      console.error('Failed to create category:', error);
                    }
                  }
                } else {
                  field.onChange(val);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tCategory('selected')} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value="__new__">
                  {tCategory('addCategory')}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
        )}
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