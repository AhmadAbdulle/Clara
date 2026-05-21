import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

const getSystemInfo = () => {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';

  let browser = 'Unknown Browser';
  if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

  return `${browser} on ${os}`;
};

const getResolutionInfo = () => {
  if (typeof window === 'undefined') return '';
  return `${window.screen.width}x${window.screen.height}`;
};

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [splashFading, setSplashFading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [systemInfo] = useState(() => getSystemInfo());
  const [resolutionInfo] = useState(() => getResolutionInfo());

  const [checklistStatus, setChecklistStatus] = useState([
    'loading',
    'hidden',
    'hidden',
    'hidden',
    'hidden',
    'hidden',
  ]);

  const checklistItems = [
    'Initialising threat detection engine...',
    'Loading MITRE ATT&CK framework...',
    'Connecting to analyst model...',
    'Calibrating log parser...',
    'Securing API endpoints...',
    'CLARA ready.',
  ];

  useEffect(() => {
    // B. Clock ticking
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    // C. 3-Second Progress Bar
    const startTime = Date.now();
    const duration = 3000;
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressTimer);
      }
    }, 30);

    // D. Sequenced Checklist ticking
    const stepDuration = 450;
    let currentStep = 0;

    const checklistTimer = setInterval(() => {
      setChecklistStatus((prev) => {
        const next = [...prev];
        next[currentStep] = 'done';
        if (currentStep < 5) {
          next[currentStep + 1] = 'loading';
        }
        return next;
      });

      currentStep++;

      if (currentStep >= 6) {
        clearInterval(checklistTimer);
        setTimeout(() => {
          setSplashFading(true);
          setTimeout(() => {
            onComplete();
          }, 500);
        }, 300);
      }
    }, stepDuration);

    return () => {
      clearInterval(clockTimer);
      clearInterval(progressTimer);
      clearInterval(checklistTimer);
    };
  }, [onComplete]);

  return (
    <div className={`${styles.splashContainer} ${splashFading ? styles.fading : ''}`}>
      <div className={styles.splashContent}>
        <img
          src="/logo.png"
          alt="CLARA Logo"
          className={styles.logo}
        />

        <h1 className={styles.title}>C.L.A.R.A</h1>

        <p className={styles.subtitle}>
          Cyber Log Analysis and Response Assistant
        </p>

        <div className={styles.infoBlock}>
          <div>TIME: {currentTime}</div>
          <div>HOST: {systemInfo}</div>
          <div>DISP: {resolutionInfo}</div>
        </div>

        <div className={styles.checklist}>
          {checklistItems.map((item, idx) => {
            const status = checklistStatus[idx];
            if (status === 'hidden') return null;

            return (
              <div
                key={idx}
                className={`${styles.checklistItem} ${status === 'loading' ? styles.pulseItem : ''}`}
              >
                {status === 'done' ? (
                  <span className={styles.checkIcon}>✓</span>
                ) : (
                  <span className={styles.spinnerIcon}></span>
                )}
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.progressBarBg}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
