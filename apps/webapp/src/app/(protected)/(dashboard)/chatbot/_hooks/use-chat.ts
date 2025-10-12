import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { ChatMessage, ChatRequest, ChatHookOptions } from '../_types';
import { chatService } from '../_services/chat-service';

export function useChat(options?: ChatHookOptions) {
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const messageId = Date.now();
      
      // Add the question to messages immediately
      setMessages(prev => [
        ...prev,
        { id: messageId, question: prompt, loading: true, answer: null },
      ]);

      const request: ChatRequest = { prompt, locale };
      
      try {
        // Use the service with streaming updates
        const finalAnswer = await chatService.sendMessageStream(request, (updatedText) => {
          // Update the message with the current text
          setMessages(prev =>
            prev.map(item =>
              item.id === messageId
                ? {
                    ...item,
                    loading: false,
                    answer: updatedText,
                  }
                : item
            )
          );
        });

        options?.onSuccess?.(finalAnswer);
        return finalAnswer;
      } catch (error) {
        // Update message to show error state
        setMessages(prev =>
          prev.map(item =>
            item.id === messageId
              ? { ...item, loading: false, answer: null }
              : item
          )
        );
        
        const errorMessage = error instanceof Error ? error : new Error('Unknown error');
        options?.onError?.(errorMessage);
        throw errorMessage;
      }
    },
  });

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    clearMessages,
  };
}