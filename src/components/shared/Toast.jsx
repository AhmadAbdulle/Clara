import styles from './Toast.module.css';

export default function Toast({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => {
        let bgClass = styles.info;
        if (t.type === 'success') bgClass = styles.success;
        if (t.type === 'error') bgClass = styles.error;

        return (
          <div key={t.id} className={`${styles.toast} ${bgClass}`}>
            <span className={styles.message}>{t.message}</span>
            <button
              type="button"
              onClick={() => onClose(t.id)}
              className={styles.closeBtn}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
