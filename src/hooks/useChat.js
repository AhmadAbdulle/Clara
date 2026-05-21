import { useState } from 'react';

export default function useChat(activeSession, setSessions, showToast) {
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChatMessage = async (text) => {
    if (!activeSession || !text.trim() || isChatLoading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: `user-${Date.now()}`
    };

    const updatedHistory = [...(activeSession.chatHistory || []), userMsg];
    const sessionId = activeSession.id;

    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          chatHistory: updatedHistory
        };
      }
      return s;
    }));

    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log: activeSession.logText,
          history: updatedHistory,
          findings: activeSession.analysis?.findings || []
        })
      });

      if (!res.ok) {
        throw new Error('Analyst response failed');
      }

      const chatRes = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: chatRes.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: `ai-${Date.now()}`
      };

      setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            chatHistory: [...updatedHistory, assistantMsg]
          };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
      showToast(`Analyst Chat Failed: ${err.message}`, 'error');
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    isChatLoading,
    handleSendChatMessage
  };
}
