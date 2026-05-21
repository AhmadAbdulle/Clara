import { useState, useEffect } from 'react';
import SplashScreen from './splash/SplashScreen';
import Sidebar from './layout/Sidebar';
import CenterPanel from './layout/CenterPanel';
import FindingsPanel from './findings/FindingsPanel';
import SessionsDrawer from './modals/SessionsDrawer';
import Tour from './modals/Tour';
import CommandPalette from './modals/CommandPalette';
import HowItWorksModal from './modals/HowItWorksModal';
import AttackTimeline from './timeline/AttackTimeline';
import Toast from './shared/Toast';

import useSession from '../hooks/useSession';
import useAnalysis from '../hooks/useAnalysis';
import useChat from '../hooks/useChat';

import { sampleLogs } from '../utils/sampleLogs';
import { exportFindingsReport, exportChatTranscript } from '../utils/pdfExport';
import { exportSOCReport } from '../utils/socReport';

export default function Dashboard() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('clara_splash_shown');
  });

  // Session & History Custom Hook
  const {
    sessions,
    setSessions,
    currentSessionId,
    activeSession,
    handleSelectSession,
    handleNewSession,
    handleRenameSession,
    handleDeleteSession,
    setLogText
  } = useSession();

  // Toast notifications State
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Analysis Custom Hook
  const {
    isAnalysing,
    timelineStatus,
    progressPercentage,
    milestoneText,
    estimatedTime,
    handleAnalyse,
    handleCancelAnalyse,
    analysesCount
  } = useAnalysis({
    activeSession,
    setSessions,
    showToast
  });

  // Chat custom hook
  const {
    isChatLoading,
    handleSendChatMessage
  } = useChat({
    activeSession,
    setSessions,
    showToast
  });

  // Modal open states
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [attackTimelineOpen, setAttackTimelineOpen] = useState(false);

  // Attack timeline floating window layout state
  const [timelineWindowState, setTimelineWindowState] = useState({
    x: null,
    y: null,
    width: 720,
    height: 520,
    isMinimized: false,
    isMaximized: false,
    preMinimizedSize: null,
    preMaximizedState: null
  });

  // Keyboard shortcut listener for Command Palette (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body/html scroll when mounted on the app dashboard route
  useEffect(() => {
    document.documentElement.classList.add('app-route-active');
    document.body.classList.add('app-route-active');
    return () => {
      document.documentElement.classList.remove('app-route-active');
      document.body.classList.remove('app-route-active');
    };
  }, []);

  // Actions dispatcher mapping for Command Palette entries
  const commandPaletteActions = {
    analyse: () => {
      if (!activeSession.logText.trim()) {
        showToast('Please paste or upload a log file first', 'error');
        return;
      }
      handleAnalyse();
    },
    upload: () => {
      document.querySelector('input[type="file"]')?.click();
    },
    'preset-brute': () => {
      setLogText(sampleLogs.bruteForce);
      showToast('Loaded Apache Brute Force preset', 'success');
    },
    'preset-sql': () => {
      setLogText(sampleLogs.sqlInjection);
      showToast('Loaded SQL Injection Scan preset', 'success');
    },
    'preset-priv': () => {
      setLogText(sampleLogs.privilegeEscalation);
      showToast('Loaded Linux Privilege Escalation preset', 'success');
    },
    'preset-port': () => {
      setLogText(sampleLogs.portScan);
      showToast('Loaded Network Port Scan preset', 'success');
    },
    'export-pdf': () => {
      if (!activeSession.analysis) return;
      exportFindingsReport(activeSession.analysis, activeSession.logText);
    },
    'export-soc': () => {
      if (!activeSession.analysis) return;
      exportSOCReport(activeSession.analysis, activeSession.chatHistory);
    },
    'export-chat': () => {
      if (activeSession.chatHistory.length === 0) return;
      exportChatTranscript(activeSession.chatHistory, activeSession.logText);
    },
    sessions: () => {
      setSessionsOpen(true);
    },
    'how-works': () => {
      setHowItWorksOpen(true);
    },
    tour: () => {
      localStorage.removeItem('clara_tour_completed');
      setShowTour(true);
    }
  };

  return (
    <>
      {/* 1. Warm Checklist Onboarding Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
            sessionStorage.setItem('clara_splash_shown', 'true');
            if (localStorage.getItem('clara_tour_completed') !== 'true') {
              setShowTour(true);
            }
          }}
        />
      )}

      {/* 2. Main 100vh Three-Column Dashboard Grid */}
      <div className="dashboardContainer" data-tour="app-container">
        <aside className="sidebarColumn">
          <Sidebar
            logText={activeSession.logText}
            setLogText={setLogText}
            onAnalyse={handleAnalyse}
            isAnalysing={isAnalysing}
            onToggleSessions={() => setSessionsOpen(true)}
            analysis={activeSession.analysis}
            chatHistory={activeSession.chatHistory}
            onShowToast={showToast}
            analysesCount={analysesCount}
            onOpenHowItWorks={() => setHowItWorksOpen(true)}
            progressPercentage={progressPercentage}
            milestoneText={milestoneText}
            estimatedTime={estimatedTime}
            onCancelAnalyse={handleCancelAnalyse}
          />
        </aside>

        <main className="centerColumn">
          <CenterPanel
            analysis={activeSession.analysis}
            chatHistory={activeSession.chatHistory}
            onSendMessage={handleSendChatMessage}
            isChatLoading={isChatLoading}
            isAnalysing={isAnalysing}
          />
        </main>

        <section className="rightColumn">
          <FindingsPanel
            analysis={activeSession.analysis}
            isAnalysing={isAnalysing}
            onOpenAttackTimeline={() => setAttackTimelineOpen(true)}
            timelineStatus={timelineStatus}
          />
        </section>
      </div>

      {/* 3. Sliding Session History Drawer */}
      {sessionsOpen && (
        <SessionsDrawer
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setSessionsOpen(false)}
        />
      )}

      {/* 4. Onboarding Tour Modal */}
      {showTour && (
        <Tour onComplete={() => setShowTour(false)} />
      )}

      {/* 5. Command Palette Dialog */}
      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          actions={commandPaletteActions}
        />
      )}

      {/* 6. How it works Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

      {/* 7. Floating Timeline Reconstruction Window */}
      <AttackTimeline
        isOpen={attackTimelineOpen}
        onClose={() => setAttackTimelineOpen(false)}
        timeline={activeSession.analysis?.attackTimeline}
        windowState={timelineWindowState}
        setWindowState={setTimelineWindowState}
      />

      {/* 8. Toast Notifications overlay */}
      <Toast
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </>
  );
}
