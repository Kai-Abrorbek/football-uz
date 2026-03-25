import { useTranslations } from 'next-intl';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const t = useTranslations('Hero'); // messages 안의 'Hero' 객체 사용

  return (
    <section className={styles.hero}>
      <div className={styles.logoBox}>
        U<span style={{ color: '#111' }}>Z</span>
      </div>

      {/* 번역 파일에 있는 텍스트를 불러옴 */}
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.subtitle}>{t('subtitle')}</p>

      <div className={styles.buttonGroup}>
        <button className={styles.primaryBtn}>{t('download')}</button>
        <button className={styles.secondaryBtn}>{t('features')}</button>
      </div>
    </section>
  );
}
