import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Create hoisted mock
const mockChatCompletionsCreate = vi.hoisted(() => vi.fn());

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockChatCompletionsCreate,
        },
      },
    })),
  };
});

// Import after mocking
import { POST } from '@/app/api/chat/route';

describe('/api/chat POST route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatCompletionsCreate.mockClear();
  });

  it('should handle valid request with prompt', async () => {
    // Mock the detectIntent call first (returns "financial")
    mockChatCompletionsCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'financial' } }],
      })
      .mockReturnValueOnce({
        async *[Symbol.asyncIterator]() {
          yield { choices: [{ delta: { content: 'Mock' } }] };
          yield { choices: [{ delta: { content: ' response' } }] };
        },
      });

    // Create mock request with locale
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        prompt: 'Test financial advice',
        locale: 'en',
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(mockRequest.json).toHaveBeenCalled();
    expect(mockChatCompletionsCreate).toHaveBeenCalledTimes(2); // Once for intent detection, once for response
    
    // Check the second call (the actual financial advice call)
    expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-nano',
        messages: [
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('financial advisor'),
          }),
          {
            role: 'user',
            content: 'Test financial advice',
          },
        ],
        stream: true,
      })
    );

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(response.headers.get('Transfer-Encoding')).toBe('chunked');
  });

  it('should handle invalid JSON request', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle OpenAI API errors', async () => {
    // Mock the detectIntent call to fail
    mockChatCompletionsCreate.mockRejectedValue(new Error('OpenAI API Error'));

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        prompt: 'Test prompt',
        locale: 'en',
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
