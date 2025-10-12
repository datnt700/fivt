'use client';

import { useChat } from './_hooks/use-chat';
import { ChatHeader, ChatMessages, ChatInput } from './_components';

export default function ChatBot() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <section className="chat flex flex-col w-full h-full">
      <ChatHeader />
      <div className="flex-1 min-h-0">
        <ChatMessages messages={messages} />
      </div>
      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </section>
  );
}