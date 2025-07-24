"use client";

import { useState } from 'react';
import ClientOnly from '@/components/ClientOnly';
import NeuralNetworkDiagram from "@/components/NeuralNetworkDiagram";
import Stepper from "@/components/Stepper";
import SummaryChart from "@/components/SummaryChart";
import { steps } from '@/lib/steps';
import { INITIAL_STATE } from '@/lib/constants';
import { NNState } from '@/types';

export default function Home() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nnState, setNnState] = useState<NNState>(INITIAL_STATE);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      const { newState } = nextStep.calculation(nnState);
      setNnState(newState);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      // This is a simplified version. A more robust implementation would re-calculate previous states.
      // For now, we just go back to the previous step's view without reverting the state change.
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Interactive Backpropagation</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">An interactive, step-by-step walkthrough of how a neural network learns.</p>
      </header>

      <main className="space-y-12">
        <ClientOnly>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NeuralNetworkDiagram nnState={nnState} highlight={currentStep.highlight} />
            <Stepper 
              step={currentStep} 
              stepIndex={currentStepIndex} 
              totalSteps={steps.length} 
              onNext={handleNext} 
              onPrev={handlePrev} 
              nnState={nnState}
            />
          </div>
          <SummaryChart nnState={nnState} />
        </ClientOnly>
      </main>
    </div>
  );
}
