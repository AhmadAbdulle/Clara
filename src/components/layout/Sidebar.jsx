import { useState, useRef, useEffect } from 'react';
import { sampleLogs } from '../../utils/sampleLogs';
import { exportFindingsReport, exportChatTranscript } from '../../utils/pdfExport';
import { exportSOCReport } from '../../utils/socReport';
import styles from './Sidebar.module.css';

export default function Sidebar({
  logText,
  setLogText,
  onAnalyse,
  isAnalysing,
  onToggleSessions,
  analysis,
  chatHistory,
  onShowToast,
  analysesCount,
  onOpenHowItWorks,
  progressPercentage,
  milestoneText,
  estimatedTime,
  onCancelAnalyse
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      let content = evt.target.result;
      if (content.length >= 50000) {
        content = content.substring(0, 50000);
        onShowToast('Maximum log size reached', 'error');
      }
      setLogText(content);
      setShowWarning(false);
    };
    reader.readAsText(file);
  };

  const selectPreset = (key) => {
    setLogText(sampleLogs[key] || '');
    setDropdownOpen(false);
    setShowWarning(false);
  };

  const handleTextChange = (e) => {
    let val = e.target.value;
    if (val.length >= 50000) {
      val = val.substring(0, 50000);
      onShowToast('Maximum log size reached', 'error');
    }
    setLogText(val);
    if (showWarning) {
      setShowWarning(false);
    }
  };

  // Heuristic checker for standard log formats
  const validateLogFormat = (text) => {
    if (!text.trim()) return false;
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const dateRegex = /\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b|\b\d{2}:\d{2}:\d{2}\b/;
    const httpMethodRegex = /\b(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\b/;
    const authKeywordRegex = /\b(login|failed|success|auth|sshd|password|session|refused|accepted)\b/i;

    const lines = text.split('\n');
    let matchCount = 0;
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const line = lines[i];
      if (ipRegex.test(line) || dateRegex.test(line) || httpMethodRegex.test(line) || authKeywordRegex.test(line)) {
        matchCount++;
      }
    }
    return matchCount > 0;
  };

  const handleAnalyseClick = () => {
    if (!logText.trim()) {
      onShowToast('Please paste or upload a log file first', 'error');
      return;
    }
    
    // Check log format
    if (!validateLogFormat(logText)) {
      setShowWarning(true);
      return;
    }

    onAnalyse();
  };

  const handleForceAnalyse = () => {
    setShowWarning(false);
    onAnalyse();
  };

  const isExportDisabled = isAnalysing || !analysis;
  const charLength = logText.length;

  return (
    <div className={styles.container}>
      {/* App Identity Anchor */}
      <div className={styles.identityAnchor}>
        <img 
          src="/logo.png" 
          alt="CLARA Logo" 
          className={styles.logoImage} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span className={styles.appName}>CLARA</span>
      </div>

      <hr className={styles.divider} style={{ marginTop: 0 }} />

      {/* 1. INVESTIGATION SECTION */}
      <div className={styles.sectionLabel}>Investigation</div>
      <div className={styles.inputWrapper}>
        <div className={styles.textareaWrapper} data-tour="log-input">
          <textarea
            className={styles.textarea}
            placeholder="Paste raw log output here..."
            value={logText}
            onChange={handleTextChange}
            disabled={isAnalysing}
          />
          {/* Character counter */}
          <div 
            className={`${styles.charCounter} ${
              charLength > 48000 ? styles.charCounterRed :
              charLength > 40000 ? styles.charCounterAmber : ''
            }`}
          >
            {charLength.toLocaleString()} / 50,000 characters
          </div>
        </div>

        <div className={styles.fileActions}>
          <button
            className={styles.actionBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalysing}
            type="button"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Log
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.log"
            className={styles.hiddenInput}
          />

          <div className={styles.presetsWrapper} ref={dropdownRef} data-tour="presets">
            <button
              className={`${styles.actionBtn} ${styles.dropdownBtn}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isAnalysing}
              type="button"
            >
              Presets
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => selectPreset('bruteForce')}
                >
                  Apache Brute Force
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => selectPreset('sqlInjection')}
                >
                  SQL Injection Scan
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => selectPreset('privilegeEscalation')}
                >
                  Linux Privilege Escalation
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => selectPreset('portScan')}
                >
                  Network Port Scan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className={styles.warningBanner}>
            <div className={styles.warningText}>
              This does not look like a standard log format. Analysis may be less accurate.
            </div>
            <div className={styles.bannerActions}>
              <button 
                type="button" 
                className={`${styles.actionBtn} ${styles.bannerBtn}`}
                onClick={() => setShowWarning(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`${styles.actionBtn} ${styles.bannerBtn} ${styles.bannerBtnPrimary}`}
                onClick={handleForceAnalyse}
              >
                Analyse anyway
              </button>
            </div>
          </div>
        )}

        <button
          className={styles.analyseBtn}
          onClick={handleAnalyseClick}
          disabled={isAnalysing}
          type="button"
          data-tour="analyse-btn"
        >
          {isAnalysing ? (
            <>
              <span className={styles.spinner}></span>
              Analising...
            </>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 012 2" />
              </svg>
              Analyse Threat
            </>
          )}
        </button>

        {/* Progress bar container */}
        {isAnalysing && (
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>
              <span className={styles.milestoneText}>{milestoneText}</span>
              <span className={styles.estimatedTime}>Estimated: ~{estimatedTime}s</span>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarBg}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onCancelAnalyse}
                title="Cancel analysis"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Rate Limiting session indicator */}
        <div className={styles.rateLimitText}>
          Analyses this session: {analysesCount}
        </div>
      </div>

      <hr className={styles.divider} />

      {/* 2. SESSION SECTION */}
      <div className={styles.sectionLabel}>Session</div>
      <div className={styles.sessionWrapper}>
        <button
          className={styles.sessionBtn}
          onClick={onToggleSessions}
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Saved Investigations
        </button>
      </div>

      <hr className={styles.divider} />

      {/* 3. EXPORT SECTION */}
      <div className={styles.sectionLabel}>Export</div>
      
      {/* How this works modal trigger */}
      <div style={{ padding: '0 20px', marginBottom: '8px' }}>
        <button
          className={styles.infoBtn}
          onClick={onOpenHowItWorks}
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How this works
        </button>
      </div>

      <div className={styles.exportWrapper} data-tour="export-controls">
        <button
          className={styles.exportBtn}
          disabled={isExportDisabled}
          onClick={() => exportFindingsReport(analysis)}
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Findings PDF
        </button>

        <button
          className={styles.exportBtn}
          disabled={isExportDisabled}
          onClick={() => exportSOCReport(analysis, chatHistory)}
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          SOC Incident Report
        </button>

        <button
          className={styles.exportBtn}
          disabled={isExportDisabled || chatHistory.length === 0}
          onClick={() => exportChatTranscript(chatHistory, logText)}
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat Transcript
        </button>
      </div>

      {/* GitHub & Built-by credit footer */}
      <footer className={styles.sidebarFooter}>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.githubLink}
          title="GitHub Repository"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <div className={styles.footerCredit}>Built by Ahmad</div>
      </footer>
    </div>
  );
}
