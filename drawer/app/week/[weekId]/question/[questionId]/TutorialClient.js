'use client';

// Deliberately calm, per the spec: simple fade only, no parallax, no
// cursor effects, no heavy motion. Someone following a precise drafting
// procedure is hurt by flashy motion here, not helped by it — this is
// the one place in the site where restraint matters more than flair.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { renderMarkdown } from '../../../../../lib/markdown';

export default function TutorialClient({ weekId, weekTitle, questionTitle, steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentStep(index);
      return;
    }
    setVisible(false);
    window.setTimeout(() => {
      setCurrentStep(index);
      setVisible(true);
    }, 180);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') goToStep(currentStep + 1);
      if (e.key === 'ArrowLeft') goToStep(currentStep - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentStep]);

  return (
    <div className="tutorial-page">
      <div className="tutorial-inner">
        <p className="tutorial-crumb">
          <Link href={`/week/${weekId}`}>{weekTitle}</Link>
        </p>
        <h1 className="tutorial-title">{questionTitle}</h1>
        <p className="tutorial-step-indicator">
          Step {currentStep + 1} of {steps.length}
        </p>

        <div className={`tutorial-step ${visible ? 'is-visible' : ''}`}>
          {step.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step.image} alt="" className="tutorial-step-image" />
          )}
          <div className="tutorial-step-text">
            {step.text ? renderMarkdown(step.text) : <p>Step text not added yet.</p>}
          </div>
        </div>

        <div className="tutorial-nav">
          <button type="button" className="tutorial-nav-btn" onClick={() => goToStep(currentStep - 1)} disabled={isFirst}>
            <span aria-hidden="true">←</span>
            <span className="btn-label">Previous</span>
          </button>
          <button type="button" className="tutorial-nav-btn" onClick={() => goToStep(currentStep + 1)} disabled={isLast}>
            <span className="btn-label">Next</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
