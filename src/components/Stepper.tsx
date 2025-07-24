import React, { useEffect, useState } from 'react';
import { Step, NNState } from '@/types';
import katex from 'katex';

interface StepperProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  nnState: NNState;
}

const KatexComponent: React.FC<{ formula: string }> = ({ formula }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    try {
      // Strip $$ delimiters if present
      const cleaned = formula.replace(/^\$\$|\$\$$/g, '').trim();
      setHtml(katex.renderToString(cleaned, {
        throwOnError: false,
        displayMode: true,
      }));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setHtml(`<p class="text-red-500">Error rendering math: ${e.message}</p>`);
      } else {
        setHtml(`<p class="text-red-500">An unknown error occurred during math rendering.</p>`);
      }
    }
  }, [formula]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const Stepper: React.FC<StepperProps> = ({ step, stepIndex, totalSteps, onNext, onPrev, nnState }) => {
  const { result } = step.calculation(nnState);

  return (
    <section id="stepper" className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div id="explanation-container" className="space-y-4">
          <h2 className="text-2xl font-bold">Step {stepIndex + 1}: {step.title}</h2>
          <p className="text-slate-700 leading-relaxed">{step.explanation}</p>
          {step.formula && (
            <div className="math-container">
              <KatexComponent formula={step.formula} />
            </div>
          )}
        </div>
        <div id="calculation-container" className="calc-box">
          <h3 className="calc-title">Live Calculation</h3>
          <div className="calc-value" dangerouslySetInnerHTML={{ __html: result }}></div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button onClick={onPrev} disabled={stepIndex === 0} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span className="text-sm text-slate-500">Step {stepIndex + 1} / {totalSteps}</span>
        <button onClick={onNext} disabled={stepIndex === totalSteps - 1} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">Next</button>
      </div>
    </section>
  );
};

export default Stepper;
