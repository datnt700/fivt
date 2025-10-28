'use client';

import React, { useEffect, useState } from 'react';
import { useFinancialRoadmapSteps } from './_data/index';
import StepForm from './_component/StepForm';
import Stepper from './_component/Stepper';
import { Button } from '@/components/ui/button';
import SubmissionResult from './_component/SubmissionResult';
import SubmitButton from './_component/SubmitButton';

type Roadmap = {
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
  roadmap?: Roadmap;
  raw?: string;
  error?: string;
};

export default function FinancialWizard() {
  const [activeStep, setActiveStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const steps = useFinancialRoadmapSteps();

  // Debug logging
  useEffect(() => {
    console.log('Current activeStep:', activeStep);
    console.log('Current result:', result);
  }, [activeStep, result]);

  // Show submission result if we have result data
  if (result) {
    return <SubmissionResult data={result} />;
  }

  // Safety check for currentStep
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

  const stepperSteps = steps.map((step, index) => ({
    step: index + 1,
    label: step.label,
  }));

  return (
    <div className="space-y-8 flex flex-col gap-10 p-4">
      <Stepper steps={stepperSteps} activeStep={activeStep} />

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <h2 className="text-xl font-bold">{currentStep.title}</h2>
        <StepForm
          questions={currentStep.questions ?? []}
          branches={currentStep.branches ?? []}
          answers={answers}
          onChange={(id, value) => {
            setAnswers(prev => ({ ...prev, [id]: value }));
          }}
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
              onResult={submitResult => {
                setResult(submitResult);
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
      </div>
    </div>
  );
}

// function SubmitButton({
//   disabled,
//   answers,
//   setActiveStep,
//   onResult,
// }: {
//   disabled?: boolean;
//   answers: Record<string, unknown>;
//   setActiveStep?: (updater: (s: number) => number) => void;
//   onResult: (res: SubmitResult) => void;
// }) {
//   const [loading, setLoading] = React.useState(false);

//   const handleSubmit = async () => {
//     if (disabled || loading) return;
//     setLoading(true);
//     try {
//       const payload = {
//         answers: Object.entries(answers).map(([questionId, answer]) => ({
//           questionId,
//           answer: String(answer ?? ''),
//         })),
//         locale:
//           typeof navigator !== 'undefined'
//             ? navigator.language?.slice(0, 2)
//             : 'en',
//       };

//       const res = await fetch('/api/roadmap', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json();

//       if (json.error) {
//         onResult({ error: json.error, raw: json.raw, roadmap: undefined });
//       } else {
//         onResult({ roadmap: json.roadmap, raw: json.raw, error: undefined });
//         setActiveStep?.(s => s + 1); // chuyển sang màn result (vì isComplete = true)
//       }
//     } catch (e: any) {
//       onResult({ error: e.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button disabled={!!disabled || loading} onClick={handleSubmit}>
//       {loading ? 'Generating…' : 'Submit'}
//     </Button>
//   );
// }
