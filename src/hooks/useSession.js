import { useState } from 'react';

export default function useSession() {
  const [sessions, setSessions] = useState(() => [
    {
      id: 'session-1',
      name: 'Session 1',
      logText: '',
      analysis: null,
      chatHistory: [],
      createdAt: Date.now()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('session-1');

  const activeSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleSelectSession = (id) => {
    setCurrentSessionId(id);
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newName = `Session ${sessions.length + 1}`;
    const newSess = {
      id: newId,
      name: newName,
      logText: '',
      analysis: null,
      chatHistory: [],
      createdAt: Date.now()
    };
    setSessions([...sessions, newSess]);
    setCurrentSessionId(newId);
  };

  const handleRenameSession = (id, newName) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleDeleteSession = (id) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const setLogText = (text) => {
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, logText: text } : s));
  };

  return {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    activeSession,
    handleSelectSession,
    handleNewSession,
    handleRenameSession,
    handleDeleteSession,
    setLogText
  };
}
