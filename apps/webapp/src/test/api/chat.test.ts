import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/[locale]/api/chat/route';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn(),
  };
});

const mockOpenAI = vi.mocked(OpenAI);

describe('/api/chat POST route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle valid request with prompt', async () => {
    // Mock OpenAI client
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [{ delta: { content: 'Mock' } }] };
              yield { choices: [{ delta: { content: ' response' } }] };
            }
          })
        }
      }
    };

    mockOpenAI.mockImplementation(() => mockClient as unknown as OpenAI);

    // Create mock request with locale
    const mockRequest = {
      json: vi.fn().mockResolvedValue({ 
        prompt: 'Test financial advice',
        locale: 'en'
      })
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(mockRequest.json).toHaveBeenCalled();
    expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-nano',
        messages: [
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('financial advisor')
          }),
          {
            role: 'user',
            content: 'Test financial advice'
          }
        ],
        stream: true
      })
    );

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(response.headers.get('Transfer-Encoding')).toBe('chunked');
  });

  it('should handle invalid JSON request', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle OpenAI API errors', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('OpenAI API Error'))
        }
      }
    };

    mockOpenAI.mockImplementation(() => mockClient as unknown as OpenAI);

    const mockRequest = {
      json: vi.fn().mockResolvedValue({ 
        prompt: 'Test prompt',
        locale: 'en'
      })
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});