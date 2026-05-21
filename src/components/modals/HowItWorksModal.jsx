import { useEffect } from 'react';
import styles from './HowItWorksModal.module.css';

export default function HowItWorksModal({ isOpen, onClose }) {
  // Listen for Escape key press to close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={styles.title}>How CLARA Works</h3>
          </div>
          <button 
            onClick={onClose}
            className={styles.closeBtn}
            type="button"
          >
            ✕
          </button>
        </header>

        {/* Content sections */}
        <div className={styles.content}>
          {/* Section 1 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>AI Model</h4>
            <p>CLARA uses Claude Sonnet 3.5 by Anthropic, a large language model with strong reasoning capabilities and deep knowledge of cybersecurity patterns and attack techniques.</p>
          </div>

          {/* Section 2 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>How analysis works</h4>
            <p>Your log is sent to a serverless function running on Vercel. The function constructs a structured prompt instructing the model to act as a threat intelligence analyst and return a strict JSON object containing findings, severity classifications, MITRE ATT&CK mappings, and remediation steps.</p>
          </div>

          {/* Section 3 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>API security</h4>
            <p>Your Anthropic API key is stored as a server-side environment variable and never sent to the browser. All AI calls are proxied through the backend — your key is never exposed in the client bundle or network requests.</p>
          </div>

          {/* Section 4 */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Limitations</h4>
            <p>CLARA uses semantic reasoning, not signature-based detection. It can identify patterns a rule-based system might miss but may also produce false positives or miss subtle indicators. Always verify findings independently before taking action.</p>
          </div>
        </div>

        {/* Footer specifications */}
        <footer className={styles.footer}>
          Model: claude-3-5-sonnet — Max log size: 50,000 characters — Response format: structured JSON
        </footer>
      </div>
    </div>
  );
}
