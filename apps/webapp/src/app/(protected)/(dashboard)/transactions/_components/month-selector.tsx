'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  onRefresh,
  loading,
}: MonthSelectorProps) {
  const t = useTranslations('transactions');

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      options.push({ value, label });
    }

    return options;
  };

  return (
    <div className="flex gap-3">
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('selectMonth')} />
        </SelectTrigger>
        <SelectContent>
          {getMonthOptions().map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={loading}
        title={t('refresh')}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
