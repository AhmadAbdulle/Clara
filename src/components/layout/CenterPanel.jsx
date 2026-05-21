import ChatPanel from '../chat/ChatPanel';
import styles from './CenterPanel.module.css';

export default function CenterPanel({
  analysis,
  chatHistory,
  onSendMessage,
  isChatLoading,
  isAnalysing
}) {
  return (
    <div className={styles.centerContainer}>
      <header className={styles.header}>
        <div className={styles.logoTitle}>
          <img src="/logo.png" alt="CLARA Logo" className={styles.logo} />
          <span className={styles.title}>CLARA</span>
        </div>
        <div className={styles.badge}>ANALYST INTERACTION</div>
      </header>

      <div className={styles.chatWrapper}>
        <ChatPanel
          analysis={analysis}
          chatHistory={chatHistory}
          onSendMessage={onSendMessage}
          isChatLoading={isChatLoading}
          isAnalysing={isAnalysing}
        />
      </div>
    </div>
  );
}
