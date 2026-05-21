import { useState, useEffect } from 'react';
import { techniqueLookup } from '../../utils/mitreLookup';
import styles from './AttackTimeline.module.css';

const getSeverityColors = (sev) => {
  switch (sev?.toLowerCase()) {
    case 'critical':
      return { main: '#c0392b', glow: 'rgba(192, 57, 43, 0.3)', bg: 'rgba(192, 57, 43, 0.08)' };
    case 'high':
      return { main: '#d4820a', glow: 'rgba(212, 130, 10, 0.3)', bg: 'rgba(212, 130, 10, 0.08)' };
    case 'medium':
      return { main: '#2c6e9e', glow: 'rgba(44, 110, 158, 0.3)', bg: 'rgba(44, 110, 158, 0.08)' };
    case 'low':
      return { main: '#8a8580', glow: 'rgba(138, 133, 128, 0.3)', bg: 'rgba(138, 133, 128, 0.08)' };
    default:
      return { main: '#8a8580', glow: 'rgba(138, 133, 128, 0.3)', bg: 'rgba(138, 133, 128, 0.08)' };
  }
};

export default function AttackTimeline({ isOpen, onClose, timeline, windowState, setWindowState }) {
  const [x, setX] = useState(() => {
    if (windowState.x !== null) return windowState.x;
    if (typeof window === 'undefined') return 0;
    const initW = windowState.width || 720;
    return Math.round((window.innerWidth - initW) / 2);
  });

  const [y, setY] = useState(() => {
    if (windowState.y !== null) return windowState.y;
    if (typeof window === 'undefined') return 0;
    const initH = windowState.height || 520;
    return Math.round((window.innerHeight - initH) / 2);
  });

  const [width, setWidth] = useState(windowState.width);
  const [height, setHeight] = useState(windowState.height);
  const [isMinimized, setIsMinimized] = useState(windowState.isMinimized);
  const [isMaximized, setIsMaximized] = useState(windowState.isMaximized);
  
  const [preMinimizedSize, setPreMinimizedSize] = useState(windowState.preMinimizedSize);
  const [preMaximizedState, setPreMaximizedState] = useState(windowState.preMaximizedState);

  const [isDragging, setIsDragging] = useState(false);
  const [expandedStages, setExpandedStages] = useState({});
  const [copiedLine, setCopiedLine] = useState(null);
  const [hoveredTech, setHoveredTech] = useState(null);

  // Adjust coordinates if browser is resized to keep window in bounds
  useEffect(() => {
    const handleViewportResize = () => {
      setX(prevX => {
        if (prevX === null) return null;
        const maxLimitX = window.innerWidth - width;
        return Math.max(0, Math.min(prevX, maxLimitX));
      });
      setY(prevY => {
        if (prevY === null) return null;
        const maxLimitY = window.innerHeight - height;
        return Math.max(0, Math.min(prevY, maxLimitY));
      });
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [width, height]);

  // Escape key close support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || x === null || y === null) return null;

  const timelineData = timeline || [];

  const toggleEvidence = (index) => {
    setExpandedStages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyEvidence = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedLine(idx);
    setTimeout(() => setCopiedLine(null), 1500);
  };

  // HEADER DRAG HANDLER
  const handleHeaderMouseDown = (e) => {
    if (e.button !== 0) return; // Only drag with left click
    if (e.target.closest('button')) return; // Don't drag if clicking buttons
    if (isMaximized) return; // Disable drag if maximized

    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;

    const handleMouseMove = (moveEvent) => {
      let newX = initialX + (moveEvent.clientX - startX);
      let newY = initialY + (moveEvent.clientY - startY);

      // Clamp inside viewport
      const maxLimitX = window.innerWidth - width;
      const maxLimitY = window.innerHeight - height;

      newX = Math.max(0, Math.min(newX, maxLimitX));
      newY = Math.max(0, Math.min(newY, maxLimitY));

      setX(newX);
      setY(newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Persist state to parent
      setWindowState(prev => ({
        ...prev,
        x,
        y
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // RESIZE HANDLER
  const handleResizeMouseDown = (direction, e) => {
    if (e.button !== 0) return;
    if (isMaximized || isMinimized) return; // Disable resizing when maximized or minimized

    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const startXPos = x;
    const startYPos = y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;

      const minW = 400;
      const minH = 300;
      const maxW = Math.round(window.innerWidth * 0.95);
      const maxH = Math.round(window.innerHeight * 0.90);

      if (direction.includes('e')) {
        newWidth = Math.max(minW, Math.min(maxW, startWidth + deltaX));
      }
      if (direction.includes('s')) {
        newHeight = Math.max(minH, Math.min(maxH, startHeight + deltaY));
      }
      if (direction.includes('w')) {
        const targetW = startWidth - deltaX;
        newWidth = Math.max(minW, Math.min(maxW, targetW));
        if (newWidth !== minW && newWidth !== maxW) {
          newX = startXPos + deltaX;
        } else if (targetW < minW) {
          newX = startXPos + (startWidth - minW);
        } else if (targetW > maxW) {
          newX = startXPos + (startWidth - maxW);
        }
      }
      if (direction.includes('n')) {
        const targetH = startHeight - deltaY;
        newHeight = Math.max(minH, Math.min(maxH, targetH));
        if (newHeight !== minH && newHeight !== maxH) {
          newY = startYPos + deltaY;
        } else if (targetH < minH) {
          newY = startYPos + (startHeight - minH);
        } else if (targetH > maxH) {
          newY = startYPos + (startHeight - maxH);
        }
      }

      // viewport clamping
      const maxLimitX = window.innerWidth - newWidth;
      const maxLimitY = window.innerHeight - newHeight;
      newX = Math.max(0, Math.min(newX, maxLimitX));
      newY = Math.max(0, Math.min(newY, maxLimitY));

      setX(newX);
      setY(newY);
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Persist state to parent
      setWindowState(prev => ({
        ...prev,
        x,
        y,
        width,
        height
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // WINDOW CONTROLS
  const handleToggleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      const restoredW = preMinimizedSize ? preMinimizedSize.width : 720;
      const restoredH = preMinimizedSize ? preMinimizedSize.height : 520;
      setWidth(restoredW);
      setHeight(restoredH);
      
      const newX = Math.min(x, window.innerWidth - restoredW);
      const newY = Math.min(y, window.innerHeight - restoredH);
      setX(newX);
      setY(newY);

      setWindowState(prev => ({
        ...prev,
        isMinimized: false,
        width: restoredW,
        height: restoredH,
        x: newX,
        y: newY
      }));
    } else {
      setPreMinimizedSize({ width, height });
      setIsMinimized(true);
      setWidth(720);
      
      const newX = Math.min(x, window.innerWidth - 720);
      setX(newX);

      setWindowState(prev => ({
        ...prev,
        isMinimized: true,
        preMinimizedSize: { width, height },
        width: 720,
        x: newX
      }));
    }
  };

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      const restoredX = preMaximizedState ? preMaximizedState.x : x;
      const restoredY = preMaximizedState ? preMaximizedState.y : y;
      const restoredW = preMaximizedState ? preMaximizedState.width : 720;
      const restoredH = preMaximizedState ? preMaximizedState.height : 520;
      
      setX(restoredX);
      setY(restoredY);
      setWidth(restoredW);
      setHeight(restoredH);

      setWindowState(prev => ({
        ...prev,
        isMaximized: false,
        x: restoredX,
        y: restoredY,
        width: restoredW,
        height: restoredH
      }));
    } else {
      setPreMaximizedState({ x, y, width, height });
      setIsMaximized(true);
      setIsMinimized(false); // Unminimize if minimized

      const maxW = Math.round(window.innerWidth * 0.95);
      const maxH = Math.round(window.innerHeight * 0.90);
      const maxX = Math.round((window.innerWidth - maxW) / 2);
      const maxY = Math.round((window.innerHeight - maxH) / 2);

      setX(maxX);
      setY(maxY);
      setWidth(maxW);
      setHeight(maxH);

      setWindowState(prev => ({
        ...prev,
        isMaximized: true,
        isMinimized: false,
        preMaximizedState: { x, y, width, height },
        x: maxX,
        y: maxY,
        width: maxW,
        height: maxH
      }));
    }
  };

  return (
    <div 
      className={styles.windowContainer}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: isMinimized ? '42px' : `${height}px`
      }}
    >
      {/* HEADER BAR */}
      <header 
        className={styles.headerBar}
        onMouseDown={handleHeaderMouseDown}
        style={{ cursor: isMaximized ? 'default' : isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={styles.titleSection}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Attack Timeline Reconstruction</span>
        </div>

        <div className={styles.controlButtons}>
          <button 
            type="button" 
            className={styles.controlBtn} 
            title={isMinimized ? "Restore" : "Minimise"} 
            onClick={handleToggleMinimize}
          >
            {isMinimized ? '🗗' : '🗕'}
          </button>
          <button 
            type="button" 
            className={styles.controlBtn} 
            title={isMaximized ? "Restore" : "Maximise"} 
            onClick={handleToggleMaximize}
          >
            {isMaximized ? '🗗' : '🗖'}
          </button>
          <button 
            type="button" 
            className={`${styles.controlBtn} ${styles.closeBtn}`} 
            title="Close" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </header>

      {/* WINDOW BODY */}
      {!isMinimized && (
        <div className={styles.windowBody}>
          <div className={styles.disclaimer}>
            AI-reconstructed kill chain — verify all findings independently
          </div>

          <div className={styles.scrollArea}>
            {timelineData.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className={styles.emptyTitle}>
                  No attack timeline could be reconstructed from this log
                </h4>
                <p className={styles.emptySubtitle}>
                  The log may not contain enough sequential evidence to map a kill chain
                </p>
              </div>
            ) : (
              <div className={styles.timelineWrapper}>
                {/* Vertical Timeline Connector Line */}
                <div className={styles.timelineConnector} />

                {timelineData.map((item, idx) => {
                  const colors = getSeverityColors(item.severity);
                  const isExpanded = !!expandedStages[idx];

                  return (
                    <div 
                      key={idx}
                      className={styles.timelineItem}
                      style={{ 
                        animationDelay: `${idx * 150}ms`
                      }}
                    >
                      {/* Timestamp (Left) */}
                      <div className={styles.timestampArea}>
                        <span className={styles.timeStr}>
                          {item.timestamp ? item.timestamp.split(' ')[1] || item.timestamp : '—'}
                        </span>
                        {item.timestamp && (
                          <div className={styles.dateStr}>
                            {item.timestamp.split(' ')[0]}
                          </div>
                        )}
                      </div>

                      {/* Circle Node (Center) */}
                      <div className={styles.nodeArea}>
                        <div 
                          className={styles.nodeCircle}
                          style={{
                            backgroundColor: colors.main,
                            boxShadow: `0 0 8px ${colors.glow}`
                          }}
                        />
                      </div>

                      {/* Stage Card (Right) */}
                      <div 
                        className={styles.stageCard}
                        style={{ 
                          borderLeftColor: colors.main
                        }}
                      >
                        {/* Top Metadata Row */}
                        <div className={styles.cardHeader}>
                          <div className={styles.cardHeaderTitleGroup}>
                            <span className={styles.stageTitle}>
                              {item.stage}
                            </span>
                            <span 
                              className={styles.severityTag}
                              style={{ 
                                backgroundColor: colors.bg,
                                color: colors.main
                              }}
                            >
                              {item.severity}
                            </span>
                          </div>
                          <span className={styles.mitrePhase}>
                            {item.mitrePhase || '—'}
                          </span>
                        </div>

                        {/* Card Timestamp */}
                        {item.timestamp && (
                          <div className={styles.cardTimestamp}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={styles.monoTime}>{item.timestamp}</span>
                          </div>
                        )}

                        {/* Description */}
                        <p className={styles.description}>
                          {item.description}
                        </p>

                        {/* Technique Pills */}
                        {item.techniques && item.techniques.length > 0 && (
                          <div className={styles.techniquesGroup}>
                            {item.techniques.map((tech) => {
                              const techName = techniqueLookup[tech] || 'Unknown Technique';
                              const isHovered = hoveredTech === `${idx}-${tech}`;
                              return (
                                <div
                                  key={tech}
                                  onMouseEnter={() => setHoveredTech(`${idx}-${tech}`)}
                                  onMouseLeave={() => setHoveredTech(null)}
                                  className={styles.techPill}
                                >
                                  {tech}
                                  {isHovered && (
                                    <div className={styles.techTooltip}>
                                      <strong>{tech}</strong>: {techName}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Collapsible Evidence lines */}
                        {item.evidenceLines && item.evidenceLines.length > 0 && (
                          <div className={styles.evidenceSection}>
                            <button
                              type="button"
                              onClick={() => toggleEvidence(idx)}
                              className={styles.toggleEvidenceBtn}
                            >
                              <span>{isExpanded ? 'Hide evidence' : 'Show evidence'}</span>
                              <svg 
                                width="12" 
                                height="12" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                                className={`${styles.evidenceChevron} ${isExpanded ? styles.expandedChevron : ''}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {isExpanded && (
                              <div className={styles.evidenceLinesList}>
                                {item.evidenceLines.map((line, lIdx) => {
                                  const copyKey = `${idx}-${lIdx}`;
                                  return (
                                    <div 
                                      key={lIdx}
                                      className={styles.evidenceLineItem}
                                    >
                                      <code className={styles.evidenceCode}>
                                        {line}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyEvidence(line, copyKey)}
                                        className={styles.copyEvidenceBtn}
                                        title="Copy log line"
                                      >
                                        {copiedLine === copyKey ? (
                                          <span className={styles.copiedIndicator}>✓</span>
                                        ) : (
                                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Single Stage warning */}
            {timelineData.length === 1 && (
              <div className={styles.singleStageWarning}>
                Only one attack stage detected in this log
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESIZE HANDLES (only show when not maximized/minimized) */}
      {!isMaximized && !isMinimized && (
        <>
          <div className={`${styles.resizeHandle} ${styles.handleN}`} onMouseDown={(e) => handleResizeMouseDown('n', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleS}`} onMouseDown={(e) => handleResizeMouseDown('s', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleE}`} onMouseDown={(e) => handleResizeMouseDown('e', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleW}`} onMouseDown={(e) => handleResizeMouseDown('w', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleNW}`} onMouseDown={(e) => handleResizeMouseDown('nw', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleNE}`} onMouseDown={(e) => handleResizeMouseDown('ne', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleSW}`} onMouseDown={(e) => handleResizeMouseDown('sw', e)} />
          <div className={`${styles.resizeHandle} ${styles.handleSE}`} onMouseDown={(e) => handleResizeMouseDown('se', e)} />
        </>
      )}
    </div>
  );
}
