interface Step {
  label: string;
  step: number;
}

interface StepperProps {
  steps: Step[];
  activeStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, activeStep }) => {
  const totalSteps = steps.length;
  const width = `${(100 / (totalSteps - 1)) * (activeStep - 1)}%`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="before:transform-y-1/2 relative flex justify-between before:absolute before:top-1/2 before:left-0 before:h-1 before:w-full before:bg-slate-200">
        {steps.map(({ step, label }) => (
          <div className="relative z-10" key={step}>
            <div
              className={`flex size-16 items-center justify-center rounded-full border-2 border-zinc-200 bg-white transition-all delay-200 ease-in ${
                activeStep >= step ? 'border-slate-400' : ''
              }`}
            >
              {activeStep > step ? (
                <div className="-scale-x-100 rotate-45 text-2xl font-semibold text-orange-500">
                  L
                </div>
              ) : (
                <span className="text-lg font-medium text-zinc-400">
                  {step}
                </span>
              )}
            </div>
          </div>
        ))}
        <div
          className="transform-y-1/2 absolute top-1/2 left-0 h-1 w-full bg-slate-400 transition-all delay-200 ease-in"
          style={{ width: width }}
        ></div>
      </div>
    </div>
  );
};

export default Stepper;
