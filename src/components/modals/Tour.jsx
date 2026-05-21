import { useState, useEffect } from 'react';
import styles from './Tour.module.css';

const steps = [
  {
    selector: '[data-tour="log-input"]',
    title: 'Log input area',
    description: 'Paste any log file here or upload a .txt or .log file to begin your investigation',
    position: 'right'
  },
  {
    selector: '[data-tour="presets"]',
    title: 'Sample scenarios',
    description: 'New to CLARA? Load a pre-built attack scenario to see the analysis in action',
    position: 'right'
  },
  {
    selector: '[data-tour="analyse-btn"]',
    title: 'Analyse button',
    description: 'Hit Analyse to run AI-powered threat detection on your log',
    position: 'right'
  },
  {
    selector: '[data-tour="right-panel"]',
    title: 'Right panel',
    description: 'Your findings, risk score, and timeline will appear here after analysis',
    position: 'left'
  },
  {
    selector: '[data-tour="chat-panel"]',
    title: 'Chat panel',
    description: 'Ask the AI analyst anything about your log in plain English here',
    position: 'right-inside'
  },
  {
    selector: '[data-tour="export-controls"]',
    title: 'Export controls',
    description: 'Export a full PDF report, SOC incident report, or chat transcript when you are done',
    position: 'right'
  },
  {
    selector: '[data-tour="app-container"]',
    title: 'Command palette',
    description: 'Press Cmd+K or Ctrl+K at any time to access all commands quickly',
    position: 'center'
  }
];

export default function Tour({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({ display: 'none' });
  const [tooltipStyle, setTooltipStyle] = useState({ display: 'none' });

  const activeStep = steps[currentStepIndex];

  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (!activeStep) return;

      let el = document.querySelector(activeStep.selector);
      if (!el) {
        // Fallback if element not found/rendered
        if (activeStep.position === 'center') {
          setHighlightStyle({ display: 'none' });
          setTooltipStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'block'
          });
        }
        return;
      }

      const rect = el.getBoundingClientRect();
      const padding = 6;

      // Position the highlight mask
      setHighlightStyle({
        top: `${rect.top - padding}px`,
        left: `${rect.left - padding}px`,
        width: `${rect.width + padding * 2}px`,
        height: `${rect.height + padding * 2}px`,
        display: 'block'
      });

      // Calculate tooltip position
      let top;
      let left;
      let transform = 'none';

      if (activeStep.position === 'right') {
        top = rect.top;
        left = rect.right + 20;
      } else if (activeStep.position === 'left') {
        top = rect.top;
        left = rect.left - 300; // width of tooltip (280) + margin (20)
      } else if (activeStep.position === 'right-inside') {
        top = rect.top + 40;
        left = rect.left + 40;
      } else if (activeStep.position === 'center') {
        top = window.innerHeight / 2 - 100;
        left = window.innerWidth / 2 - 140;
      } else {
        top = rect.bottom + 20;
        left = rect.left;
      }

      // Constrain inside window boundaries
      left = Math.max(20, Math.min(left, window.innerWidth - 300));
      top = Math.max(20, Math.min(top, window.innerHeight - 250));

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform,
        display: 'block'
      });
    };

    // Delay slightly to allow layout calculations to complete
    const timeout = setTimeout(handleResizeOrScroll, 100);

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [currentStepIndex, activeStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      localStorage.setItem('clara_tour_completed', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('clara_tour_completed', 'true');
    onComplete();
  };

  return (
    <>
      {/* Backdrop overlay cutout */}
      <div className={styles.highlightMask} style={highlightStyle} />

      {/* Tooltip Card */}
      <div className={styles.tooltip} style={tooltipStyle}>
        <header className={styles.tooltipHeader}>
          <span className={styles.stepCounter}>
            {currentStepIndex + 1} of {steps.length}
          </span>
          <button className={styles.skipBtn} onClick={handleSkip} type="button">
            Skip
          </button>
        </header>
        <div className={styles.content}>
          <h4 className={styles.title}>{activeStep.title}</h4>
          <p className={styles.description}>
            {activeStep.description}
          </p>
        </div>
        <footer className={styles.actions}>
          <div>
            {currentStepIndex > 0 && (
              <button className={styles.btn} onClick={handleBack} type="button">
                Back
              </button>
            )}
          </div>
          <div className={styles.navBtnRow}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`} 
              onClick={handleNext}
              type="button"
            >
              {currentStepIndex === steps.length - 1 ? 'Got it' : 'Next'}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
