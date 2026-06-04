'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import styles from '../components/page.module.css';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import {
  Activity,
  BarChart2,
  Bell,
  Trophy,
  Users,
  Globe,
  Apple,
  Play,
} from 'lucide-react';
import { CodeButton } from './dev/components/CodeButton';

const LANGUAGES = [
  { code: 'uz', label: "O'zbek", flag: '/uzb-flag.svg' },
  { code: 'en', label: 'English', flag: '/eng-flag.svg' },
  { code: 'ko', label: '한국어', flag: '/kr-flag.svg' },
];

const STATS = [
  { value: '240+', labelKey: 'statsTeams' },
  { value: '12,500+', labelKey: 'statsMatches' },
  { value: '3,800+', labelKey: 'statsPlayers' },
  { value: '4.8★', labelKey: 'appRating' },
];

const STATS_SECTION = [
  { value: '5,000+', labelKey: 'statsUsers' },
  { value: '240+', labelKey: 'statsTeams' },
  { value: '20', labelKey: 'statsLeagues' },
  { value: '99%', labelKey: 'statsCoverage' },
];

const FEAT_ICONS = [Activity, BarChart2, Bell, Trophy, Users, Globe];

const FEATURES = [
  { titleKey: 'feat1Title', descKey: 'feat1Desc' },
  { titleKey: 'feat2Title', descKey: 'feat2Desc' },
  { titleKey: 'feat3Title', descKey: 'feat3Desc' },
  { titleKey: 'feat4Title', descKey: 'feat4Desc' },
  { titleKey: 'feat5Title', descKey: 'feat5Desc' },
  { titleKey: 'feat6Title', descKey: 'feat6Desc' },
];

const HERO_TEXTS = [
  { heading: 'heroHeading1', sub: 'heroSub1' },
  { heading: 'heroHeading2', sub: 'heroSub2' },
  { heading: 'heroHeading3', sub: 'heroSub3' },
];

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Jasur Toshmatov',
    role: 'Toshkent',
    avatar: 'https://i.pravatar.cc/150?u=uz1',
    content:
      "Football UZ — bu mening uchun eng yaxshi ilova. Har bir o'yinni real vaqtda kuzatib boraman. Juda qulay!",
  },
  {
    id: 2,
    name: 'Dilnoza Yusupova',
    role: 'Samarqand',
    avatar: 'https://i.pravatar.cc/150?u=uz2',
    content:
      "Paxtakor o'yinlarini kuzatish uchun har doim shu ilovani ishlataman. Natijalar juda tez yangilanadi.",
  },
  {
    id: 3,
    name: 'Bobur Rahimov',
    role: 'Namangan',
    avatar: 'https://i.pravatar.cc/150?u=uz3',
    content:
      "Milliy jamoamizning barcha o'yinlarini bu ilova orqali kuzatdim. Dizayni ham juda chiroyli!",
  },
  {
    id: 4,
    name: 'Zulfiya Karimova',
    role: 'Andijon',
    avatar: 'https://i.pravatar.cc/150?u=uz4',
    content:
      'Super Liga jadvalini va natijalarini kuzatish uchun eng qulay ilova. Har kuni ishlataman.',
  },
  {
    id: 5,
    name: 'Sherzod Mirzayev',
    role: 'Buxoro',
    avatar: 'https://i.pravatar.cc/150?u=uz5',
    content:
      "O'yin bashorat qilish funksiyasi juda zo'r! Do'stlarim bilan musobaqalashamiz kim to'g'ri topishini.",
  },
  {
    id: 6,
    name: 'Feruza Nazarova',
    role: "Farg'ona",
    avatar: 'https://i.pravatar.cc/150?u=uz6',
    content:
      "Ilova juda tez ishlaydi va ma'lumotlar doimo to'g'ri. Futbol muxlisi bo'lsangiz, bu ilovasiz bo'lmaydi!",
  },
];

const NAV_ITEMS = [
  { labelKey: 'navFeatures', id: 'features' },
  { labelKey: 'navScreenshots', id: 'screenshots' },
  { labelKey: 'navReviews', id: 'reviews' },
  { labelKey: 'navDownload', id: 'download' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function Toast({
  message,
  sub,
  onClose,
}: {
  message: string;
  sub: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <div className={styles.toastIcon}>🚀</div>
      <div>
        <p className={styles.toastTitle}>{message}</p>
        <p className={styles.toastSub}>{sub}</p>
      </div>
      <button className={styles.toastClose} onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

function useCountUp(target: number, duration = 1200, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const iv = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(iv);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(iv);
  }, [active, target, duration]);
  return count;
}

function StatCard({
  value,
  labelKey,
  active,
}: {
  value: string;
  labelKey: string;
  active: boolean;
}) {
  const t = useTranslations('home');
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.,]/g, '');
  const count = useCountUp(numericPart, 1200, active);
  const display = isNaN(numericPart)
    ? value
    : `${count.toLocaleString()}${suffix}`;

  return (
    <div
      className={`${styles.statCard} ${active ? styles.statCardVisible : ''}`}
    >
      <span className={styles.statCardValue}>{display}</span>
      <span className={styles.statCardLabel}>{t(labelKey)}</span>
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
    <div className={styles.langSwitcher}>
      <button className={styles.langBtn} onClick={() => setIsOpen(!isOpen)}>
        <img src={currentLang.flag} alt="" className={styles.langFlag} />
        <span>{currentLang.code.toUpperCase()}</span>
        <span className={styles.langChevron}>▾</span>
      </button>
      {isOpen && (
        <div className={styles.langDropdown}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langItem} ${locale === lang.code ? styles.langActive : ''}`}
              onClick={() => switchLanguage(lang.code)}
            >
              <img src={lang.flag} alt="" className={styles.langFlag} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveTicker() {
  const ITEMS = [
    "🔴 LIVE · Pakhtakor 1 – 1 Bunyodkor · 67'",
    '⚪ FT · Uzbekistan 2 – 1 South Korea',
    "🔴 LIVE · Lokomotiv 2 – 2 Dynamo · 45'",
    '⚪ FT · Nasaf 3 – 0 Sogdiana',
    '⚪ FT · Uzbekistan 1 – 0 Saudi Arabia',
    '🕐 TBD · Uzbekistan vs Iran · Mar 28',
  ];

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerInner}>
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className={styles.tickerItem}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MatchSlider() {
  const [cards, setCards] = useState<string[]>([]);

  useEffect(() => {
    const arr: string[] = [];
    for (let i = 1; i <= 37; i++) arr.push(`/images/img${i}.jpg`);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCards([...arr, ...arr]);
  }, []);

  return (
    <div className={styles.sliderWrap}>
      <div className={styles.sliderTrack}>
        {cards.map((src, i) => (
          <div key={i} className={styles.sliderCard}>
            <img src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [statsActive, setStatsActive] = useState(false);
  const [toast, setToast] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const rauter = useRouter();
  useEffect(() => {
    const iv = setInterval(() => {
      setHeroFade(false);
      setTimeout(() => {
        setHeroIdx((p) => (p + 1) % HERO_TEXTS.length);
        setHeroFade(true);
      }, 350);
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsActive(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const hero = HERO_TEXTS[heroIdx];

  return (
    <main className={styles.main}>
      {toast && (
        <Toast
          message={t('downloadComingSoon')}
          sub={t('downloadComingSoonDesc')}
          onClose={() => setToast(false)}
        />
      )}
      <CodeButton onClick={() => rauter.push('/dev')} />

      <LiveTicker />

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navLogo}>
            <span className={styles.navLogoText}>Football</span>
            <span className={styles.navLogoAccent}>.UZ</span>
          </a>
          <div className={styles.navLinks}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={styles.navLink}
                onClick={() => scrollTo(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
          <div className={styles.navRight}>
            <LanguageSwitcher />
            <button
              className={styles.navCta}
              onClick={() =>
                window.open(
                  'https://footballuz.online/downloads/football-uz.apk',
                  '_blank',
                )
              }
            >
              {t('navCta')}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>⚽ {t('heroBadge')}</div>
          <div
            className={`${styles.heroTextWrap} ${heroFade ? styles.fadeIn : styles.fadeOut}`}
          >
            <h1 className={styles.heroHeading}>
              {t(hero.heading)
                .split('\n')
                .map((line, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <em className={styles.heroAccent}>{line}</em>
                    ) : (
                      line
                    )}
                    {i === 0 && <br />}
                  </span>
                ))}
            </h1>
            <p className={styles.heroSub}>{t(hero.sub)}</p>
          </div>
          <div className={styles.heroCtas}>
            <button
              className={styles.ctaPrimary}
              onClick={() =>
                window.open(
                  'https://footballuz.online/downloads/football-uz.apk',
                  '_blank',
                )
              }
            >
              {t('ctaMain')}
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => scrollTo('features')}
            >
              {t('ctaHow')}
            </button>
          </div>
          <div className={styles.heroStats}>
            {STATS.map((s) => (
              <div key={s.labelKey} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{s.value}</span>
                <span className={styles.heroStatLabel}>{t(s.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.phonesWrap}>
            <div className={`${styles.phoneFrame} ${styles.phoneBack}`}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>
                <img
                  src="/images/img48.jpg"
                  alt=""
                  className={styles.phoneImg}
                />
              </div>
              <div className={styles.phoneHomeBar} />
            </div>
            <div className={`${styles.phoneFrame} ${styles.phoneFront}`}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>
                <img
                  src="/images/img39.jpg"
                  alt=""
                  className={styles.phoneImg}
                />
              </div>
              <div className={styles.phoneHomeBar} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={styles.sectionInner}>
          <h2 className={styles.statsSectionTitle}>{t('statsTitle')}</h2>
          <div className={styles.statsGrid}>
            {STATS_SECTION.map((s) => (
              <StatCard
                key={s.labelKey}
                value={s.value}
                labelKey={s.labelKey}
                active={statsActive}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>{t('featSectionEyebrow')}</p>
          <h2 className={styles.sectionTitle}>{t('featSectionTitle')}</h2>
          <p className={styles.sectionSub}>{t('featSectionSub')}</p>
          <div className={styles.featGrid}>
            {FEATURES.map((f, idx) => {
              const Icon = FEAT_ICONS[idx];
              return (
                <div key={f.titleKey} className={styles.featCard}>
                  <div className={styles.featIconWrap}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.featTitle}>{t(f.titleKey)}</h3>
                  <p className={styles.featDesc}>{t(f.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className={styles.screenshots} id="screenshots">
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>{t('screenshotsEyebrow')}</p>
          <h2 className={styles.sectionTitle}>{t('sliderTitle')}</h2>
        </div>
        <MatchSlider />
      </section>

      {/* VIDEO */}
      <section className={styles.videoSection}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>{t('videoEyebrow')}</p>
          <h2 className={styles.sectionTitle}>{t('videoTitle')}</h2>
          <p className={styles.sectionSub}>{t('videoSub')}</p>
          <div className={styles.videoGrid}>
            <div className={styles.videoCard}>
              <video
                src="/videos/live-match.mp4"
                autoPlay
                muted
                loop
                playsInline
                className={styles.videoEl}
              />
            </div>
            <div className={styles.videoCard}>
              <video
                src="/videos/live-match2.mp4"
                autoPlay
                muted
                loop
                playsInline
                className={styles.videoEl}
              />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className={styles.reviews} id="reviews">
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>{t('reviewsEyebrow')}</p>
          <h2 className={styles.sectionTitle}>{t('reviewsTitle')}</h2>
          <div className={styles.reviewGrid}>
            {MOCK_TESTIMONIALS.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewStars}>★★★★★</div>
                <p className={styles.reviewContent}>{r.content}</p>
                <div className={styles.reviewAuthor}>
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className={styles.reviewAvatar}
                  />
                  <div>
                    <p className={styles.reviewName}>{r.name}</p>
                    <p className={styles.reviewRole}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <section className={styles.downloadSection} id="download">
        <div className={styles.downloadCard}>
          <div className={styles.downloadIconWrap}>
            <Activity size={28} color="#E8723A" strokeWidth={1.8} />
          </div>
          <h2 className={styles.downloadTitle}>
            {t('downloadTitle')}{' '}
            <span className={styles.downloadTitleAccent}>
              {t('downloadTitleAccent')}
            </span>
          </h2>
          <p className={styles.downloadSub}>{t('downloadSub')}</p>
          <div className={styles.downloadBtns}>
            <button className={styles.storeBtn} onClick={() => setToast(true)}>
              <Apple size={24} strokeWidth={1.5} />
              <div className={styles.storeBtnText}>
                <span className={styles.storeBtnLabel}>DOWNLOAD ON THE</span>
                <span className={styles.storeBtnName}>App Store</span>
              </div>
            </button>
            <button
              className={styles.storeBtn}
              onClick={() =>
                window.open(
                  'https://footballuz.online/downloads/football-uz.apk',
                  '_blank',
                )
              }
            >
              <Play size={20} strokeWidth={1.5} fill="currentColor" />
              <div className={styles.storeBtnText}>
                <span className={styles.storeBtnLabel}>GET IT ON</span>
                <span className={styles.storeBtnName}>Google Play</span>
              </div>
            </button>
          </div>
          <p className={styles.downloadNote}>
            Android APK {t('navDownload')} →{' '}
            <a
              href="https://footballuz.online/downloads/football-uz.apk"
              className={styles.downloadNoteLink}
            >
              footballuz.online
            </a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoText}>Football</span>
              <span className={styles.footerLogoAccent}>.UZ</span>
            </div>
            <p className={styles.footerTagline}>{t('footerDesc')}</p>
            <div className={styles.footerSocials}>
              <a
                href="https://t.me/footballuz"
                target="_blank"
                rel="noreferrer"
                className={styles.socialBtn}
              >
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
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('footerApp')}</p>
            <a href="#" className={styles.footerLink}>
              {t('footerLiveScores')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerTeams')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerPlayers')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerStandings')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerFixtures')}
            </a>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('footerCompany')}</p>
            <a href="#" className={styles.footerLink}>
              {t('footerAbout')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerBlog')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerCareers')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerPress')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerContact')}
            </a>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('footerSupport')}</p>
            <a href="#" className={styles.footerLink}>
              {t('footerHelpCenter')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerPrivacy')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerTerms')}
            </a>
            <a href="#" className={styles.footerLink}>
              {t('footerCookiePolicy')}
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            {t('footerCopyright')} {t('footerRights')}
          </p>
          <div className={styles.footerBottomLinks}>
            <a href="#">{t('footerPrivacy')}</a>
            <a href="#">{t('footerTerms')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
