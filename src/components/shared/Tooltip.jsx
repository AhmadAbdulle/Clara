import { useState } from 'react';
import styles from './Tooltip.module.css';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div className={styles.tooltip}>
          {text}
        </div>
      )}
    </div>
  );
}
