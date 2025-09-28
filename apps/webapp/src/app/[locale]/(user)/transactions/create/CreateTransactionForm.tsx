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
import type { Category } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';

const formSchema = z.object({
  date: z.string().min(1, 'Select date'),
  amount: z.coerce.number().positive('Amount must be > 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Choose a category'),
  description: z.string().trim().max(200).optional(),
});
type FormValues = z.infer<typeof formSchema>;

function useCategories(locale: string) {
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: async () => {
      const r = await fetch('/api/category', { cache: 'no-store' });
      if (!r.ok) throw new Error('Failed to load categories');
      return r.json() as Promise<Array<{ id: string; name: string }>>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function CreateTransitionForm() {
  const locale = useLocale();
  const qc = useQueryClient();
  const { data: categories, isLoading } = useCategories(locale);
  const tCategory = useTranslations('category');
  const tTransaction = useTranslations('transactions');
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      type: 'INCOME',
      categoryId: '',
      description: '',
    },
  });

  const createTx = useMutation({
    mutationFn: async (values: FormValues) => {
      const r = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!r.ok) throw new Error('Create failed');
      return r.json();
    },
    onSuccess: () => {
      reset();
      qc.invalidateQueries({ queryKey: ['transactions', locale] });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      const r = await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) throw new Error('Create category failed');
      return (await r.json()) as Category;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', locale] });
    },
  });

  const onSubmit = (values: FormValues) => createTx.mutate(values);

  if (isLoading) return <p>{tCategory('noCategories')}</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4"
    >
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
      </div>

      {/* Category (with create new) */}
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
              onValueChange={async val => {
                if (val === '__new__') {
                  const name = '';
                  if (name) {
                    const created = await createCategory.mutateAsync(name);
                    field.onChange(created.id);
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
                {categories?.map(c => (
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
        <Button type="submit" disabled={isSubmitting || createTx.isPending}>
          {tTransaction('addTransaction')}
        </Button>
      </div>

      {createTx.isError && (
        <p className="text-red-500 text-sm">
          ⚠️ {(createTx.error as Error).message}
        </p>
      )}
    </form>
  );
}
