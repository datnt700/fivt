/**
 * Chat/AI module routes
 * All routes related to chatbot and AI functionality
 */

export const CHAT_ROUTES = {
  // Main chat routes
  INDEX: '/chatbot',
  CHAT: '/chatbot/chat',
  HISTORY: '/chatbot/history',
  
  // Chat sessions
  SESSION: '/chatbot/session/[id]',
  NEW_SESSION: '/chatbot/new',
  
  // Chat settings
  SETTINGS: '/chatbot/settings',
  PREFERENCES: '/chatbot/preferences',
  
  // API routes for chat
  API: {
    CHAT: '/api/chat',
    SESSIONS: '/api/chat/sessions',
    SESSION_DETAIL: '/api/chat/sessions/[id]',
    CLEAR_HISTORY: '/api/chat/clear',
    EXPORT_HISTORY: '/api/chat/export',
  },
} as const;

/**
 * Helper functions for chat routes
 */
export function getChatSessionRoute(sessionId: string): string {
  return `/chatbot/session/${sessionId}`;
}

export function isChatRoute(pathname: string): boolean {
  return pathname.startsWith('/chatbot');
}

export function isChatApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/chat');
}