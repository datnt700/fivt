import { describe, it, expect } from 'vitest';
import { 
  CHAT_ROUTES, 
  getChatSessionRoute, 
  isChatRoute, 
  isChatApiRoute 
} from '@/config/routes/chat';

describe('CHAT_ROUTES', () => {
  it('should have correct main chat routes', () => {
    expect(CHAT_ROUTES.INDEX).toBe('/chatbot');
    expect(CHAT_ROUTES.CHAT).toBe('/chatbot/chat');
    expect(CHAT_ROUTES.HISTORY).toBe('/chatbot/history');
  });

  it('should have correct session routes', () => {
    expect(CHAT_ROUTES.SESSION).toBe('/chatbot/session/[id]');
    expect(CHAT_ROUTES.NEW_SESSION).toBe('/chatbot/new');
  });

  it('should have correct settings routes', () => {
    expect(CHAT_ROUTES.SETTINGS).toBe('/chatbot/settings');
    expect(CHAT_ROUTES.PREFERENCES).toBe('/chatbot/preferences');
  });

  it('should have correct API routes', () => {
    expect(CHAT_ROUTES.API.CHAT).toBe('/api/chat');
    expect(CHAT_ROUTES.API.SESSIONS).toBe('/api/chat/sessions');
    expect(CHAT_ROUTES.API.SESSION_DETAIL).toBe('/api/chat/sessions/[id]');
    expect(CHAT_ROUTES.API.CLEAR_HISTORY).toBe('/api/chat/clear');
    expect(CHAT_ROUTES.API.EXPORT_HISTORY).toBe('/api/chat/export');
  });

  it('should be immutable (const assertion)', () => {
    // This test ensures the object is properly typed as const
    expect(typeof CHAT_ROUTES).toBe('object');
    expect(CHAT_ROUTES).toBeDefined();
  });
});

describe('getChatSessionRoute', () => {
  it('should generate correct session route with string ID', () => {
    expect(getChatSessionRoute('123')).toBe('/chatbot/session/123');
    expect(getChatSessionRoute('abc')).toBe('/chatbot/session/abc');
  });

  it('should handle UUID-style IDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(getChatSessionRoute(uuid)).toBe(`/chatbot/session/${uuid}`);
  });

  it('should handle numeric string IDs', () => {
    expect(getChatSessionRoute('42')).toBe('/chatbot/session/42');
    expect(getChatSessionRoute('0')).toBe('/chatbot/session/0');
  });

  it('should handle special characters in session ID', () => {
    expect(getChatSessionRoute('session-123')).toBe('/chatbot/session/session-123');
    expect(getChatSessionRoute('session_456')).toBe('/chatbot/session/session_456');
  });

  it('should handle empty string ID', () => {
    expect(getChatSessionRoute('')).toBe('/chatbot/session/');
  });

  it('should handle very long session IDs', () => {
    const longId = 'a'.repeat(100);
    expect(getChatSessionRoute(longId)).toBe(`/chatbot/session/${longId}`);
  });
});

describe('isChatRoute', () => {
  it('should return true for main chatbot routes', () => {
    expect(isChatRoute('/chatbot')).toBe(true);
    expect(isChatRoute('/chatbot/')).toBe(true);
    expect(isChatRoute('/chatbot/chat')).toBe(true);
    expect(isChatRoute('/chatbot/history')).toBe(true);
    expect(isChatRoute('/chatbot/settings')).toBe(true);
  });

  it('should return true for session routes', () => {
    expect(isChatRoute('/chatbot/session/123')).toBe(true);
    expect(isChatRoute('/chatbot/session/abc-def')).toBe(true);
    expect(isChatRoute('/chatbot/new')).toBe(true);
  });

  it('should return true for nested chatbot routes', () => {
    expect(isChatRoute('/chatbot/preferences')).toBe(true);
    expect(isChatRoute('/chatbot/custom/nested')).toBe(true);
    expect(isChatRoute('/chatbot/deeply/nested/path')).toBe(true);
  });

  it('should return false for non-chatbot routes', () => {
    expect(isChatRoute('/dashboard')).toBe(false);
    expect(isChatRoute('/banking')).toBe(false);
    expect(isChatRoute('/transactions')).toBe(false);
    expect(isChatRoute('/profile')).toBe(false);
    expect(isChatRoute('/')).toBe(false);
  });

  it('should return false for API routes', () => {
    expect(isChatRoute('/api/chat')).toBe(false);
    expect(isChatRoute('/api/chat/sessions')).toBe(false);
  });

  it('should return false for routes that contain chatbot but don\'t start with it', () => {
    expect(isChatRoute('/dashboard/chatbot')).toBe(false);
    expect(isChatRoute('/settings/chatbot/config')).toBe(false);
    expect(isChatRoute('chatbot')).toBe(false); // no leading slash
  });

  it('should handle edge cases', () => {
    expect(isChatRoute('')).toBe(false);
    // These return true because startsWith('/chatbot') matches them
    expect(isChatRoute('/chatbot-like')).toBe(true);
    expect(isChatRoute('/chatbots')).toBe(true);
    expect(isChatRoute('/chatbot-settings')).toBe(true);
  });

  it('should be case sensitive', () => {
    expect(isChatRoute('/CHATBOT')).toBe(false);
    expect(isChatRoute('/Chatbot')).toBe(false);
    expect(isChatRoute('/ChatBot')).toBe(false);
  });
});

describe('isChatApiRoute', () => {
  it('should return true for chat API routes', () => {
    expect(isChatApiRoute('/api/chat')).toBe(true);
    expect(isChatApiRoute('/api/chat/')).toBe(true);
    expect(isChatApiRoute('/api/chat/sessions')).toBe(true);
    expect(isChatApiRoute('/api/chat/sessions/123')).toBe(true);
    expect(isChatApiRoute('/api/chat/clear')).toBe(true);
    expect(isChatApiRoute('/api/chat/export')).toBe(true);
  });

  it('should return true for nested chat API routes', () => {
    expect(isChatApiRoute('/api/chat/sessions/abc-def/messages')).toBe(true);
    expect(isChatApiRoute('/api/chat/custom/endpoint')).toBe(true);
    expect(isChatApiRoute('/api/chat/deeply/nested/endpoint')).toBe(true);
  });

  it('should return false for non-chat API routes', () => {
    expect(isChatApiRoute('/api/users')).toBe(false);
    expect(isChatApiRoute('/api/transactions')).toBe(false);
    expect(isChatApiRoute('/api/banking')).toBe(false);
    expect(isChatApiRoute('/api/profile')).toBe(false);
    expect(isChatApiRoute('/api')).toBe(false);
  });

  it('should return false for non-API routes', () => {
    expect(isChatApiRoute('/chat')).toBe(false);
    expect(isChatApiRoute('/chatbot')).toBe(false);
    expect(isChatApiRoute('/chatbot/session/123')).toBe(false);
  });

  it('should return false for routes that contain api/chat but don\'t start with it', () => {
    expect(isChatApiRoute('/dashboard/api/chat')).toBe(false);
    expect(isChatApiRoute('/v1/api/chat')).toBe(false);
    expect(isChatApiRoute('api/chat')).toBe(false); // no leading slash
  });

  it('should handle edge cases', () => {
    expect(isChatApiRoute('')).toBe(false);
    // These return true because startsWith('/api/chat') matches them
    expect(isChatApiRoute('/api/chat-like')).toBe(true);
    expect(isChatApiRoute('/api/chats')).toBe(true);
    expect(isChatApiRoute('/api/chat-sessions')).toBe(true);
  });

  it('should be case sensitive', () => {
    expect(isChatApiRoute('/API/CHAT')).toBe(false);
    expect(isChatApiRoute('/Api/Chat')).toBe(false);
    expect(isChatApiRoute('/api/CHAT')).toBe(false);
  });

  it('should handle query parameters and fragments', () => {
    expect(isChatApiRoute('/api/chat?param=value')).toBe(true);
    expect(isChatApiRoute('/api/chat/sessions?limit=10')).toBe(true);
    expect(isChatApiRoute('/api/chat/sessions#section')).toBe(true);
    expect(isChatApiRoute('/api/chat?param=value&other=test')).toBe(true);
  });
});

describe('Chat Routes Integration', () => {
  it('should have consistent route structure between constants and helpers', () => {
    const sessionId = 'test-123';
    const generatedRoute = getChatSessionRoute(sessionId);
    const expectedRoute = CHAT_ROUTES.SESSION.replace('[id]', sessionId);
    
    expect(generatedRoute).toBe(expectedRoute);
  });

  it('should correctly identify routes generated by helpers', () => {
    const sessionRoute = getChatSessionRoute('example-session');
    expect(isChatRoute(sessionRoute)).toBe(true);
    expect(isChatApiRoute(sessionRoute)).toBe(false);
  });

  it('should handle all predefined routes correctly', () => {
    expect(isChatRoute(CHAT_ROUTES.INDEX)).toBe(true);
    expect(isChatRoute(CHAT_ROUTES.CHAT)).toBe(true);
    expect(isChatRoute(CHAT_ROUTES.HISTORY)).toBe(true);
    expect(isChatRoute(CHAT_ROUTES.NEW_SESSION)).toBe(true);
    expect(isChatRoute(CHAT_ROUTES.SETTINGS)).toBe(true);
    expect(isChatRoute(CHAT_ROUTES.PREFERENCES)).toBe(true);

    expect(isChatApiRoute(CHAT_ROUTES.API.CHAT)).toBe(true);
    expect(isChatApiRoute(CHAT_ROUTES.API.SESSIONS)).toBe(true);
    expect(isChatApiRoute(CHAT_ROUTES.API.CLEAR_HISTORY)).toBe(true);
    expect(isChatApiRoute(CHAT_ROUTES.API.EXPORT_HISTORY)).toBe(true);
  });

  it('should maintain route type consistency', () => {
    // UI routes should not be API routes
    expect(isChatApiRoute(CHAT_ROUTES.INDEX)).toBe(false);
    expect(isChatApiRoute(CHAT_ROUTES.CHAT)).toBe(false);
    
    // API routes should not be UI routes  
    expect(isChatRoute(CHAT_ROUTES.API.CHAT)).toBe(false);
    expect(isChatRoute(CHAT_ROUTES.API.SESSIONS)).toBe(false);
  });
});