import styles from './ChatMessage.module.css';

export default function ChatMessage({
  role,
  content,
  timestamp,
  analysis,
  isInitialAnalysis = false,
  isTyping = false
}) {
  const isUser = role === 'user';

  if (isTyping) {
    return (
      <div className={`${styles.messageRow} ${styles.rowAssistant}`}>
        <span className={`${styles.metaLabel} ${styles.metaLabelAssistant}`}>CLARA</span>
        <div className={styles.bubbleTyping}>
          <div className={styles.typingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
      </div>
    );
  }

  if (isInitialAnalysis && analysis) {
    return (
      <div className={`${styles.messageRow} ${styles.rowAssistant}`}>
        <span className={`${styles.metaLabel} ${styles.metaLabelAssistant}`}>CLARA</span>
        <div className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.reportBubble}`}>
          <h4 className={styles.reportTitle}>Threat Analysis Report</h4>
          <p className={styles.reportSummary}>{analysis.summary}</p>
          <div className={styles.reportFooter}>
            Risk Score: <strong>{analysis.riskScore}/100</strong> • findings: <strong>{analysis.findings?.length || 0}</strong>. Consult the right panel for raw findings or ask follow-up questions here.
          </div>
        </div>
        <span className={styles.timestamp}>{timestamp || 'System Init'}</span>
      </div>
    );
  }

  // Format simple markdown lists/headers if present in the text response
  const renderFormattedContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (line.startsWith('##')) {
        return <h5 key={index} className={styles.heading}>{line.replace(/^##\s*/, '')}</h5>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className={styles.listItem}>{line.substring(2)}</li>;
      }
      return <p key={index} className={styles.paragraph}>{line}</p>;
    });
  };

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      <span className={`${styles.metaLabel} ${isUser ? styles.metaLabelUser : styles.metaLabelAssistant}`}>
        {isUser ? 'Investigator' : 'CLARA'}
      </span>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {isUser ? content : renderFormattedContent(content)}
      </div>
      <span className={styles.timestamp}>{timestamp || 'Active'}</span>
    </div>
  );
}
