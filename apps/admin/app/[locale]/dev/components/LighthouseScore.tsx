'use client';

import { useEffect, useState } from 'react';
import styles from '../css/LighthouseScore.module.css';

const AUDIT_DATA = [
  {
    label: 'Performance',
    score: 98,
    metrics: [
      { name: 'First Contentful Paint', val: '0.8s', color: '#00cc66' },
      { name: 'Largest Contentful Paint', val: '1.2s', color: '#00cc66' },
      { name: 'Total Blocking Time', val: '40ms', color: '#00cc66' },
      { name: 'Cumulative Layout Shift', val: '0.01', color: '#00cc66' },
    ],
    techs: ['Next.js App Router', 'Image Optimization', 'Font Preloading'],
  },
  {
    label: 'SEO & Best Practices',
    score: 100,
    metrics: [
      { name: 'HTTPS Target', val: 'Active', color: '#00cc66' },
      { name: 'Meta & Open Graph', val: 'Valid', color: '#00cc66' },
      { name: 'Robots.txt / Sitemap', val: 'Configured', color: '#00cc66' },
      { name: 'Core Web Vitals', val: 'Passed', color: '#00cc66' },
    ],
    techs: ['next/metadata', 'Dynamic Sitemap', 'Strict CSP'],
  },
];

export default function LighthouseScore() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.title}>LIGHTHOUSE AUDIT REPORT</p>
        <div className={styles.metaInfo}>
          <span>Tested on: Mobile (Moto G4)</span>
          <span className={styles.divider}>|</span>
          <span>Throttling: Simulated 4G</span>
        </div>
      </div>

      <div className={styles.grid}>
        {AUDIT_DATA.map((section) => {
          const circumference = 251; // r=40
          const offset = circumference - (section.score / 100) * circumference;

          return (
            <div key={section.label} className={styles.auditCard}>
              {/* 왼쪽: 큰 원형 게이지 */}
              <div className={styles.scoreSection}>
                <div className={styles.circleWrap}>
                  <svg className={styles.svg} viewBox="0 0 100 100">
                    <circle
                      className={styles.bgCircle}
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className={styles.progressCircle}
                      cx="50"
                      cy="50"
                      r="40"
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: mounted ? offset : circumference,
                      }}
                    />
                  </svg>
                  <div className={styles.scoreTextWrap}>
                    <span className={styles.scoreText}>{section.score}</span>
                    <span className={styles.scoreMax}>/100</span>
                  </div>
                </div>
                <span className={styles.label}>{section.label}</span>
              </div>

              {/* 오른쪽: 세부 지표 및 적용 기술 */}
              <div className={styles.detailsSection}>
                <div className={styles.metricsGrid}>
                  {section.metrics.map((m) => (
                    <div key={m.name} className={styles.metricItem}>
                      <span className={styles.metricName}>{m.name}</span>
                      <span
                        className={styles.metricVal}
                        style={{ color: m.color }}
                      >
                        {m.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.techStack}>
                  <span className={styles.techLabel}>
                    Applied Optimizations:
                  </span>
                  <div className={styles.tags}>
                    {section.techs.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
