import { Button } from '@/components/ui/button';
import { useState } from 'react';

type RoadmapShape = {
  title?: string;
  summary?: string;
  steps?: Array<{
    title?: string;
    description?: string;
    actionItems?: string[];
    expectedWeeks?: number;
  }>;
};
type SubmitResult = {
  roadmap?: RoadmapShape;
  raw?: string;
  error?: string;
};

export default function SubmitButton({
  disabled,
  answers,
  setActiveStep,
  onResult,
}: {
  disabled?: boolean;
  answers: Record<string, unknown>;
  setActiveStep?: (updater: (s: number) => number) => void;
  onResult: (res: SubmitResult) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: String(answer ?? ''),
        })),
        locale:
          typeof navigator !== 'undefined'
            ? navigator.language?.slice(0, 2)
            : 'en',
      };

      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.error) {
        onResult({ error: json.error, raw: json.raw, roadmap: undefined });
      } else {
        onResult({ roadmap: json.roadmap, raw: json.raw, error: undefined });
        setActiveStep?.(s => s + 1);
      }
    } catch (e: any) {
      onResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={!!disabled || loading} onClick={handleSubmit}>
      {loading ? 'Generating…' : 'Submit'}
    </Button>
  );
}
