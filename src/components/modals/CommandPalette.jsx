import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './CommandPalette.module.css';

const commands = [
  { id: 'analyse', name: 'Analyse active log file', category: 'Action', shortcut: 'Enter' },
  { id: 'upload', name: 'Upload local log file', category: 'Action', shortcut: 'Ctrl+O' },
  { id: 'preset-brute', name: 'Load Apache Brute Force scenario', category: 'Preset' },
  { id: 'preset-sql', name: 'Load SQL Injection Scan scenario', category: 'Preset' },
  { id: 'preset-priv', name: 'Load Linux Privilege Escalation scenario', category: 'Preset' },
  { id: 'preset-port', name: 'Load Network Port Scan scenario', category: 'Preset' },
  { id: 'export-pdf', name: 'Export Findings Report as PDF', category: 'Export' },
  { id: 'export-soc', name: 'Export SOC Incident Report PDF', category: 'Export' },
  { id: 'export-chat', name: 'Export plain text Chat Transcript', category: 'Export' },
  { id: 'sessions', name: 'Open Saved Investigations history', category: 'Navigation' },
  { id: 'how-works', name: 'Show "How CLARA works" architecture details', category: 'Help' },
  { id: 'tour', name: 'Restart guided onboarding tour', category: 'Help' }
];

export default function CommandPalette({
  isOpen,
  onClose,
  actions
}) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const executeCommand = useCallback((id) => {
    if (actions[id]) {
      actions[id]();
    }
    onClose();
  }, [actions, onClose]);

  // Handle arrow keys and Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          executeCommand(filteredCommands[activeIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, search, filteredCommands, onClose, executeCommand]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className={styles.searchHeader}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.searchIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or action to execute..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            className={styles.searchInput}
          />
        </div>

        {/* Command list */}
        {filteredCommands.length === 0 ? (
          <div className={styles.emptyState}>
            No commands match your search.
          </div>
        ) : (
          <div ref={listRef} className={styles.commandList}>
            {filteredCommands.map((cmd, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`${styles.commandItem} ${isActive ? styles.activeItem : ''}`}
                >
                  <div className={styles.itemLeft}>
                    <span className={`${styles.categoryTag} ${isActive ? styles.activeCategoryTag : ''}`}>
                      {cmd.category}
                    </span>
                    <span className={styles.commandName}>{cmd.name}</span>
                  </div>
                  {cmd.shortcut && (
                    <span className={styles.shortcut}>
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <footer className={styles.footer}>
          <span>Use ↑↓ arrows to navigate, <strong className={styles.boldText}>Enter</strong> to select</span>
          <span>Esc to exit</span>
        </footer>
      </div>
    </div>
  );
}
