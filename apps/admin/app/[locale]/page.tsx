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

// ── Mock data (will be replaced with server data) ──────────────────────────
const MOCK_FLOATING_ICONS: Omit<
  FloatingIcon,
  'x' | 'y' | 'speedX' | 'speedY'
>[] = [
  { id: 1, src: '⚽', label: 'Football', size: 56, color: '#1a1a1a' },
  { id: 2, src: '🏆', label: 'Trophy', size: 48, color: '#f5a623' },
  { id: 3, src: '🇺🇿', label: 'Uzbekistan', size: 52, color: '#1eb53a' },
  { id: 4, src: '📊', label: 'Stats', size: 44, color: '#0057b7' },
  { id: 5, src: '🎯', label: 'Goals', size: 50, color: '#e63946' },
  { id: 6, src: '🧤', label: 'Goalkeeper', size: 46, color: '#6a4c93' },
  { id: 7, src: '📱', label: 'Mobile', size: 48, color: '#2ec4b6' },
  { id: 8, src: '🔥', label: 'Hot', size: 44, color: '#ff6b35' },
  { id: 9, src: '⚡', label: 'Live', size: 42, color: '#f7c948' },
  { id: 10, src: '🌍', label: 'World Cup', size: 50, color: '#457b9d' },
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
  { key: 'statsTeams', value: '240+' },
  { key: 'statsMatches', value: '12,500+' },
  { key: 'statsPlayers', value: '3,800+' },
];

// ── Floating Icons Canvas ──────────────────────────────────────────────────
function FloatingIconsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // init icons
    iconsRef.current = MOCK_FLOATING_ICONS.map((icon) => ({
      ...icon,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      iconsRef.current.forEach((icon) => {
        icon.x += icon.speedX;
        icon.y += icon.speedY;
        if (icon.x < -icon.size) icon.x = canvas.width + icon.size;
        if (icon.x > canvas.width + icon.size) icon.x = -icon.size;
        if (icon.y < -icon.size) icon.y = canvas.height + icon.size;
        if (icon.y > canvas.height + icon.size) icon.y = -icon.size;

        // shadow glow
        ctx.shadowColor = icon.color + '55';
        ctx.shadowBlur = 20;

        // rounded rect bg
        const r = icon.size * 0.22;
        const s = icon.size;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(icon.x - s / 2, icon.y - s / 2, s, s, r);
        ctx.fill();

        ctx.shadowBlur = 0;

        // emoji
        ctx.font = `${icon.size * 0.55}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon.src, icon.x, icon.y);
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.floatingCanvas} />;
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const t = useTranslations('home');

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [browseTab, setBrowseTab] = useState<'matches' | 'teams' | 'players'>(
    'matches',
  );

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
          <span>⚽</span>
        </div>
        <div
          className={`${styles.heroText} ${heroFade ? styles.fadeIn : styles.fadeOut}`}
        >
          <h1 className={styles.heroHeading}>{t(currentHero.heading)}</h1>
          <p className={styles.heroSub}>{t(currentHero.sub)}</p>
        </div>
        <div className={styles.heroCta}>
          <button className={styles.ctaPrimary}>{t('ctaDownload')}</button>
          <button className={styles.ctaSecondary}>{t('ctaExplore')} →</button>
        </div>
      </section>

      {/* ── BROWSE / EXPLORE (2nd screenshot) ── */}
      <section className={styles.browseSection}>
        <div className={styles.browseHeader}>
          <div className={styles.browseNav}>
            {(['matches', 'teams', 'players'] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.browseTab} ${browseTab === tab ? styles.browseTabActive : ''}`}
                onClick={() => setBrowseTab(tab)}
              >
                {t(`tab_${tab}`)}
              </button>
            ))}
          </div>
          <div className={styles.browseSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className={styles.searchInput}
            />
          </div>
        </div>

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
      </section>

      {/* ── FLOATING ICONS + STATS (3rd screenshot) ── */}
      <section className={styles.statsSection}>
        <FloatingIconsSection />
        <div className={styles.statsOverlay}>
          <p className={styles.statsLabel}>{t('statsLabel')}</p>
          {STATS.map(({ key, value }) => (
            <p key={key} className={styles.statLine}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statKey}> {t(key)}</span>
            </p>
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
