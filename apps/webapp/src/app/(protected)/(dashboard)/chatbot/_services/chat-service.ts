import { parse } from 'partial-json';
import { z } from 'zod';
import { RecipeFinancialSchema } from '@/lib/recipeFinancialSchema';
import { ChatRequest, ChatStreamData } from '../_types';

class ChatService {
  async sendMessage(request: ChatRequest): Promise<z.infer<typeof RecipeFinancialSchema>> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let data = '';
    let parsed = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      data += decoder.decode(value);
      parsed = parse(data);
    }

    return parsed as z.infer<typeof RecipeFinancialSchema>;
  }

  async sendMessageStream(
    request: ChatRequest,
    onUpdate: (text: string) => void
  ): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let data = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      data += decoder.decode(value);
      
      // Call the update callback with the current text
      onUpdate(data);
    }

    return data;
  }

  async *streamMessage(request: ChatRequest): AsyncGenerator<ChatStreamData, void, unknown> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let data = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield { chunk: data, done: true };
        break;
      }
      
      const chunk = decoder.decode(value);
      data += chunk;
      yield { chunk: data, done: false };
    }
  }
}

export const chatService = new ChatService();