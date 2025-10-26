'use client';

import React, { useEffect, useState } from 'react';
import { useFinancialRoadmapSteps } from './_data/index';
import StepForm from './_component/StepForm';
import Stepper from './_component/Stepper';
import { Button } from '@/components/ui/button';

export default function FinancialWizard() {
  const [activeStep, setActiveStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const steps = useFinancialRoadmapSteps();

  useEffect(() => {
    console.log('Active step changed to:', activeStep);
  }, [activeStep]);

  // Ensure all hooks are called before any early returns or conditions
  const handleChange = (id: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const stepperSteps = steps.map((step, index) => ({
    step: index + 1,
    label: step.label,
  }));

  // Safety check: ensure activeStep is within bounds
  const safeActiveStep = Math.max(1, Math.min(activeStep, steps.length));
  const currentStep = steps[safeActiveStep - 1];

  if (!currentStep) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  const getVisibleQuestions = () => {
    const mainQuestions = currentStep.questions ?? [];
    const activeBranch = currentStep.branches?.find(
      branch => !branch.condition || branch.condition(answers)
    );
    const branchQuestions = activeBranch?.questions ?? [];
    return [...mainQuestions, ...branchQuestions];
  };

  const visibleQuestions = getVisibleQuestions();
  const allAnswered =
    visibleQuestions.length > 0 &&
    visibleQuestions.every(q => {
      const value = answers[q.id];
      return value !== undefined && value !== '' && value !== null;
    });
  return (
    <div className="space-y-8 flex flex-col gap-10 p-4">
      <Stepper steps={stepperSteps} activeStep={activeStep} />

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <h2 className="text-xl font-bold">{currentStep.title}</h2>
        <StepForm
          questions={currentStep.questions ?? []}
          branches={currentStep.branches ?? []}
          answers={answers}
          onChange={handleChange}
        />

        <div className="flex justify-between mt-6">
          <Button
            disabled={activeStep === 1}
            onClick={() => setActiveStep(s => s - 1)}
          >
            Previous
          </Button>
          {activeStep === steps.length ? (
            <SubmitButton
              disabled={!allAnswered}
              answers={answers}
              setActiveStep={setActiveStep}
              onSuccess={() => {
                /* optionally navigate to result page or show toast */
              }}
            />
          ) : (
            <Button
              disabled={!allAnswered}
              onClick={() => setActiveStep(s => s + 1)}
            >
              Next
            </Button>
          )}
        </div>
        {/* Result area will appear after submission */}
        <SubmissionResult />
      </div>
    </div>
  );
}

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

function SubmissionResult() {
  const [result, setResult] = React.useState<RoadmapShape | null>(null);
  const [raw, setRaw] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // The API returns JSON; the SubmitButton will dispatch a custom event with results
  React.useEffect(() => {
    function handler(e: Event) {
      const detail = (
        e as CustomEvent<{
          roadmap?: RoadmapShape | null;
          raw?: string;
          error?: string;
        }>
      ).detail;
      if (detail?.error) {
        setError(detail.error);
        setResult(null);
        setRaw(detail.raw ?? null);
      } else {
        setResult(detail?.roadmap ?? null);
        setRaw(detail?.raw ?? null);
        setError(null);
      }
    }
    window.addEventListener('fivt:roadmap:result', handler as EventListener);
    return () =>
      window.removeEventListener(
        'fivt:roadmap:result',
        handler as EventListener
      );
  }, []);

  if (!result && !raw && !error) return null;

  return (
    <div className="mt-6 p-4 border rounded">
      {error && <div className="text-red-600">{error}</div>}
      {result ? (
        <div>
          <h3 className="font-semibold">{result.title}</h3>
          <p className="text-sm mb-2">{result.summary}</p>
          <ol className="list-decimal pl-5">
            {result.steps?.map((s, i: number) => (
              <li key={i} className="mb-2">
                <strong>{s.title}</strong>
                <p>{s.description}</p>
                {s.actionItems?.length ? (
                  <ul className="list-disc pl-5">
                    {s.actionItems.map((a: string, j: number) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap">{raw}</pre>
      )}
    </div>
  );
}

function SubmitButton({
  disabled,
  answers,
  onSuccess,
  setActiveStep,
}: {
  disabled?: boolean;
  answers: Record<string, unknown>;
  onSuccess?: () => void;
  setActiveStep?: (stepUpdater: (step: number) => number) => void;
}) {
  const [loading, setLoading] = React.useState(false);

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
      const detail = json.error
        ? { error: json.error, raw: json.raw }
        : { roadmap: json.roadmap, raw: json.raw };

      // Dispatch a window event so SubmissionResult can pick it up (keeps wiring minimal)
      window.dispatchEvent(new CustomEvent('fivt:roadmap:result', { detail }));
      if (!json.error) {
        if (setActiveStep) setActiveStep(s => s + 1);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent('fivt:roadmap:result', {
          detail: { error: (err as Error).message },
        })
      );
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
