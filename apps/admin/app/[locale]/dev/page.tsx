'use client';

import { useRef } from 'react';
import Image from 'next/image'; // 아키텍처 SVG 이미지를 위해 필요
import styles from '../../components/DevModePage.module.css';
import HealthCheck from './components/HealthCheck';

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
    icon: 'N',
    iconBg: '#fce7ec',
    iconColor: '#e0234e',
    name: 'NestJS',
    role: 'REST API, Schedulers, WebSocket, FCM',
    version: 'v10 · TypeScript',
  },
  {
    icon: 'N',
    iconBg: '#f0f0f0',
    iconColor: '#222',
    name: 'Next.js',
    role: 'Homepage + Admin panel',
    version: 'v15.3.1 · App Router',
  },
  {
    icon: 'RN',
    iconBg: '#e8f4ff',
    iconColor: '#2196f3',
    name: 'React Native (Expo)',
    role: 'Mobile app · iOS & Android',
    version: 'SDK 52 · EAS Build',
  },
  {
    icon: 'M',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    name: 'MongoDB',
    role: 'Main DB · Mongoose ORM',
    version: 'v7 · self-hosted',
  },
  {
    icon: 'R',
    iconBg: '#ffebee',
    iconColor: '#c62828',
    name: 'Redis',
    role: 'Cache, FCM dedup, Telegram',
    version: 'v7 · cache-manager',
  },
  {
    icon: 'S',
    iconBg: '#ede7f6',
    iconColor: '#4527a0',
    name: 'Socket.io',
    role: 'Live score real-time push',
    version: 'v4 · NestJS gateway',
  },
  {
    icon: 'F',
    iconBg: '#fff8e1',
    iconColor: '#f57f17',
    name: 'Firebase FCM',
    role: 'Push notifications · dedup',
    version: 'firebase-admin v12',
  },
  {
    icon: 'i',
    iconBg: '#e0f2f1',
    iconColor: '#00695c',
    name: 'i18next / next-intl',
    role: 'uz · ru · en · ko',
    version: 'next-intl v4',
  },
  {
    icon: 'D',
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

// GitHub contribution 잔디밭 지도 데이터 하드코딩
function ContribGrid() {
  const seed = [
    0, 0, 0, 1, 0, 2, 1, 0, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 0, 2,
    3, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 1, 0, 0, 1,
    2,
  ];
  const cells = [];
  for (let w = 0; w < 52; w++) {
    for (let d = 0; d < 7; d++) {
      const v = seed[(w * 7 + d) % seed.length];
      const rand = (w * 13 + d * 7) % 4;
      cells.push(Math.min(4, v + (rand === 0 ? 1 : 0)));
    }
  }
  return (
    <div className={styles.contribGrid}>
      {cells.map((level, i) => (
        <div key={i} className={`${styles.cday} ${styles[`c${level}`]}`} />
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────────

export default function DevModePage() {
  // 각 섹션의 위치를 기억할 Ref들
  const overviewRef = useRef<HTMLElement>(null);
  const techStackRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  const apiRef = useRef<HTMLElement>(null);
  const schedulersRef = useRef<HTMLElement>(null);
  const githubRef = useRef<HTMLElement>(null);
  const environmentRef = useRef<HTMLElement>(null);

  // 탭 클릭 시 해당 섹션으로 부드럽게 스크롤
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
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
  ];

  return (
    <div className={styles.container}>
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
                  <div
                    className={styles.stackIcon}
                    style={{ background: item.iconBg, color: item.iconColor }}
                  >
                    {' '}
                    {item.icon}{' '}
                  </div>
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
          <section
            ref={archRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>Architecture</p>
            <div className={styles.archWrap}>
              <div className={styles.archImageContainer}>
                {/* public 폴더의 football_uz_architecture_diagram.svg를 불러옴 */}
                <Image
                  src="/football_uz_architecture_diagram.svg"
                  alt="Football UZ Architecture Diagram"
                  width={1100} // 원본 비율에 맞게 적당히 큼직하게 설정
                  height={800}
                  priority
                  className={styles.archImage}
                />
              </div>
            </div>
          </section>

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
          <section
            ref={githubRef}
            className={`${styles.sectionContainer} ${styles.scrollAnchor}`}
          >
            <p className={styles.secLabel}>GitHub</p>
            <div className={styles.metricsRow}>
              {[
                {
                  label: 'Repository',
                  value: 'football-uz',
                  sub: 'github.com/kai',
                },
                { label: 'Total commits', value: '847', sub: 'since Jan 2024' },
                { label: 'Open PRs', value: '2', sub: 'in review' },
                {
                  label: 'Branches',
                  value: '4',
                  sub: 'main · dev · feat · fix',
                },
              ].map((m) => (
                <div key={m.label} className={styles.metricCard}>
                  <p className={styles.metricLabel}>{m.label}</p>
                  <p
                    className={styles.metricValue}
                    style={{
                      fontSize: m.label === 'Repository' ? '20px' : undefined,
                    }}
                  >
                    {m.value}
                  </p>
                  <p className={styles.metricSub}>{m.sub}</p>
                </div>
              ))}
            </div>
            <p className={styles.secLabel}>LANGUAGE BREAKDOWN</p>
            <div className={styles.langBar}>
              {[
                { label: 'TypeScript', pct: 62, color: '#3178c6' },
                { label: 'JavaScript', pct: 24, color: '#f7df1e' },
                { label: 'HTML/CSS', pct: 9, color: '#e34c26' },
                { label: 'Other', pct: 5, color: '#cbcbcb' },
              ].map((l) => (
                <div
                  key={l.label}
                  className={styles.langSeg}
                  style={{ width: `${l.pct}%`, background: l.color }}
                />
              ))}
            </div>
            <p className={styles.secLabel} style={{ margin: '20px 0 10px 0' }}>
              CONTRIBUTION ACTIVITY
            </p>
            <ContribGrid />
            <p className={styles.secLabel} style={{ marginTop: '20px' }}>
              RECENT COMMITS
            </p>
            <div className={styles.commitList}>
              <div className={styles.commitRow}>
                <span className={styles.commitHash}>a3f2c1d</span>
                <span className={styles.commitMsg}>
                  fix: syncLiveScores DB 기반으로 전환
                </span>
                <span className={styles.commitTime}>2h ago</span>
              </div>
              <div className={styles.commitRow}>
                <span className={styles.commitHash}>b7e91a2</span>
                <span className={styles.commitMsg}>
                  feat: Next.js 15 다운그레이드 + ESLint 무시
                </span>
                <span className={styles.commitTime}>5h ago</span>
              </div>
            </div>
          </section>

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
        </div>
      </div>
    </div>
  );
}
