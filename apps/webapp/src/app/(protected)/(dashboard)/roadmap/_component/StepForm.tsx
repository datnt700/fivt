import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  label: string;
  type: 'input' | 'checkbox' | 'textarea' | 'radio';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface Branch {
  condition: (answers: Record<string, any>) => boolean;
  questions: Question[];
}

interface StepFormProps {
  questions?: Question[];
  branches?: Branch[];
  answers: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

export default function StepForm({
  questions,
  branches,
  answers,
  onChange,
}: StepFormProps) {
  const activeBranch = branches?.find(b => b.condition(answers));
  const renderQuestions = activeBranch
    ? activeBranch.questions
    : questions || [];
  return (
    <div className="space-y-4">
      {renderQuestions.map(q => {
        switch (q.type) {
          case 'checkbox':
            return (
              <Checkbox
                key={q.id}
                checked={!!answers[q.id]}
                onChange={checked => onChange(q.id, checked)}
                label={q.label}
              />
            );

          case 'textarea':
            return (
              <div key={q.id} className="flex flex-col gap-5">
                <Label htmlFor={q.label}>{q.label}</Label>
                <Textarea
                  key={q.id}
                  value={answers[q.id] || ''}
                  placeholder={q.placeholder}
                  onChange={e => onChange(q.id, e.target.value)}
                />
              </div>
            );
          case 'radio':
            return (
              <RadioGroup
                key={q.id}
                label={q.label}
                name={q.id}
                value={answers[q.id] || ''}
                onValueChange={val => onChange(q.id, val)}
                options={q.options || []}
              />
            );

          default:
            return (
              <div key={q.id} className="flex flex-col gap-5">
                <Label htmlFor={q.label}>{q.label}</Label>
                <Input
                  key={q.id}
                  value={answers[q.id] || ''}
                  placeholder={q.placeholder}
                  onChange={e => onChange(q.id, e.target.value)}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
