import { useEffect, useRef } from 'react';
import { ChatMessage } from '../_types';
import { ChatMessageItem } from './chat-message-item';
import { ChatWelcome } from './chat-welcome';

interface ChatMessagesProps {
  messages: ChatMessage[];
  welcomeMessage?: string;
}

export function ChatMessages({ messages, welcomeMessage }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto pb-6 w-full">
      {messages.length === 0 ? (
        <ChatWelcome message={welcomeMessage} />
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessageItem key={message.id} message={message} index={index} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </>
      )}
    </div>
  );
}