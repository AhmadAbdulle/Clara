import { useState } from 'react';
import styles from './SessionsDrawer.module.css';

// Get highest severity color for session status dot
const getHighestSeverityColor = (analysis) => {
  if (!analysis || !analysis.findings || analysis.findings.length === 0) {
    return 'var(--text-muted)'; // Gray
  }
  const severities = analysis.findings.map(f => f.severity?.toLowerCase());
  if (severities.includes('critical')) return 'var(--critical)';
  if (severities.includes('high')) return 'var(--high)';
  if (severities.includes('medium')) return 'var(--medium)';
  return 'var(--low)';
};

export default function SessionsDrawer({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onClose
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [tempName, setTempName] = useState('');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startRename = (e, session) => {
    e.stopPropagation(); // Avoid triggering select session
    setRenamingId(session.id);
    setTempName(session.name);
  };

  const saveRename = (id) => {
    if (tempName.trim()) {
      onRenameSession(id, tempName.trim());
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      saveRename(id);
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Investigations</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          className={styles.newSessionBtn}
          onClick={() => {
            onNewSession();
            onClose(); // Close drawer to focus new session
          }}
          type="button"
        >
          + New Investigation
        </button>

        <div className={styles.sessionList}>
          {sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const dotColor = getHighestSeverityColor(session.analysis);

            return (
              <div
                key={session.id}
                className={`${styles.sessionItem} ${isActive ? styles.activeSessionItem : ''}`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
              >
                <div className={styles.itemHeader}>
                  <div className={styles.dotLabelRow}>
                    <span
                      className={styles.severityDot}
                      style={{ backgroundColor: dotColor }}
                      title={`Highest Severity Indicator`}
                    />
                    
                    {renamingId === session.id ? (
                      <input
                        className={styles.nameInput}
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={() => saveRename(session.id)}
                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()} // Prevent select session
                      />
                    ) : (
                      <span className={styles.nameText} title={session.name}>
                        {session.name}
                      </span>
                    )}
                  </div>

                  {renamingId !== session.id && (
                    <button
                      className={styles.editBtn}
                      onClick={(e) => startRename(e, session)}
                      title="Rename Session"
                      type="button"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className={styles.itemFooter}>
                  <span>{new Date(session.createdAt).toLocaleTimeString()}</span>
                  
                  {sessions.length > 1 && (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete Session"
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
