import styles from './FindingCard.module.css';

export default function FindingCard({
  finding,
  isExpanded,
  onToggle,
  onCopy,
  copied
}) {
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#e74c3c';
      case 'High': return '#e67e22';
      case 'Medium': return '#f1c40f';
      case 'Low': return '#3498db';
      default: return 'var(--text-muted)';
    }
  };

  const handleCardClick = () => {
    onToggle();
  };

  const handleCopyClick = (e) => {
    e.stopPropagation();
    onCopy(finding.evidenceLine || finding.evidence);
  };

  const evidence = finding.evidenceLine || finding.evidence;

  return (
    <div 
      className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleCardClick}
    >
      <div className={styles.header}>
        <span 
          className={styles.severityDot} 
          style={{ backgroundColor: getSeverityColor(finding.severity) }}
        />
        <span className={styles.title}>{finding.title}</span>
        {finding.mitreTechniqueId && (
          <span className={styles.mitreId}>{finding.mitreTechniqueId}</span>
        )}
        <svg 
          className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`} 
          width="14" 
          height="14" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div 
          className={styles.content}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.description}>{finding.description}</p>
          
          {evidence && (
            <div className={styles.evidenceBlock}>
              <div className={styles.evidenceText}>
                <code>{evidence}</code>
              </div>
              <button
                className={styles.copyBtn}
                onClick={handleCopyClick}
                type="button"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-9-4h.01M5 16h.01" />
                </svg>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          )}

          {finding.remediation && (
            <div className={styles.remediation}>
              <svg className={styles.remediationIcon} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                <strong>Remediation:</strong> {finding.remediation}
              </span>
            </div>
          )}

          <div className={styles.disclaimer}>
            <svg className={styles.disclaimerIcon} width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI-generated analysis — always verify findings independently before taking action</span>
          </div>
        </div>
      )}
    </div>
  );
}
