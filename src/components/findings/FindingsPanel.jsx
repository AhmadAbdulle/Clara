import { useState, useEffect } from 'react';
import FindingCard from './FindingCard';
import { FindingsSkeleton } from '../shared/Skeleton';
import styles from './FindingsPanel.module.css';

export default function FindingsPanel({ 
  analysis, 
  isAnalysing, 
  onOpenAttackTimeline, 
  timelineStatus,
  showToast
}) {
  const [ipFilter, setIpFilter] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [animateOffset, setAnimateOffset] = useState(314);

  // Search and filter states
  const [searchVal, setSearchVal] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Animate SVG ring on load/new analysis
  useEffect(() => {
    if (!isAnalysing && analysis) {
      const timer = setTimeout(() => {
        const score = analysis.riskScore || 0;
        const offset = 314 - (314 * score) / 100;
        setAnimateOffset(offset);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [analysis, isAnalysing]);

  if (isAnalysing) {
    return (
      <div className={styles.container} data-tour="right-panel">
        <FindingsSkeleton />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={styles.container} data-tour="right-panel">
        <div className={`${styles.card} ${styles.emptyCard}`}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.emptyIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className={styles.emptyText}>No log analysis active. Load a log to review stats and security findings.</p>
        </div>
      </div>
    );
  }

  const findings = analysis.findings || [];
  const criticalCount = findings.filter(f => f.severity.toLowerCase() === 'critical').length;
  const highCount = findings.filter(f => f.severity.toLowerCase() === 'high').length;
  const mediumCount = findings.filter(f => f.severity.toLowerCase() === 'medium').length;
  const lowCount = findings.filter(f => f.severity.toLowerCase() === 'low').length;

  // Extract source IP addresses from findings
  const ipCounts = {};
  findings.forEach(f => {
    const ip = f.sourceIp || (f.evidenceLine && f.evidenceLine.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)?.[0]);
    if (ip) {
      f.sourceIp = ip;
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    }
  });
  const suspiciousIps = Object.entries(ipCounts).map(([ip, count]) => ({ ip, count }));

  // Dynamic filter pipeline: IP + Search + Severity
  const getFilteredFindings = () => {
    return findings.filter(f => {
      // 1. IP filter check
      if (ipFilter !== 'All' && f.sourceIp !== ipFilter) return false;

      // 2. Severity check
      if (severityFilter !== 'All' && f.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;

      // 3. Keyword matching check
      if (searchVal.trim()) {
        const query = searchVal.toLowerCase();
        const matchesTitle = f.title?.toLowerCase().includes(query);
        const matchesDesc = f.description?.toLowerCase().includes(query);
        const matchesMitre = (f.mitreTechniqueId || f.mitreAttackId)?.toLowerCase().includes(query);
        const matchesType = f.attackType?.toLowerCase().includes(query);
        const matchesEvidence = (f.evidenceLine || f.evidence)?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesMitre || matchesType || matchesEvidence;
      }

      return true;
    });
  };

  const filteredFindings = getFilteredFindings();

  const handleClearFilters = () => {
    setSearchVal('');
    setSeverityFilter('All');
    setIpFilter('All');
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    if (showToast) {
      showToast('Copied to clipboard!', 'success');
    }
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getRiskTooltip = (score) => {
    if (score <= 30) return `Risk Score: ${score}/100. Low risk — standard monitoring`;
    if (score <= 70) return `Risk Score: ${score}/100. Medium risk — review recommended`;
    return `Risk Score: ${score}/100. High risk — immediate investigation recommended`;
  };

  return (
    <div className={styles.container} data-tour="right-panel">
      {/* SECTION 1: RISK SCORE */}
      <div className={styles.card}>
        <div className={styles.riskContainer}>
          <div 
            className={styles.svgRingWrapper}
            title={getRiskTooltip(analysis.riskScore)}
          >
            <svg className={styles.svgRing} viewBox="0 0 120 120">
              <circle className={styles.ringBackground} cx="60" cy="60" r="50" />
              <circle 
                className={styles.ringProgress} 
                cx="60" 
                cy="60" 
                r="50"
                stroke={
                  analysis.riskScore <= 30 ? '#3498db' :
                  analysis.riskScore <= 70 ? '#f1c40f' :
                  analysis.riskScore <= 85 ? '#e67e22' : '#e74c3c'
                }
                strokeDasharray="314"
                strokeDashoffset={animateOffset}
              />
            </svg>
            <div className={styles.riskValue}>
              {analysis.riskScore}
              <span className={styles.riskSubtext}>Risk Score</span>
            </div>
          </div>

          <div className={styles.severityRow}>
            <span className={`${styles.severityBadge} ${styles.criticalBadge}`}>
              Critical: <strong>{criticalCount}</strong>
            </span>
            <span className={`${styles.severityBadge} ${styles.highBadge}`}>
              High: <strong>{highCount}</strong>
            </span>
            <span className={`${styles.severityBadge} ${styles.mediumBadge}`}>
              Medium: <strong>{mediumCount}</strong>
            </span>
            <span className={`${styles.severityBadge} ${styles.lowBadge}`}>
              Low: <strong>{lowCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUSPICIOUS IPs */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>Suspicious IPs</div>
        {suspiciousIps.length === 0 ? (
          <p className={styles.noIpsText}>No IP source addresses detected.</p>
        ) : (
          <div className={styles.chipRow}>
            <button
              className={`${styles.chip} ${ipFilter === 'All' ? styles.chipActive : ''}`}
              onClick={() => setIpFilter('All')}
              type="button"
            >
              All
            </button>
            {suspiciousIps.map(({ ip, count }) => (
              <button
                key={ip}
                className={`${styles.chip} ${ipFilter === ip ? styles.chipActive : ''}`}
                onClick={() => setIpFilter(ip)}
                type="button"
              >
                {ip}
                <span className={styles.chipBadge}>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: FINDINGS ACCORDION */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>Findings</span>
          {ipFilter !== 'All' && (
            <span 
              className={styles.filterBadge}
              onClick={() => setIpFilter('All')}
            >
              IP: {ipFilter} ✕
            </span>
          )}
        </div>

        <div className={styles.filterControls}>
          <div className={styles.searchWrapper}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.searchIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search findings by text/evidence..."
              className={styles.searchInput}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {searchVal && (
              <button 
                type="button" 
                className={styles.clearSearchBtn}
                onClick={() => setSearchVal('')}
                title="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.filterPills}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                type="button"
                className={`${styles.filterPill} ${severityFilter === sev ? styles.filterPillActive : ''}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className={styles.countLabel}>
            Showing {filteredFindings.length} of {findings.length} findings
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className={styles.noFindingsBox}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.emptyIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.noFindingsText}>No findings match your search</p>
            <button 
              type="button" 
              onClick={handleClearFilters}
              className={styles.clearAllBtn}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.findingsContainer}>
            {filteredFindings.map((finding, idx) => (
              <FindingCard
                key={finding.id || idx}
                finding={finding}
                isExpanded={expandedIndex === idx}
                onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                onCopy={(text) => handleCopy(text, idx)}
                copied={copiedId === idx}
              />
            ))}
          </div>
        )}
      </div>

      {/* VIEW ATTACK TIMELINE BUTTON */}
      <button
        type="button"
        className={styles.viewTimelineBtn}
        disabled={!analysis || timelineStatus === 'loading' || !analysis.attackTimeline || analysis.attackTimeline.length === 0}
        onClick={onOpenAttackTimeline}
      >
        {timelineStatus === 'loading' ? (
          <>
            <span className={styles.spinner}></span>
            Building timeline...
          </>
        ) : (
          <>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '8px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Attack Timeline
          </>
        )}
      </button>
    </div>
  );
}
