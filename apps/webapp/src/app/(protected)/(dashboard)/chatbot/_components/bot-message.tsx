interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  return (
    <div className="flex justify-start">
      <span className="text-sm text-white border rounded-xl bg-blue-500 px-4 py-3 max-w-[80%] inline-flex items-center justify-center min-h-[2.5rem] leading-relaxed">
        {content}
      </span>
    </div>
  );
}