import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { categoryService } from '../_services/category-service';

export function useCategories() {
  const locale = useLocale();

  return useQuery({
    queryKey: ['categories', locale],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', locale] });
    },
  });
}