import { vi, beforeEach, describe, it, expect } from 'vitest';
import { chatService } from '@/app/(protected)/(dashboard)/chatbot/_services/chat-service';
import { ChatRequest } from '@/app/(protected)/(dashboard)/chatbot/_types';

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock partial-json
vi.mock('partial-json', () => ({
  parse: vi.fn((data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      // Return partial object for streaming tests
      return { title: 'Partial response', content: data };
    }
  }),
}));

describe('ChatService', () => {
  const mockRequest: ChatRequest = {
    prompt: 'How can I save money?',
    locale: 'en',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message and return parsed financial recipe', async () => {
      const mockResponse = {
        title: 'Money Saving Tips',
        content: 'Here are some ways to save money...',
        strategies: [
          { name: 'Budget tracking', detail: 'Track your expenses monthly' },
          { name: 'Emergency fund', detail: 'Save 3-6 months of expenses' },
        ],
      };

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(mockResponse)));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessage(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow('Failed to send message');
    });

    it('should throw error when response body is not readable', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: null,
      });

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow('Response body is not readable');
    });

    it('should handle streaming response correctly', async () => {
      const chunk1 = '{"title": "Financial';
      const chunk2 = ' Advice", "content": "Save money by..."}';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(chunk1));
          controller.enqueue(new TextEncoder().encode(chunk2));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessage(mockRequest);

      expect(result).toEqual({
        title: 'Financial Advice',
        content: 'Save money by...',
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedJson = '{"title": "Test", "incomplete":';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(malformedJson));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessage(mockRequest);

      // Should fallback to partial parsing
      expect(result).toEqual({
        title: 'Partial response',
        content: malformedJson,
      });
    });
  });

  describe('sendMessageStream', () => {
    it('should stream message with updates', async () => {
      const updates: string[] = [];
      const onUpdate = vi.fn((text: string) => {
        updates.push(text);
      });

      const chunk1 = 'Start saving';
      const chunk2 = ' money by';
      const chunk3 = ' creating a budget.';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(chunk1));
          controller.enqueue(new TextEncoder().encode(chunk2));
          controller.enqueue(new TextEncoder().encode(chunk3));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessageStream(mockRequest, onUpdate);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });

      expect(onUpdate).toHaveBeenCalledTimes(3);
      expect(onUpdate).toHaveBeenNthCalledWith(1, 'Start saving');
      expect(onUpdate).toHaveBeenNthCalledWith(2, 'Start saving money by');
      expect(onUpdate).toHaveBeenNthCalledWith(3, 'Start saving money by creating a budget.');

      expect(result).toBe('Start saving money by creating a budget.');
    });

    it('should handle empty stream', async () => {
      const onUpdate = vi.fn();
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessageStream(mockRequest, onUpdate);

      expect(onUpdate).not.toHaveBeenCalled();
      expect(result).toBe('');
    });

    it('should throw error when streaming response is not ok', async () => {
      const onUpdate = vi.fn();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(chatService.sendMessageStream(mockRequest, onUpdate)).rejects.toThrow('Failed to send message');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when streaming response body is not readable', async () => {
      const onUpdate = vi.fn();

      mockFetch.mockResolvedValue({
        ok: true,
        body: null,
      });

      await expect(chatService.sendMessageStream(mockRequest, onUpdate)).rejects.toThrow('Response body is not readable');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should handle single chunk stream', async () => {
      const onUpdate = vi.fn();
      const singleChunk = 'Complete financial advice in one chunk.';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(singleChunk));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessageStream(mockRequest, onUpdate);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(singleChunk);
      expect(result).toBe(singleChunk);
    });

    it('should handle unicode characters in stream', async () => {
      const onUpdate = vi.fn();
      const unicodeText = '💰 Tiết kiệm tiền 💰';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(unicodeText));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const result = await chatService.sendMessageStream(mockRequest, onUpdate);

      expect(onUpdate).toHaveBeenCalledWith(unicodeText);
      expect(result).toBe(unicodeText);
    });
  });

  describe('streamMessage (AsyncGenerator)', () => {
    it('should yield stream data chunks', async () => {
      const chunk1 = 'Financial';
      const chunk2 = ' advice';
      const chunk3 = ' content';
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(chunk1));
          controller.enqueue(new TextEncoder().encode(chunk2));
          controller.enqueue(new TextEncoder().encode(chunk3));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const generator = chatService.streamMessage(mockRequest);
      const chunks = [];

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(4); // 3 data chunks + 1 done chunk
      expect(chunks[0]).toEqual({ chunk: 'Financial', done: false });
      expect(chunks[1]).toEqual({ chunk: 'Financial advice', done: false });
      expect(chunks[2]).toEqual({ chunk: 'Financial advice content', done: false });
      expect(chunks[3]).toEqual({ chunk: 'Financial advice content', done: true });
    });

    it('should handle empty generator stream', async () => {
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const generator = chatService.streamMessage(mockRequest);
      const chunks = [];

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ chunk: '', done: true });
    });

    it('should throw error in generator when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const generator = chatService.streamMessage(mockRequest);

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of generator) {
          // Should not reach here
        }
      }).rejects.toThrow('Failed to send message');
    });

    it('should throw error in generator when body is not readable', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: null,
      });

      const generator = chatService.streamMessage(mockRequest);

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of generator) {
          // Should not reach here
        }
      }).rejects.toThrow('Response body is not readable');
    });

    it('should handle large streaming data correctly', async () => {
      const largeData = 'A'.repeat(10000); // 10KB of data
      
      const mockReadableStream = new ReadableStream({
        start(controller) {
          // Split into smaller chunks to simulate real streaming
          const chunkSize = 1000;
          for (let i = 0; i < largeData.length; i += chunkSize) {
            const chunk = largeData.slice(i, i + chunkSize);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const generator = chatService.streamMessage(mockRequest);
      const chunks = [];

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(1);
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk?.done).toBe(true);
      expect(lastChunk?.chunk).toBe(largeData);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(chatService.sendMessage(mockRequest)).rejects.toThrow('Request timeout');
    });

    it('should handle malformed request', async () => {
      const invalidRequest = { prompt: '', locale: '' } as ChatRequest;

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(chatService.sendMessage(invalidRequest)).rejects.toThrow('Failed to send message');
    });
  });

  describe('Request formatting', () => {
    it('should send properly formatted request', async () => {
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{}'));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      await chatService.sendMessage(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'How can I save money?',
          locale: 'en',
        }),
      });
    });

    it('should handle special characters in prompt', async () => {
      const specialRequest: ChatRequest = {
        prompt: 'How to save 15% of $10,000? 💰',
        locale: 'vi',
      };

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{}'));
          controller.close();
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      await chatService.sendMessage(specialRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(specialRequest),
      });
    });
  });
});