import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import styles from './ChatPanel.module.css';

export default function ChatPanel({
  analysis,
  chatHistory = [],
  onSendMessage,
  isChatLoading,
  isAnalysing
}) {
  const [inputVal, setInputVal] = useState('');
  const threadEndRef = useRef(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isChatLoading || isAnalysing) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  const isSessionActive = !!analysis;

  return (
    <div className={styles.container} data-tour="chat-panel">
      {!isSessionActive ? (
        <div className={styles.emptyState}>
          <img 
            src="/logo.png" 
            alt="CLARA Logo" 
            className={styles.emptyLogo} 
          />
          <h2 className={styles.emptyTitle}>Cyber Log Analysis and Response Assistant</h2>
          <p className={styles.emptySubtitle}>
            Paste a raw log file and click "Analyse Threat" or choose a sample scenario from the presets in the left panel to begin.
          </p>
        </div>
      ) : (
        <div className={styles.threadArea}>
          <ChatMessage
            role="assistant"
            isInitialAnalysis={true}
            analysis={analysis}
            timestamp="System Init"
          />

          {chatHistory.map((msg, i) => (
            <ChatMessage
              key={msg.id || i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {isChatLoading && (
            <ChatMessage
              role="assistant"
              isTyping={true}
            />
          )}
          <div ref={threadEndRef} />
        </div>
      )}

      <footer className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            className={styles.chatInput}
            type="text"
            placeholder={
              isAnalysing
                ? "Analysis in progress, chat disabled..."
                : isSessionActive 
                  ? "Ask follow-up questions..." 
                  : "Please load and analyse a log to begin..."
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={!isSessionActive || isChatLoading || isAnalysing}
          />
          <button
            className={styles.sendBtn}
            type="submit"
            disabled={!isSessionActive || isChatLoading || isAnalysing || !inputVal.trim()}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
