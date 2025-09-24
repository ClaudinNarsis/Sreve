"use client";

import React, { useEffect, useState } from 'react';
import './SequentialFlowProgress.css';

interface SequentialFlowProgressProps {
  isActive: boolean;
  currentStep: 'trends' | 'accounts' | 'ideas' | 'critique' | null;
  progress: {
    current: number;
    total: number;
    stepName: string;
  };
  startTime: number;
}

const SequentialFlowProgress: React.FC<SequentialFlowProgressProps> = ({
  isActive,
  currentStep,
  progress,
  startTime
}) => {
  const [stepStartTime, setStepStartTime] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<number>(0);

  // Reset step timer when step changes
  useEffect(() => {
    if (currentStep && isActive) {
      setStepStartTime(Date.now());
      setStepProgress(0);
    }
  }, [currentStep, isActive]);

  // Animate step progress (30 seconds per step)
  useEffect(() => {
    if (!isActive || stepStartTime === 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - stepStartTime;
      const stepProgressPercent = Math.min((elapsed / 30000) * 100, 100); // 30 seconds
      setStepProgress(stepProgressPercent);
    }, 100);

    return () => clearInterval(interval);
  }, [stepStartTime, isActive]);

  if (!isActive) return null;

  const steps = ['Trends', 'Accounts', 'Ideas', 'Analysis'];
  const overallProgress = ((progress.current - 1) / progress.total) * 100 + (stepProgress / progress.total);

  return (
    <div className="sequential-flow-progress">
      <div className="progress-header">
        <div className="progress-title">
          <span className="progress-icon">⚡</span>
          {progress.stepName}
        </div>
        
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* <div className="progress-steps-minimal">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`step-dot ${index < progress.current ? 'completed' : index === progress.current - 1 ? 'active' : 'pending'}`}
          >
            {index < progress.current - 1 ? '✓' : index === progress.current - 1 ? '●' : '○'}
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default SequentialFlowProgress;