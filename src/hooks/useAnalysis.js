import { useState, useEffect } from 'react';

export default function useAnalysis({ activeSession, setSessions, showToast }) {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [milestoneText, setMilestoneText] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(18);
  const [timelineStatus, setTimelineStatus] = useState('ready');
  const [abortController, setAbortController] = useState(null);
  const [analysesCount, setAnalysesCount] = useState(() => {
    return parseInt(sessionStorage.getItem('clara_session_analyses_count') || '0', 10);
  });

  const triggerPhase2 = async (rawLog, phase1Data, signal, sessionId) => {
    setTimelineStatus('loading');
    const findingsTitles = (phase1Data.findings || []).map(f => f.title);
    
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log: rawLog,
          summary: phase1Data.summary,
          findingsTitles
        }),
        signal
      });

      if (!res.ok) {
        throw new Error('Timeline generation failed');
      }

      const timelineData = await res.json();

      setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId && s.analysis) {
          return {
            ...s,
            analysis: {
              ...s.analysis,
              timeline: timelineData.timeline || [],
              attackTimeline: timelineData.attackTimeline || []
            }
          };
        }
        return s;
      }));

      setTimelineStatus('ready');
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Phase 2 aborted');
      } else {
        console.error(err);
        setTimelineStatus('error');
      }
    }
  };

  const handleCancelAnalyse = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsAnalysing(false);
    setTimelineStatus('ready');
    setProgressPercentage(0);
    setMilestoneText('');
    setEstimatedTime(18);
    showToast('Analysis cancelled', 'info');
  };

  const handleAnalyse = async () => {
    if (!activeSession || isAnalysing) return;

    const logText = activeSession.logText || '';
    if (!logText.trim()) {
      showToast('Please enter a log before analysing', 'error');
      return;
    }

    setIsAnalysing(true);
    setTimelineStatus('loading');
    setProgressPercentage(0);
    setMilestoneText('Parsing log format...');
    setEstimatedTime(18);

    if (abortController) {
      abortController.abort();
    }
    const controller = new AbortController();
    setAbortController(controller);

    const initialAiMessage = {
      role: 'assistant',
      content: 'Analysing your log now. I will have findings ready shortly...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: 'initial-ai-greeting'
    };

    const sessionId = activeSession.id;

    setSessions(prevSessions => prevSessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          analysis: null,
          chatHistory: [initialAiMessage]
        };
      }
      return s;
    }));

    let elapsedSeconds = 0;
    const progressInterval = setInterval(() => {
      elapsedSeconds += 1;
      const progressVal = Math.min((elapsedSeconds / 18) * 85, 85);
      setProgressPercentage(progressVal);
      setEstimatedTime(prev => Math.max(prev - 1, 0));

      const milestones = [
        "Parsing log format...",
        "Detecting attack patterns...",
        "Identifying suspicious IPs...",
        "Mapping to MITRE ATT&CK...",
        "Scoring risk level...",
        "Finalising report..."
      ];
      const idx = Math.floor(elapsedSeconds / 3) % milestones.length;
      const prefix = elapsedSeconds >= 18 ? "Still working... " : "";
      setMilestoneText(prefix + milestones[idx]);
    }, 1000);

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: activeSession.logText }),
        signal: controller.signal
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to complete threat analysis.');
      }

      const data = await res.json();
      setProgressPercentage(100);

      setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            analysis: data
          };
        }
        return s;
      }));

      const newCount = analysesCount + 1;
      setAnalysesCount(newCount);
      sessionStorage.setItem('clara_session_analyses_count', newCount.toString());
      showToast('Analysis completed successfully!', 'success');
      setIsAnalysing(false);

      triggerPhase2(activeSession.logText, data, controller.signal, sessionId);
    } catch (err) {
      clearInterval(progressInterval);
      if (err.name === 'AbortError') {
        console.log('Phase 1 aborted');
      } else {
        console.error(err);
        setIsAnalysing(false);
        setTimelineStatus('error');
        showToast(err.message || 'Analysis failed', 'error');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    isAnalysing,
    progressPercentage,
    milestoneText,
    estimatedTime,
    timelineStatus,
    analysesCount,
    handleAnalyse,
    handleCancelAnalyse
  };
}
