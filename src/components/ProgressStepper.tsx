'use client';

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Personal Info', description: 'Basic details & links' },
  { number: 2, title: 'Summary & Role', description: 'Professional summary' },
  { number: 3, title: 'Experience', description: 'Work history' },
  { number: 4, title: 'Education', description: 'Academic background' },
  { number: 5, title: 'Skills & More', description: 'Skills, languages, certs' },
  { number: 6, title: 'Projects', description: 'Portfolio & projects' },
  { number: 7, title: 'Review & Export', description: 'Finalize & download' },
];

interface ProgressStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function ProgressStepper({ currentStep, onStepClick }: ProgressStepperProps) {
  return (
    <div className="bg-surface border border-accent rounded-lg p-4 md:p-6">
      {/* Mobile: Compact View */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Step {currentStep} of {STEPS.length}</span>
          <span className="text-xs text-text-secondary">{Math.round((currentStep / STEPS.length) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {STEPS[currentStep - 1].title}
          </h3>
          <p className="text-xs text-text-secondary">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Desktop: Full Stepper */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => onStepClick(step.number)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === step.number
                    ? 'bg-primary text-background scale-110'
                    : currentStep > step.number
                    ? 'bg-success text-background'
                    : 'bg-accent text-text-secondary'
                } ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {currentStep > step.number ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </button>

              {/* Step Info */}
              <div className="ml-3 flex-1">
                <h4 className={`text-sm font-semibold ${
                  currentStep >= step.number ? 'text-foreground' : 'text-text-secondary'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-text-secondary">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className={`h-0.5 w-full mx-4 ${
                  currentStep > step.number ? 'bg-success' : 'bg-accent'
                } transition-colors duration-300`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

