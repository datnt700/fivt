import { z } from 'zod';
import { RecipeFinancialSchema } from '@/lib/recipeFinancialSchema';

export interface ChatMessage {
  id: number;
  question: string;
  loading: boolean;
  answer: string | null;
}

export interface ChatRequest {
  prompt: string;
  locale: string;
}

export interface ChatResponse {
  data: z.infer<typeof RecipeFinancialSchema>;
}

export interface ChatStreamData {
  chunk: string;
  done: boolean;
}

export interface ChatHookOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: Error) => void;
}