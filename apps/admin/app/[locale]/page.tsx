'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import styles from '../components/page.module.css';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

// ── Types ──────────────────────────────────────────────────────────────────

interface MatchCard {
  id: number;
  imageUrl: string; // public/images/matches/ 에 넣으면 바로 표시
  homeTeam: string;
  awayTeam: string;
  score: string;
  league: string;
  status: string;
  time: string;
  homeLogo: string;
  awayLogo: string;
}

// 궤도에 배치할 기술 스택 아이콘 데이터
interface OrbitIcon {
  id: number;
  src: string;
  label: string;
  color: string;
  orbitRadius: number; // 어느 궤도에 위치할지 (픽셀 단위 반지름)
  angleOffset: number; // 궤도상 시작 각도 (도 단위)
  speedFactor: number; // 회전 속도 배율
  width: string;
  height: string;
}

const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbek', flag: '/uzb-flag.svg' },
  { code: 'en', label: 'English', flag: '/eng-flag.svg' },
  { code: 'ko', label: '한국어', flag: 'kr-flag.svg' },
];

interface AppCard {
  id: number;
  badge?: 'New' | 'Updated';
  images: string[];
  title: string;
  sub: string;
}

const MOCK_APP_CARDS: AppCard[] = [
  {
    id: 1,
    badge: 'New',
    images: ['/images/img1.jpg', '/images/img43.jpg', '/images/img35.jpg'],
    title: 'Live Score',
    sub: 'Uzbekistan vs Korea · 2–1',
  },
  {
    id: 2,
    badge: 'Updated',
    images: ['/images/img11.jpg', '/images/img31.jpg', '/images/img36.jpg'],
    title: 'Fixtures',
    sub: 'Pakhtakor vs Nasaf · Mar 28',
  },
  {
    id: 3,
    images: ['/images/img22.jpg', '/images/img20.jpg', '/images/img21.jpg'],
    title: 'World Cup',
    sub: 'Uzbekistan · Group B',
  },
];

// ── Mock data (will be replaced with server data) ──────────────────────────
const MOCK_ORBIT_ICONS: OrbitIcon[] = [
  // ── 안쪽 궤도 280px (3개, 120도씩) ──
  {
    id: 1,
    src: '/icons/league1.svg.png',
    label: 'React Native',
    color: '#61dafb',
    orbitRadius: 280,
    angleOffset: 0,
    speedFactor: 1,
    width: '40px',
    height: '40px',
  },
  {
    id: 2,
    src: '/icons/league2.svg.png',
    label: 'Next.js',
    color: '#ffffff',
    orbitRadius: 280,
    angleOffset: 120,
    speedFactor: 1,
    width: '40px',
    height: '40px',
  },
  {
    id: 3,
    src: '/icons/league3.svg.png',
    label: 'MongoDB',
    color: '#47a248',
    orbitRadius: 280,
    angleOffset: 240,
    speedFactor: 1,
    width: '40px',
    height: '40px',
  },

  // ── 바깥 궤도 450px (8개, 45도씩) ──
  {
    id: 4,
    src: '/icons/league31.png',
    label: 'NestJS',
    color: '#e0234e',
    orbitRadius: 450,
    angleOffset: 0,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 5,
    src: '/icons/league39.png',
    label: 'Redis',
    color: '#dc382d',
    orbitRadius: 450,
    angleOffset: 45,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 6,
    src: '/icons/league61.svg',
    label: 'Socket.io',
    color: '#010101',
    orbitRadius: 450,
    angleOffset: 90,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 7,
    src: '/icons/league78.svg.webp',
    label: 'Docker',
    color: '#2496ed',
    orbitRadius: 450,
    angleOffset: 135,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 8,
    src: '/icons/league94.png',
    label: 'Firebase',
    color: '#ffca28',
    orbitRadius: 450,
    angleOffset: 180,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 9,
    src: '/icons/league135.svg.png',
    label: 'TypeScript',
    color: '#3178c6',
    orbitRadius: 450,
    angleOffset: 225,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 10,
    src: '/icons/league203.svg.png',
    label: 'i18next',
    color: '#26a69a',
    orbitRadius: 450,
    angleOffset: 270,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
  {
    id: 11,
    src: '/icons/league307.svg',
    label: 'Expo',
    color: '#000020',
    orbitRadius: 450,
    angleOffset: 315,
    speedFactor: 0.6,
    width: '40px',
    height: '40px',
  },
];

const MOCK_MATCH_CARDS: MatchCard[] = [
  {
    id: 1,
    imageUrl: '/images/matches/uz-vs-korea.png',
    homeTeam: 'Uzbekistan',
    awayTeam: 'South Korea',
    score: '2 - 1',
    league: 'World Cup Qualifier',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇰🇷',
  },
  {
    id: 2,
    imageUrl: '/images/matches/pakhtakor.png',
    homeTeam: 'Pakhtakor',
    awayTeam: 'Bunyodkor',
    score: '1 - 1',
    league: 'Uzbekistan SL',
    status: 'LIVE',
    time: "67'",
    homeLogo: '🟡',
    awayLogo: '🔵',
  },
  {
    id: 3,
    imageUrl: '/images/matches/uz-vs-japan.png',
    homeTeam: 'Uzbekistan',
    awayTeam: 'Japan',
    score: '0 - 2',
    league: 'AFC Asian Cup',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇯🇵',
  },
  {
    id: 4,
    imageUrl: '/images/matches/nasaf.png',
    homeTeam: 'Nasaf',
    awayTeam: 'Sogdiana',
    score: '3 - 0',
    league: 'Uzbekistan SL',
    status: 'FT',
    time: "90'",
    homeLogo: '🟢',
    awayLogo: '🟠',
  },
  {
    id: 5,
    imageUrl: '/images/matches/uz-vs-saudi.png',
    homeTeam: 'Uzbekistan',
    awayTeam: 'Saudi Arabia',
    score: '1 - 0',
    league: 'World Cup Qualifier',
    status: 'FT',
    time: "90'",
    homeLogo: '🇺🇿',
    awayLogo: '🇸🇦',
  },
  {
    id: 6,
    imageUrl: '/images/matches/lokomotiv.png',
    homeTeam: 'Lokomotiv',
    awayTeam: 'Dynamo',
    score: '2 - 2',
    league: 'Uzbekistan SL',
    status: 'LIVE',
    time: "45'",
    homeLogo: '🔴',
    awayLogo: '⚪',
  },
  {
    id: 7,
    imageUrl: '/images/matches/uz-vs-iran.png',
    homeTeam: 'Uzbekistan',
    awayTeam: 'Iran',
    score: '–',
    league: 'AFC Qualifier',
    status: 'TBD',
    time: 'Mar 28',
    homeLogo: '🇺🇿',
    awayLogo: '🇮🇷',
  },
  {
    id: 8,
    imageUrl: '/images/matches/agmk.png',
    homeTeam: 'AGMK',
    awayTeam: 'Metallurg',
    score: '1 - 3',
    league: 'Uzbekistan SL',
    status: 'FT',
    time: "90'",
    homeLogo: '⚫',
    awayLogo: '🟤',
  },
];

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Sebastian Speier',
    role: 'Shop',
    avatar: 'https://i.pravatar.cc/150?u=1',
    content:
      'Football UZ is a great resource and it always comes in handy to see live scores and league data in real-time.',
  },
  {
    id: 2,
    name: 'Meng To',
    role: 'DesignCode',
    avatar: 'https://i.pravatar.cc/150?u=2',
    content:
      "This app is a game-changer for football fans looking to step up their community experience. It's meticulously organized!",
  },
  {
    id: 3,
    name: 'Marco Cornacchia',
    role: 'Figma',
    avatar: 'https://i.pravatar.cc/150?u=3',
    content:
      'One of my favorite resources for keeping track of my favorite teams. The UI is incredibly clean and intuitive.',
  },
  {
    id: 4,
    name: 'Taha Hossain',
    role: 'Daybreak',
    avatar: 'https://i.pravatar.cc/150?u=4',
    content:
      "We can't imagine following the local league without this app. The clarity and precision it provides make it invaluable.",
  },
  {
    id: 5,
    name: 'Haerin Song',
    role: 'Visa',
    avatar: 'https://i.pravatar.cc/150?u=5',
    content:
      'By using this app, I save both my research time and space. Everything I need to know about the matches is right here.',
  },
  {
    id: 6,
    name: 'John Bai',
    role: 'Plaid',
    avatar: 'https://i.pravatar.cc/150?u=6',
    content:
      "All my homies love Football UZ. I deleted all other sports apps and haven't looked back since. Shoutout to the dev team!",
  },
];

const HERO_TEXTS = [
  { heading: 'heroHeading1', sub: 'heroSub1' },
  { heading: 'heroHeading2', sub: 'heroSub2' },
  { heading: 'heroHeading3', sub: 'heroSub3' },
];

const STATS = [
  { key: 'statsTeams', value: '240+' },
  { key: 'statsMatches', value: '12,500+' },
  { key: 'statsPlayers', value: '3,800+' },
];

const VIDEO_CARDS = [
  {
    id: 1,
    src: '/videos/live-match.mp4',
    titleKey: 'videoCard1Title',
    descKey: 'videoCard1Desc',
  },
  {
    id: 2,
    src: '/videos/live-match2.mp4',
    titleKey: 'videoCard2Title',
    descKey: 'videoCard2Desc',
  },
];

function LiveTicker() {
  return (
    <div className={styles.tickerContainer}>
      <div className={styles.tickerTrack}>
        {[...MOCK_MATCH_CARDS, ...MOCK_MATCH_CARDS, ...MOCK_MATCH_CARDS].map(
          (match, i) => (
            <div key={i} className={styles.tickerItem}>
              <span className={styles.tickerLive}>
                {match.status === 'LIVE' ? '🔴 LIVE' : match.status}
              </span>
              <span>
                {match.homeTeam} {match.score} {match.awayTeam}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className={styles.langSwitcherContainer}>
      <button className={styles.langBtn} onClick={() => setIsOpen(!isOpen)}>
        <img src={`${currentLang.flag}`} alt="" className={styles.langFlag} />
        <span className={styles.langLabel}>
          {currentLang.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className={styles.langDropdown}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langItem} ${locale === lang.code ? styles.langActive : ''}`}
              onClick={() => switchLanguage(lang.code)}
            >
              <img src={`${lang.flag}`} alt="" className={styles.langFlag} />
              {/* <img className={styles.langFlag}>{lang.flag}</img> */}
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Infinite Slider ────────────────────────────────────────────────────────
function MatchSlider() {
  const [cards, setCards] = useState<string[]>([]);

  useEffect(() => {
    const arr: string[] = [];
    for (let i = 1; i <= 37; i++) {
      arr.push(`/images/img${i}.jpg`);
    }
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCards([...arr, ...arr]);
  }, []);

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderTrack}>
        {cards.map((card, i) => (
          <div key={`${i}-${i}`} className={styles.matchCard}>
            {/* 폰 목업 프레임 */}
            <img src={card} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AppPreviewCard({ card }: { card: AppCard }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // 350ms 비우는 딜레이 삭제하고 부드럽게 인덱스만 넘김
    const timer = setInterval(() => {
      setIdx((p) => (p + 1) % card.images.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [card.images.length]);

  return (
    <div className={styles.appCard}>
      {card.badge && <span className={styles.appCardBadge}>{card.badge}</span>}
      <div className={styles.phoneFrame}>
        <div className={styles.phoneNotchBar} />
        {/* 부모에 relative 주고 안에서 이미지를 겹치게 처리 */}
        <div className={styles.phoneContent} style={{ position: 'relative' }}>
          {card.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={card.title}
              className={styles.phoneImage}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: idx === i ? 1 : 0, // 현재 인덱스만 보이게
                transition: 'opacity 0.4s ease-in-out', // 스르륵 전환
                objectFit: 'cover', // 비율 깨짐 방지
              }}
            />
          ))}
        </div>
      </div>
      {/* 텍스트는 바뀌는 값이 아니므로 불필요한 깜빡임(fade) 클래스 제거 */}
      <div className={styles.appCardText}>
        <p className={styles.appCardTitle}>{card.title}</p>
        <p className={styles.appCardSub}>{card.sub}</p>
      </div>
    </div>
  );
}

// 스크롤 리빌 통계 (고급스러운 그라데이션 색상 변화 적용)
function ScrollRevealStatLine({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const start = winH;
      const end = winH * 0.4; // 화면 중앙 부근에서 가장 밝아짐
      const curr = rect.top;
      const p = Math.min(1, Math.max(0, (start - curr) / (start - end)));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 스크롤 진행도에 따라 텍스트 밝기 그라데이션 조절 (0 → 어두움, 1 → 순백색/글로우)
  const lightness = Math.round(40 + progress * 175); // 40 → 215
  const color = `rgb(${lightness}, ${lightness}, ${lightness})`;
  const textShadow =
    progress > 0.8
      ? `0 0 15px rgba(255,255,255,${(progress - 0.8) * 5})`
      : 'none';

  return (
    <p ref={ref} className={styles.statLine} style={{ color, textShadow }}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statKey}> {label}</span>
    </p>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const t = useTranslations('home');
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [browseTab, setBrowseTab] = useState<'matches' | 'teams' | ''>('');

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
      {/* 1. 상단 라이브 스코어 티커 */}
      <LiveTicker />
      {/* 화면 우측 상단 고정 헤더 영역 */}
      <header className={styles.topNav}>
        <div className={styles.logoTemp}>Football UZ</div>
        <LanguageSwitcher />
      </header>
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
      {/* ── NEW! FLOATING ORBITING TECH STACK (1번 디자인) ── */}
      <section className={styles.statsSection}>
        <div className={styles.orbitContainer}>
          {/* 중앙 코어 (앱 로고 & 글로우 효과) */}
          <div className={styles.orbitCore}>
            <img
              src="/images/app-logo.png"
              alt="Core"
              className={styles.coreLogo}
            />
            <div className={styles.coreGlow}></div>
          </div>

          {/* 기술 스택 아이콘 궤도 회전 */}
          {MOCK_ORBIT_ICONS.map((icon) => (
            <div
              key={icon.id}
              className={styles.orbitIconWrapper}
              style={{
                // 궤도 반지름과 시작 각도 설정
                width: `${icon.orbitRadius * 2}px`,
                height: `${icon.orbitRadius * 2}px`,
                // CSS Animation 속도와 딜레이로 각 아이콘 위치 조절
                animationDuration: `${30 / icon.speedFactor}s`,
                animationDelay: `-${(icon.angleOffset / 360) * (30 / icon.speedFactor)}s`,
              }}
            >
              <div
                className={styles.orbitIcon}
                style={{
                  color: icon.color,
                  boxShadow: `0 0 15px ${icon.color}44`, // 아이콘 자체에 은은한 글로우
                  animationDuration: `${30 / icon.speedFactor}s`, // 아이콘이 항상 정면을 바라보게 역회전
                  animationDelay: `-${(icon.angleOffset / 360) * (30 / icon.speedFactor)}s`,
                }}
              >
                <img style={{ width: 60, height: 70 }} src={icon.src} alt="" />
              </div>
            </div>
          ))}

          {/* 배경 궤도 라인 (시각적 보조) */}
          <div className={`${styles.orbitLine} ${styles.orbitLineInner}`}></div>
          <div className={`${styles.orbitLine} ${styles.orbitLineOuter}`}></div>
        </div>

        {/* 통계 텍스트 오버레이 */}
        <div className={styles.statsOverlay}>
          <p className={styles.statsLabel}>{t('statsLabel')}</p>
          {STATS.map(({ key, value }, i) => (
            <ScrollRevealStatLine key={key} value={value} label={t(key)} />
          ))}
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
      {/* ── VIDEO SHOWCASE ── */}
      <section className={styles.videoSection}>
        <h2 className={styles.videoTitle}>{t('videoTitle')}</h2>
        <p className={styles.videoSub}>{t('videoSub')}</p>
        <div className={styles.videoGrid}>
          {VIDEO_CARDS.map((card) => (
            <div key={card.id} className={styles.videoCard}>
              <div className={styles.videoWrap}>
                {card.src ? (
                  <video
                    src={card.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.videoEl}
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.videoPlayIcon}>▶</span>
                  </div>
                )}
              </div>
              <p className={styles.videoCardTitle}>{t(card.titleKey)}</p>
              <p className={styles.videoCardDesc}>{t(card.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
      {/* 4. 유저 리뷰 (신뢰도 상승) */}
      <section className={styles.testimonialSection}>
        <h2 className={styles.sectionTitle}>What our users are saying.</h2>
        <div className={styles.testimonialGrid}>
          {MOCK_TESTIMONIALS.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              {/* 프로필 영역 */}
              <div className={styles.authorInfo}>
                <img
                  src={review.avatar}
                  alt={review.name}
                  className={styles.avatar}
                />
                <div className={styles.authorText}>
                  <p className={styles.authorName}>{review.name}</p>
                  <p className={styles.authorRole}>{review.role}</p>
                </div>
              </div>
              {/* 리뷰 내용 */}
              <p className={styles.reviewContent}>{review.content}</p>
            </div>
          ))}
        </div>
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
