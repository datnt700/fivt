import { useTranslations } from 'next-intl';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ChatHeader({ title, subtitle }: ChatHeaderProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="flex flex-col p-4 border-b bg-white shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">
        {title || t('title')}
      </h1>
      <p className="text-sm text-gray-600">
        {subtitle || t('subtitle')}
      </p>
    </div>
  );
}