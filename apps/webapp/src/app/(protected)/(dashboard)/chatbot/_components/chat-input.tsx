import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled = false, placeholder }: ChatInputProps) {
  const t = useTranslations('chatbot');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4 shrink-0">
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        className="w-full resize-none outline-none overflow-y-auto max-h-[250px] disabled:opacity-50"
        placeholder={placeholder || t('placeholder')}
      />
      <Button
        type="submit"
        size="icon"
        className="h-10 w-10 rounded-full flex justify-center items-center self-end"
        aria-label={t('send')}
        onClick={handleSubmit}
        disabled={disabled || !prompt.trim()}
      >
        <Send />
      </Button>
    </div>
  );
}