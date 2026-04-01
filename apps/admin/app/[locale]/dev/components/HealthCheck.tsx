'use client';

import { useState, useEffect } from 'react';
import styles from '../css/HealthCheck.module.css';

export default function HealthCheck() {
  const [status, setStatus] = useState<'checking' | 'online' | 'error'>(
    'checking',
  );
  const [pings, setPings] = useState({ api: '--', db: '--', redis: '--' });

  useEffect(() => {
    const fetchHealth = async () => {
      const startTime = performance.now(); // 핑 측정 시작
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        const res = await fetch(`${apiUrl}/admin/health`, {
          cache: 'no-store',
        });

        const endTime = performance.now();
        const pingMs = Math.round(endTime - startTime);

        if (res.ok) {
          const data = await res.json();
          // 백엔드에서 db: 'ok', redis: 'ok' 를 보내준다고 가정
          setPings({
            api: `${pingMs}ms`,
            db: data.db === 'ok' ? 'Online' : 'ERR',
            redis: data.redis === 'ok' ? 'Online' : 'ERR',
          });
          setStatus('online');
        } else {
          throw new Error('Server Error');
        }
      } catch (err) {
        setStatus('error');
        setPings({ api: 'FAIL', db: 'FAIL', redis: 'FAIL' });
      }
    };

    fetchHealth();

    // 원한다면 30초마다 핑을 쏘게 설정할 수도 있어
    // const interval = setInterval(fetchHealth, 30000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>SYSTEM STATUS</span>
        <div className={styles.statusBadge}>
          <span
            className={`${styles.dot} ${status === 'online' ? styles.dotOnline : status === 'error' ? styles.dotError : styles.dotChecking}`}
          />
          {status === 'online'
            ? 'All Systems Operational'
            : status === 'error'
              ? 'System Offline'
              : 'Checking Systems...'}
        </div>
      </div>

      <div className={styles.grid}>
        {[
          { name: 'NestJS API', val: pings.api },
          { name: 'MongoDB', val: pings.db },
          { name: 'Redis Cache', val: pings.redis },
        ].map((item) => (
          <div key={item.name} className={styles.card}>
            <span className={styles.name}>{item.name}</span>
            <span
              className={`${styles.ping} ${status === 'checking' ? styles.pingLoading : item.val === 'FAIL' || item.val === 'ERR' ? styles.pingError : ''}`}
            >
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
