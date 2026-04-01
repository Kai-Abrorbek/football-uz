'use client';

import styles from '../css/QuickLinks.module.css';

interface LinkItem {
  name: string;
  url: string;
  icon: string;
  desc: string;
}

const LINKS: LinkItem[] = [
  {
    name: 'GitHub Repo',
    url: 'https://github.com/kai/football-uz', // 네 실제 깃허브 주소로 변경
    icon: '🐙',
    desc: 'Source code & commits',
  },
  {
    name: 'Swagger API',
    url: 'https://api.footballuz.online/docs', // 실제 Swagger 주소로 변경
    icon: '📘',
    desc: 'REST API documentation',
  },
  {
    name: 'Admin Panel',
    url: 'https://admin.footballuz.online', // 관리자 페이지 주소
    icon: '⚙️',
    desc: 'CMS & Moderation',
  },
  {
    name: 'Download APK',
    url: 'https://footballuz.online/downloads/football-uz.apk', // 앱 다운로드 링크
    icon: '📱',
    desc: 'Latest Android build',
  },
];

export default function QuickLinks() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>QUICK LINKS</p>
      <div className={styles.grid}>
        {LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.icon}>{link.icon}</div>
            <div className={styles.textWrap}>
              <p className={styles.name}>{link.name}</p>
              <p className={styles.desc}>{link.desc}</p>
            </div>
            <span className={styles.arrow}>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
