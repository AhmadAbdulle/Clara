import styles from './Skeleton.module.css';

export function FindingsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Skeleton Card 1 */}
      <div className={styles.card}>
        <div className={`${styles.title} ${styles.pulse}`}></div>
        <div className={styles.pills}>
          <div className={`${styles.block} ${styles.pulse}`} style={{ width: '45px', height: '24px' }}></div>
          <div className={`${styles.block} ${styles.pulse}`} style={{ width: '45px', height: '24px' }}></div>
          <div className={`${styles.block} ${styles.pulse}`} style={{ width: '45px', height: '24px' }}></div>
        </div>
      </div>

      {/* Skeleton Card 2 */}
      <div className={styles.card}>
        <div className={`${styles.title} ${styles.pulse}`}></div>
        <div className={`${styles.block} ${styles.pulse}`} style={{ width: '100%' }}></div>
        <div className={`${styles.block} ${styles.pulse}`} style={{ width: '80%' }}></div>
      </div>

      {/* Skeleton Card 3 */}
      <div className={styles.card}>
        <div className={`${styles.title} ${styles.pulse}`}></div>
        <div className={`${styles.block} ${styles.pulse}`} style={{ width: '100%' }}></div>
        <div className={`${styles.block} ${styles.pulse}`} style={{ width: '90%' }}></div>
      </div>

      {/* Skeleton Card 4 */}
      <div className={styles.card}>
        <div className={`${styles.title} ${styles.pulse}`}></div>
        <div className={`${styles.block} ${styles.pulse}`} style={{ height: '70px', width: '100%' }}></div>
      </div>
    </div>
  );
}

export function GeneralSkeleton({ width = '100%', height = '16px', borderRadius = '4px' }) {
  return (
    <div 
      className={`${styles.general} ${styles.pulse}`} 
      style={{ width, height, borderRadius }}
    />
  );
}
