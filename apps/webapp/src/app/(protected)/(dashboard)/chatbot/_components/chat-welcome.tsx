import { useTranslations } from 'next-intl';

interface ChatWelcomeProps {
  message?: string;
}

export function ChatWelcome({ message }: ChatWelcomeProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center text-gray-600">
        <p className="text-lg mb-2">👋</p>
        <p>{message || t('welcomeMessage')}</p>
      </div>
    </div>
  );
}