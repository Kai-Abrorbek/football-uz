'use client';

import { useRef } from 'react';
import styles from '../../components/DevModePage.module.css';
import HealthCheck from './components/HealthCheck';
import QuickLinks from './components/QuickLinks';
import LighthouseScore from './components/LighthouseScore';
import TerminalLog from './components/TerminalLog';
import GitHubSection from './components/GitHubSection';
import HomeButton from './components/HomeButton';
import SystemArchitecture from './components/SystemArchitecture';

// ── 데이터 및 타입 정의 (기존 코드 유지) ──────────────────────────────────

interface StackItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  name: string;
  role: string;
  version: string;
}

const STACK_ITEMS: StackItem[] = [
  {
    icon: '/icons/NestJS.svg',
    iconBg: '#fce7ec',
    iconColor: '#e0234e',
    name: 'NestJS',
    role: 'REST API, Schedulers, WebSocket, FCM',
    version: 'v10 · TypeScript',
  },
  {
    icon: '/icons/nextjs.svg',
    iconBg: '#f0f0f0',
    iconColor: '#222',
    name: 'Next.js',
    role: 'Homepage + Admin panel',
    version: 'v15.3.1 · App Router',
  },
  {
    icon: '/icons/expo.svg',
    iconBg: '#e8f4ff',
    iconColor: '#2196f3',
    name: 'React Native (Expo)',
    role: 'Mobile app · iOS & Android',
    version: 'SDK 52 · EAS Build',
  },
  {
    icon: '/icons/mongodb.svg',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    name: 'MongoDB',
    role: 'Main DB · Mongoose ORM',
    version: 'v7 · self-hosted',
  },
  {
    icon: '/icons/redis-logo.svg',
    iconBg: '#ffebee',
    iconColor: '#c62828',
    name: 'Redis',
    role: 'Cache, FCM dedup, Telegram',
    version: 'v7 · cache-manager',
  },
  {
    icon: '/icons/socketio.png',
    iconBg: '#ede7f6',
    iconColor: '#4527a0',
    name: 'Socket.io',
    role: 'Live score real-time push',
    version: 'v4 · NestJS gateway',
  },
  {
    icon: '/icons/firebase-1-logo.svg',
    iconBg: '#fff8e1',
    iconColor: '#f57f17',
    name: 'Firebase FCM',
    role: 'Push notifications · dedup',
    version: 'firebase-admin v12',
  },
  {
    icon: '/icons/inext_logo.webp',
    iconBg: '#e0f2f1',
    iconColor: '#00695c',
    name: 'i18next / next-intl',
    role: 'uz · ru · en · ko',
    version: 'next-intl v4',
  },
  {
    icon: '/icons/docker-icon.svg',
    iconBg: '#e3f2fd',
    iconColor: '#1565c0',
    name: 'Docker Compose',
    role: '3 containers · Hostinger KVM2',
    version: 'GitHub Actions CI/CD',
  },
];

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/matches',
    desc: '날짜/리그별 경기 목록',
    color: '#4CAF50',
  },
  {
    method: 'GET',
    path: '/matches/live',
    desc: '라이브 경기 (Redis cached)',
    color: '#4CAF50',
  },
  {
    method: 'GET',
    path: '/matches/:id',
    desc: '경기 상세 + 통계',
    color: '#4CAF50',
  },
  {
    method: 'GET',
    path: '/standings/:leagueId',
    desc: '리그 순위표',
    color: '#4CAF50',
  },
  {
    method: 'GET',
    path: '/players/:id',
    desc: '선수 정보 + 다중 리그 stats',
    color: '#4CAF50',
  },
  {
    method: 'POST',
    path: '/predictions/:fixtureId',
    desc: 'GPT-4o mini AI 예측 생성',
    color: '#2196F3',
  },
  {
    method: 'POST',
    path: '/auth/telegram',
    desc: 'Telegram bot deeplink 로그인',
    color: '#2196F3',
  },
  {
    method: 'POST',
    path: '/notifications/settings',
    desc: 'FCM 알림 설정 저장',
    color: '#2196F3',
  },
  {
    method: 'WS',
    path: 'ws://api/live-scores',
    desc: 'Socket.io 실시간 스코어',
    color: '#9C27B0',
  },
];

const SCHEDULERS = [
  {
    status: 'ok',
    name: 'syncLiveScores',
    desc: 'DB 기반 라이브 체크 후 API 동기화',
    cron: '*/20 * * * * *',
  },
  {
    status: 'ok',
    name: 'syncRecentFixtures',
    desc: '최근 경기 업데이트',
    cron: '0 */6 * * *',
  },
  {
    status: 'ok',
    name: 'initialSync',
    desc: '서버 시작 시 전체 시즌 1회 동기화',
    cron: 'onModuleInit',
  },
  {
    status: 'warn',
    name: 'syncMatchDetails',
    desc: '통계/이벤트 — FT 또는 20분 주기',
    cron: 'on-demand',
  },
  {
    status: 'ok',
    name: 'createPrediction',
    desc: 'NS / 1H 상태일 때 GPT-4o mini 예측',
    cron: 'on NS · 1H',
  },
];

const ENV_VARS = [
  { key: 'NODE_ENV', value: 'production' },
  { key: 'API_PORT', value: '4000' },
  { key: 'ADMIN_PORT', value: '3005' },
  { key: 'MONGODB_URI', value: '••••••••••••••••••••' },
  { key: 'REDIS_URL', value: 'redis://redis:6379' },
  { key: 'RAPIDAPI_KEY', value: '••••••••••••••••••••' },
  { key: 'OPENAI_API_KEY', value: '••••••••••••••••••••' },
  { key: 'FCM_PROJECT_ID', value: 'football-uz' },
  { key: 'SEASON', value: '2025' },
  { key: 'VPS', value: 'Hostinger KVM2 · Docker Compose' },
];

// ── Main Component ──────────────────────────────────────────────────────────────────

export default function DevModePage() {
  const overviewRef = useRef<HTMLDivElement>(null);
  const techStackRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<HTMLDivElement>(null);
  const schedulersRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<HTMLDivElement>(null);
  const bashRef = useRef<HTMLDivElement>(null);

  // 탭 클릭 시 해당 섹션으로 부드럽게 스크롤
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Overview', ref: overviewRef },
    { label: 'Tech stack', ref: techStackRef },
    { label: 'Architecture', ref: archRef },
    { label: 'API endpoints', ref: apiRef },
    { label: 'Schedulers', ref: schedulersRef },
    { label: 'GitHub', ref: githubRef },
    { label: 'Environment', ref: environmentRef },
    { label: 'Bash', ref: bashRef },
  ];

  return (
    <div className={styles.container}>
      <HomeButton />
      {/* ── 상단 고정 헤더 & 탭바 ── */}
      <div className={styles.stickyHeaderNav}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.dot} />
            <div>
              <p className={styles.title}>Football UZ — Developer Mode</p>
              <p className={styles.subtitle}>
                v1.0.0 · NestJS + Next.js + React Native · Tashkent, UZ
              </p>
            </div>
          </div>
          <span className={styles.badge}>LIVE</span>
        </div>

        <div className={styles.tabBar}>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={styles.tabBtn}
              onClick={() => scrollToSection(item.ref)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 메인 콘텐츠 영역 ── */}
      <div className={styles.modal}>
        <div className={styles.content}>
          {/* ── Overview 섹션 ── */}
          <HealthCheck />
          <QuickLinks />
          <LighthouseScore />
          <section
            ref={overviewRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>Overview</p>
            <div className={styles.metricsRow}>
              {[
                { label: 'Total matches', value: '12,500+' },
                { label: 'Featured leagues', value: '16' },
                { label: 'Live sync', value: '20s' },
                { label: 'Containers', value: '3' },
                { label: 'API provider', value: 'api-football' },
              ].map((m) => (
                <div key={m.label} className={styles.metricCard}>
                  <p className={styles.metricLabel}>{m.label}</p>
                  <p className={styles.metricValue}>{m.value}</p>
                  <p className={styles.metricSub}>
                    {m.label === 'Featured leagues'
                      ? 'incl. Super League UZ'
                      : m.label === 'Live sync'
                        ? '@Cron interval'
                        : m.label === 'Containers'
                          ? 'API · Admin · Redis'
                          : m.label === 'API provider'
                            ? 'RapidAPI'
                            : 'all leagues'}
                  </p>
                </div>
              ))}
            </div>
            <p className={styles.secLabel} style={{ marginTop: '20px' }}>
              PROJECT STRUCTURE
            </p>
            <div className={styles.monoBlock}>
              <span className={styles.monoHighlight}>football-uz/</span>{' '}
              (Turborepo monorepo)
              <br />
              &nbsp;&nbsp;├─{' '}
              <span className={styles.monoHighlight}>apps/api</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
              <span className={styles.monoMuted}>NestJS · port 4000</span>
              <br />
              &nbsp;&nbsp;├─{' '}
              <span className={styles.monoHighlight}>apps/web</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
              <span className={styles.monoMuted}>
                Next.js homepage · port 3000
              </span>
              <br />
              &nbsp;&nbsp;├─{' '}
              <span className={styles.monoHighlight}>apps/admin</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
              <span className={styles.monoMuted}>
                Next.js admin · port 3005
              </span>
              <br />
              &nbsp;&nbsp;└─{' '}
              <span className={styles.monoHighlight}>apps/mobile</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
              <span className={styles.monoMuted}>Expo React Native</span>
            </div>
          </section>

          {/* ── Tech stack 섹션 ── */}
          <section
            ref={techStackRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>Tech stack</p>
            <div className={styles.stackGrid}>
              {STACK_ITEMS.map((item) => (
                <div key={item.name} className={styles.stackCard}>
                  <img
                    className={styles.stackIcon}
                    style={{ background: item.iconBg, color: item.iconColor }}
                    src={item.icon}
                    alt=""
                  />
                  <div>
                    <p className={styles.stackName}>{item.name}</p>
                    <p className={styles.stackRole}>{item.role}</p>
                    <p className={styles.stackVer}>{item.version}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Architecture 섹션 (SVG 이미지로 변경) ── */}
          <SystemArchitecture ref={archRef} />

          {/* ── API endpoints 섹션 ── */}
          <section
            ref={apiRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>API endpoints</p>
            <div className={styles.epList}>
              {ENDPOINTS.map((ep) => (
                <div key={ep.path} className={styles.epRow}>
                  <span
                    className={styles.method}
                    style={{ borderColor: ep.color, color: ep.color }}
                  >
                    {ep.method}
                  </span>
                  <span className={styles.epPath}>{ep.path}</span>
                  <span className={styles.epDesc}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Schedulers 섹션 ── */}
          <section
            ref={schedulersRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>Schedulers</p>
            <div className={styles.schedList}>
              {SCHEDULERS.map((s) => (
                <div key={s.name} className={styles.schedRow}>
                  <span
                    className={`${styles.schedDot} ${s.status === 'ok' ? styles.dotOk : styles.dotWarn}`}
                  />
                  <div className={styles.schedInfo}>
                    <p className={styles.schedName}>{s.name}</p>
                    <p className={styles.schedDesc}>{s.desc}</p>
                  </div>
                  <span className={styles.schedCron}>{s.cron}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── GitHub 섹션 ── */}
          <GitHubSection ref={githubRef} />

          {/* ── Environment 섹션 ── */}
          <section
            ref={environmentRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>RUNTIME CONFIG</p>
            <div className={styles.envList}>
              {ENV_VARS.map((e) => (
                <div key={e.key} className={styles.envRow}>
                  <span className={styles.envKey}>{e.key}</span>
                  <span className={styles.envVal}>{e.value}</span>
                </div>
              ))}
            </div>
          </section>

          <TerminalLog ref={bashRef} />
        </div>
      </div>
    </div>
  );
}
