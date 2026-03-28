'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import styles from '../components/page.module.css';

// ── Types ──────────────────────────────────────────────────────────────────
interface FloatingIcon {
  id: number;
  src: string;
  label: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface MatchCard {
  id: number;
  homeTeam: string;
  awayTeam: string;
  score: string;
  league: string;
  status: string;
  time: string;
  homeLogo: string;
  awayLogo: string;
  bg: string;
}

interface AppScreen {
  imageUrl: string;
  title: string;
  sub: string;
}

interface AppCard {
  id: number;
  badge?: 'New' | 'Updated';
  screens: AppScreen[];
}

const MOCK_APP_CARDS: AppCard[] = [
  {
    id: 1,
    badge: 'New',
    screens: [
      {
        imageUrl: '/images/predictions.jpg',
        title: 'Live Score',
        sub: 'Uzbekistan vs Korea · 2–1',
      },
      {
        imageUrl: '/images/standdings.jpg',
        title: 'Standings',
        sub: 'Super League UZ · Round 12',
      },
      {
        imageUrl: '/images/predictions.jpg',
        title: 'Player Stats',
        sub: 'Eldor Shomurodov · 8 goals',
      },
    ],
  },
  {
    id: 2,
    badge: 'Updated',
    screens: [
      {
        imageUrl: '/images/screens/fixtures.png',
        title: 'Fixtures',
        sub: 'Pakhtakor vs Nasaf · Mar 28',
      },
      {
        imageUrl: '/images/screens/team-form.png',
        title: 'Team Form',
        sub: 'Pakhtakor · W W D W L',
      },
      {
        imageUrl: '/images/screens/top-scorers.png',
        title: 'Top Scorers',
        sub: 'Super League UZ 2026',
      },
    ],
  },
  {
    id: 3,
    screens: [
      {
        imageUrl: '/images/screens/world-cup.png',
        title: 'World Cup',
        sub: 'Uzbekistan · Group B',
      },
      {
        imageUrl: '/images/screens/predictions.png',
        title: 'Predictions',
        sub: 'Tonight · 3 matches',
      },
      {
        imageUrl: '/images/screens/notifications.png',
        title: 'Notifications',
        sub: "Goal alert · 67'",
      },
    ],
  },
];

// ── Mock data (will be replaced with server data) ──────────────────────────
const MOCK_FLOATING_ICONS: Omit<
  FloatingIcon,
  'x' | 'y' | 'speedX' | 'speedY'
>[] = [
  { id: 1, src: '⚛️', label: 'React Native', size: 72, color: '#61dafb' },
  { id: 2, src: '🟦', label: 'TypeScript', size: 64, color: '#3178c6' },
  { id: 3, src: '▲', label: 'Next.js', size: 68, color: '#000000' },
  { id: 4, src: '🐦', label: 'NestJS', size: 60, color: '#e0234e' },
  { id: 5, src: '🍃', label: 'MongoDB', size: 66, color: '#47a248' },
  { id: 6, src: '🔴', label: 'Redis', size: 62, color: '#dc382d' },
  { id: 7, src: '🐳', label: 'Docker', size: 64, color: '#2496ed' },
  { id: 8, src: '🔥', label: 'Firebase', size: 60, color: '#ffca28' },
  { id: 9, src: '⚡', label: 'Socket.io', size: 58, color: '#010101' },
  { id: 10, src: '🌐', label: 'i18next', size: 66, color: '#26a69a' },
];

const MOCK_MATCH_CARDS: MatchCard[] = [
  {
    id: 1,
    homeTeam: 'Uzbekistan',
    awayTeam: 'South Korea',
    score: '2 - 1',
    league: 'World Cup Qualifier',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇰🇷',
    bg: '#0d1b2a',
  },
  {
    id: 2,
    homeTeam: 'Pakhtakor',
    awayTeam: 'Bunyodkor',
    score: '1 - 1',
    league: 'Uzbekistan SL',
    status: 'LIVE',
    time: "67'",
    homeLogo: '🟡',
    awayLogo: '🔵',
    bg: '#1a0a2e',
  },
  {
    id: 3,
    homeTeam: 'Uzbekistan',
    awayTeam: 'Japan',
    score: '0 - 2',
    league: 'AFC Asian Cup',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇯🇵',
    bg: '#0a1628',
  },
  {
    id: 4,
    homeTeam: 'Nasaf',
    awayTeam: 'Sogdiana',
    score: '3 - 0',
    league: 'Uzbekistan SL',
    status: 'FT',
    time: "90'",
    homeLogo: '🟢',
    awayLogo: '🟠',
    bg: '#1b2838',
  },
  {
    id: 5,
    homeTeam: 'Uzbekistan',
    awayTeam: 'Saudi Arabia',
    score: '1 - 0',
    league: 'World Cup Qualifier',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇸🇦',
    bg: '#0f1923',
  },
  {
    id: 6,
    homeTeam: 'Lokomotiv',
    awayTeam: 'Dynamo',
    score: '2 - 2',
    league: 'Uzbekistan SL',
    status: 'LIVE',
    time: "45'",
    homeLogo: '🔴',
    awayLogo: '⚪',
    bg: '#1c1c2e',
  },
  {
    id: 7,
    homeTeam: 'Uzbekistan',
    awayTeam: 'Iran',
    score: '–',
    league: 'AFC Qualifier',
    status: 'TBD',
    time: 'Mar 28',
    homeLogo: '🇺🇿',
    awayLogo: '🇮🇷',
    bg: '#162032',
  },
  {
    id: 8,
    homeTeam: 'AGMK',
    awayTeam: 'Metallurg',
    score: '1 - 3',
    league: 'Uzbekistan SL',
    status: 'FT',
    time: "90'",
    homeLogo: '⚫',
    awayLogo: '🟤',
    bg: '#0e1a10',
  },
];

const HERO_TEXTS = [
  { heading: 'heroHeading1', sub: 'heroSub1' },
  { heading: 'heroHeading2', sub: 'heroSub2' },
  { heading: 'heroHeading3', sub: 'heroSub3' },
];

const STATS = [
  { key: 'statsPowered', value: 'Powered by NestJS & MongoDB' },
  { key: 'statsLive', value: 'Live scores via Socket.io' },
  { key: 'statsDeployed', value: 'Deployed on Docker · VPS' },
];

// ── Floating Icons Canvas ──────────────────────────────────────────────────
function FloatingIconsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    iconsRef.current = MOCK_FLOATING_ICONS.map((icon) => ({
      ...icon,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      iconsRef.current.forEach((icon) => {
        icon.x += icon.speedX;
        icon.y += icon.speedY;

        // 벽 반사 (컨테이너 안에서만)
        if (icon.x < icon.size / 2) {
          icon.x = icon.size / 2;
          icon.speedX *= -1;
        }
        if (icon.x > w - icon.size / 2) {
          icon.x = w - icon.size / 2;
          icon.speedX *= -1;
        }
        if (icon.y < icon.size / 2) {
          icon.y = icon.size / 2;
          icon.speedY *= -1;
        }
        if (icon.y > h - icon.size / 2) {
          icon.y = h - icon.size / 2;
          icon.speedY *= -1;
        }

        ctx.shadowColor = icon.color + '44';
        ctx.shadowBlur = 16;
        const s = icon.size;
        const r = s * 0.22;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(icon.x - s / 2, icon.y - s / 2, s, s, r);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = `${s * 0.55}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon.src, icon.x, icon.y);
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.floatingContainer}>
      <canvas ref={canvasRef} className={styles.floatingCanvas} />
    </div>
  );
}

function ScrollRevealText({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      // 요소가 화면 하단에서 나타나기 시작 → 중앙 올 때까지 0~1
      const start = winH;
      const end = winH * 0.3;
      const curr = rect.top;
      const p = Math.min(1, Math.max(0, (start - curr) / (start - end)));
      setProgress(p);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 0 → gray(#d0d0d0), 1 → black(#111)
  const lightness = Math.round(208 - progress * 190); // 208 → 18
  const color = `rgb(${lightness}, ${lightness}, ${lightness})`;

  return (
    <p ref={ref} className={styles.statLine} style={{ color }}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statKey}> {label}</span>
    </p>
  );
}

// ── Infinite Slider ────────────────────────────────────────────────────────
function MatchSlider() {
  const doubled = [...MOCK_MATCH_CARDS, ...MOCK_MATCH_CARDS];

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderTrack}>
        {doubled.map((card, i) => (
          <div
            key={`${card.id}-${i}`}
            className={styles.matchCard}
            style={{ background: card.bg }}
          >
            <div className={styles.cardLeague}>{card.league}</div>
            <div className={styles.cardTeams}>
              <div className={styles.teamBlock}>
                <span className={styles.teamLogo}>{card.homeLogo}</span>
                <span className={styles.teamName}>{card.homeTeam}</span>
              </div>
              <div className={styles.scoreBlock}>
                <span className={styles.score}>{card.score}</span>
                <span
                  className={`${styles.status} ${card.status === 'LIVE' ? styles.live : ''}`}
                >
                  {card.status === 'LIVE' && (
                    <span className={styles.liveDot} />
                  )}
                  {card.status === 'LIVE'
                    ? `${card.time} LIVE`
                    : card.status === 'TBD'
                      ? card.time
                      : `FT`}
                </span>
              </div>
              <div className={styles.teamBlock}>
                <span className={styles.teamLogo}>{card.awayLogo}</span>
                <span className={styles.teamName}>{card.awayTeam}</span>
              </div>
            </div>
            <div className={styles.cardPhone}>
              <div className={styles.phoneNotch} />
              <div
                className={styles.phoneScreen}
                style={{ background: card.bg }}
              >
                <div className={styles.miniScore}>{card.score}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppPreviewCard({ card }: { card: AppCard }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % card.screens.length);
        setFade(true);
      }, 350);
    }, 2800);
    return () => clearInterval(timer);
  }, [card.screens.length]);

  const screen = card.screens[idx];

  return (
    <div className={styles.appCard}>
      {card.badge && <span className={styles.appCardBadge}>{card.badge}</span>}
      <div className={styles.phoneFrame}>
        <div className={styles.phoneNotchBar} />
        <div
          className={`${styles.phoneContent} ${fade ? styles.fadeIn : styles.fadeOut}`}
        >
          <img
            src={screen.imageUrl}
            alt={screen.title}
            className={styles.phoneImage}
          />
        </div>
      </div>
      <div
        className={`${styles.appCardText} ${fade ? styles.fadeIn : styles.fadeOut}`}
      >
        <p className={styles.appCardTitle}>{screen.title}</p>
        <p className={styles.appCardSub}>{screen.sub}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const t = useTranslations('home');
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [browseTab, setBrowseTab] = useState<'matches' | 'teams' | ''>('');

  const statsSectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = statsSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setScrollProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 텍스트 3개 각각 0~0.33, 0.33~0.66, 0.66~1 구간에서 나타남
  function getStatColor(progress: number, index: number): string {
    const start = index / 3;
    const end = (index + 1) / 3;
    const p = Math.min(1, Math.max(0, (progress - start) / (end - start)));
    const l = Math.round(208 - p * 190);
    return `rgb(${l}, ${l}, ${l})`;
  }

  // Hero text rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroFade(false);
      setTimeout(() => {
        setHeroIndex((p) => (p + 1) % HERO_TEXTS.length);
        setHeroFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentHero = HERO_TEXTS[heroIndex];

  return (
    <main className={styles.main}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroAppIcon}>
          <img
            src="/images/app-logo.png"
            alt=""
            style={{ width: 110, height: 100, borderRadius: 50 }}
          />
        </div>
        <div
          className={`${styles.heroText} ${heroFade ? styles.fadeIn : styles.fadeOut}`}
        >
          <h1 className={styles.heroHeading}>{t(currentHero.heading)}</h1>
          <p className={styles.heroSub}>{t(currentHero.sub)}</p>
        </div>
        <div className={styles.heroCta}>
          <a
            className={styles.ctaPrimary}
            href="https://footballuz.online/downloads/football-uz.apk"
          >
            {t('ctaDownload')}
          </a>
          <button className={styles.ctaSecondary}>{t('ctaExplore')} →</button>
        </div>
      </section>

      <section className={styles.browseSection}>
        <div className={styles.browseContainer}>
          {/* Navbar */}
          <div className={styles.browseNavbar}>
            <div className={styles.browseLeft}>
              <span className={styles.browseLogo}>⚽</span>
              <button
                className={`${styles.browseTab} ${browseTab === 'matches' ? styles.browseTabActive : ''}`}
                onClick={() =>
                  setBrowseTab(
                    browseTab === 'matches' ? ('' as any) : 'matches',
                  )
                }
              >
                {t('tab_matches')}
              </button>
              <button
                className={`${styles.browseTab} ${browseTab === 'teams' ? styles.browseTabActive : ''}`}
                onClick={() =>
                  setBrowseTab(browseTab === 'teams' ? ('' as any) : 'teams')
                }
              >
                {t('tab_teams')}
              </button>
            </div>
            <div className={styles.browseRight}>
              <button className={styles.browseIconBtn}>🔖</button>
              <button className={styles.browseIconBtn}>🌐</button>
              <button className={styles.browseInviteBtn}>
                {t('inviteBtn')}
              </button>
              <div className={styles.browseAvatar}>⚽</div>
            </div>
          </div>

          {/* Dropdown menu */}
          {browseTab !== '' && (
            <div className={styles.browseDropdown}>
              <div className={styles.browseGrid}>
                <div className={styles.browseCol}>
                  <p className={styles.colLabel}>{t('colLeagues')}</p>
                  {[
                    'Super League UZ',
                    'World Cup 2026',
                    'AFC Asian Cup',
                    'UEFA Champions',
                    'Premier League',
                  ].map((l) => (
                    <p key={l} className={styles.colItem}>
                      {l}
                    </p>
                  ))}
                </div>
                <div className={styles.browseCol}>
                  <p className={styles.colLabel}>{t('colScreens')}</p>
                  {[
                    'Live Scores',
                    'Standings',
                    'Fixtures',
                    'Team Stats',
                    'Player Ratings',
                  ].map((s) => (
                    <p key={s} className={styles.colItem}>
                      {s}
                    </p>
                  ))}
                </div>
                <div className={styles.browseCol}>
                  <p className={styles.colLabel}>{t('colFeatures')}</p>
                  {[
                    'Match Predictions',
                    'Push Alerts',
                    'Follow Teams',
                    'Uzbek Players',
                    'World Cup Tracker',
                  ].map((f) => (
                    <p key={f} className={styles.colItem}>
                      {f}
                    </p>
                  ))}
                </div>
                <div className={styles.browseCol}>
                  <p className={styles.colLabel}>{t('colMore')}</p>
                  {[
                    'Commentary',
                    'Video Highlights',
                    'Fan Polls',
                    'Transfer News',
                    'Stadium Guide',
                  ].map((m) => (
                    <p key={m} className={styles.colItem}>
                      {m}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              <button className={styles.filterPlatformBtn}>
                {t('filterAll')}
              </button>
              <button className={styles.filterPlatformBtn}>
                {t('filterLive')}
              </button>
              <div className={styles.filterDivider} />
              {['latest', 'popular', 'topRated'].map((f) => (
                <button
                  key={f}
                  className={`${styles.filterSortBtn} ${f === 'latest' ? styles.filterSortActive : ''}`}
                >
                  {t(`filter_${f}`)}
                </button>
              ))}
            </div>
            <button className={styles.filterBtn}>⚙ {t('filterLabel')}</button>
          </div>

          {/* App preview cards */}
          <div className={styles.appCardsGrid}>
            {MOCK_APP_CARDS.map((card) => (
              <AppPreviewCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection} ref={statsSectionRef}>
        <div className={styles.statsSticky}>
          <FloatingIconsSection />
          <div className={styles.statsOverlay}>
            <p className={styles.statsLabel}>{t('statsLabel')}</p>
            {STATS.map(({ key, value }, i) => (
              <p
                key={key}
                className={styles.statLine}
                style={{ color: getStatColor(scrollProgress, i) }}
              >
                <span>{value}</span>
                <span> {t(key)}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATCH CARDS SLIDER (4th screenshot) ── */}
      <section className={styles.sliderSection}>
        <h2 className={styles.sliderTitle}>{t('sliderTitle')}</h2>
        <div className={styles.sliderTabs}>
          {['Screens', 'Highlights', 'Flows', 'Live'].map((tab) => (
            <button key={tab} className={styles.sliderTabBtn}>
              {t(`sliderTab_${tab.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <MatchSlider />
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>⚽ Football UZ</div>
            <p className={styles.footerTagline}>{t('footerTagline')}</p>
            <div className={styles.footerSocials}>
              <a href="#" className={styles.socialBtn}>
                Telegram
              </a>
              <a href="#" className={styles.socialBtn}>
                Instagram
              </a>
              <a href="#" className={styles.socialBtn}>
                YouTube
              </a>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>{t('footerApp')}</p>
              {['Live Scores', 'Teams', 'Players', 'Standings', 'Fixtures'].map(
                (l) => (
                  <a key={l} href="#" className={styles.footerLink}>
                    {l}
                  </a>
                ),
              )}
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>{t('footerCompany')}</p>
              {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((l) => (
                <a key={l} href="#" className={styles.footerLink}>
                  {l}
                </a>
              ))}
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>{t('footerSupport')}</p>
              {[
                'Help Center',
                'Privacy Policy',
                'Terms of Service',
                'Cookie Policy',
              ].map((l) => (
                <a key={l} href="#" className={styles.footerLink}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© Football UZ 2024–2026. {t('footerRights')}</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">{t('footerPrivacy')}</a>
            <a href="#">{t('footerTerms')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
