'use client';

import { useState } from 'react';
import { useFinancialRoadmapSteps } from './_data/index';
import StepForm from './_component/StepForm';
import Stepper from './_component/Stepper';
import { Button } from '@/components/ui/button';

export default function FinancialWizard() {
  const [activeStep, setActiveStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const steps = useFinancialRoadmapSteps();
  const currentStep = steps[activeStep - 1];

  if (!currentStep) return null;

  const stepperSteps = steps.map((step, index) => ({
    step: index + 1,
    label: step.label,
  }));
  console.log(currentStep);
  const handleChange = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

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
          <Button
            disabled={activeStep === stepperSteps.length}
            onClick={() => setActiveStep(s => s + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
