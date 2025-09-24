'use client';

import { useEffect, useState, useTransition } from 'react';
import { createTransaction } from '../../../../../actions/transaction';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Label } from '../../../../../components/ui/label';
import { createCategory } from '../../../../../actions/category';
import { TransactionType } from '@prisma/client';
import type { Category } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

export function CreateTransitionForm() {
  const [result, setResult] = useState<any>(null);
  const [pending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const locale = useLocale();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'INCOME',
    categoryId: '',
  });

  useEffect(() => {
    fetch(`/${locale}/api/category`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form
      action={formData => {
        startTransition(async () => {
          const res = await createTransaction({
            amount: Number(formData.get('amount') || ''),
            type: String(formData.get('type') || '') as TransactionType,
            categoryId: String(formData.get('category') || ''),
            description: String(formData.get('description') || ''),
            date: String(formData.get('date') || ''),
          });
          setResult(res);
        });
      }}
    >
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="w-full">
          <Label className="mb-3" htmlFor="date">
            Date
          </Label>
          <Input type="date" name="date" placeholder="date" />
        </div>
        <div className="w-full">
          <Label className="mb-3" htmlFor="type">
            Amount
          </Label>
          <Input name="amount" placeholder="amount" />
        </div>
        <div className="w-full">
          <Label className="mb-3" htmlFor="type">
            Type
          </Label>
          <Select
            value={formData.type}
            onValueChange={value => handleInputChange('type', value)}
            name="type"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">INCOME</SelectItem>
              <SelectItem value="EXPENSE">EXPENSE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <Label className="mb-3" htmlFor="category">
            Category
          </Label>
          <Select
            value={selectedCategory}
            onValueChange={async value => {
              if (value === '__new__') {
                const name = prompt('Nhập tên category mới:');
                if (name) {
                  const res = await createCategory(name);
                  if (res.success && res.data) {
                    setCategories(prev => [...prev, res.data]);
                    setSelectedCategory(res.data.id);
                  } else {
                    console.error('Failed to create category', res.error);
                  }
                }
              } else {
                setSelectedCategory(value);
              }
            }}
            name="category"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select or create category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value="__new__">+ Tạo mới</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea name="description" placeholder="description" />
        <div className="flex gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}
