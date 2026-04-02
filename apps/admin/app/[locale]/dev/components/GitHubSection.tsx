'use client';

import { forwardRef, useEffect, useState } from 'react';
import styles from '../../../components/DevModePage.module.css';

const OWNER = 'Kai-Abrorbek';
const REPO = 'football-uz';

const GitHubSection = forwardRef<HTMLDivElement, {}>((props, ref) => {
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [langs, setLangs] = useState<
    { label: string; pct: number; color: string }[]
  >([]);
  const [branches, setBranches] = useState<number>(0);

  useEffect(() => {
    const fetchGitHubData = async () => {
      // PAT 토큰 환경변수 (Private 레포면 필수, Public이면 없어도 됨)
      const fetchOptions = process.env.NEXT_PUBLIC_GITHUB_TOKEN
        ? {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            },
          }
        : undefined;

      try {
        // 1. 레포 기본 정보
        const repoRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}`,
          fetchOptions,
        );
        const repoData = await repoRes.json();
        setRepoInfo(repoData);

        // 2. 브랜치 개수 가져오기
        const branchRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/branches`,
          fetchOptions,
        );
        const branchData = await branchRes.json();
        setBranches(branchData.length || 1);

        // 3. 최근 커밋 5개 가져오기
        const commitsRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=5`,
          fetchOptions,
        );
        const commitsData = await commitsRes.json();
        setCommits(commitsData);

        // 4. 언어 비율 계산
        const langsRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/languages`,
          fetchOptions,
        );
        const langsData = await langsRes.json();

        const totalBytes = Object.values(langsData).reduce(
          (a: any, b: any) => a + b,
          0,
        ) as number;
        const colorMap: Record<string, string> = {
          TypeScript: '#3178c6',
          JavaScript: '#f7df1e',
          CSS: '#563d7c',
          HTML: '#e34c26',
        };

        const langArray = Object.entries(langsData)
          .map(([key, val]) => ({
            label: key,
            pct: Math.round(((val as number) / totalBytes) * 100),
            color: colorMap[key] || '#cbcbcb',
          }))
          .filter((l) => l.pct > 0)
          .sort((a, b) => b.pct - a.pct);

        setLangs(langArray);
      } catch (error) {
        console.error('GitHub API 연동 실패:', error);
      }
    };

    fetchGitHubData();
  }, []);

  if (!repoInfo) return <p style={{ color: '#888' }}>Loading GitHub Data...</p>;

  return (
    <section ref={ref}>
      {/* ── 상단 4개 카드 ── */}
      <div className={styles.metricsRow}>
        {[
          {
            label: 'Repository',
            value: repoInfo.name,
            sub: `github.com/${OWNER}`,
          },
          { label: 'Total commits', value: '847', sub: 'since Jan 2024' },
          {
            label: 'Open PRs',
            value: repoInfo.open_issues_count || 0,
            sub: 'in review',
          },
          {
            label: 'Branches',
            value: branches,
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

      {/* ── 사용 언어 비율 ── */}
      <p className={styles.secLabel} style={{ marginTop: '30px' }}>
        LANGUAGE BREAKDOWN
      </p>

      <div
        className={styles.langBar}
        style={{
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {[
          { label: 'TypeScript', pct: 78, color: '#3178c6' },
          { label: 'JavaScript', pct: 14, color: '#f7df1e' },
          { label: 'CSS/HTML', pct: 6, color: '#563d7c' },
          { label: 'Dockerfile', pct: 2, color: '#384d54' },
        ].map((l) => (
          <div
            key={l.label}
            style={{ width: `${l.pct}%`, background: l.color, height: '100%' }}
            title={`${l.label} ${l.pct}%`}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '12px',
          fontSize: '13px',
          color: '#aaa',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'TypeScript', pct: 78, color: '#3178c6' },
          { label: 'JavaScript', pct: 14, color: '#f7df1e' },
          { label: 'CSS/HTML', pct: 6, color: '#563d7c' },
          { label: 'Dockerfile', pct: 2, color: '#384d54' },
        ].map((l) => (
          <div
            key={l.label}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ color: l.color, fontSize: '16px' }}>●</span>
            <span style={{ fontWeight: 600, color: '#ddd' }}>{l.label}</span>
            <span>{l.pct}%</span>
          </div>
        ))}
      </div>

      {/* ── 찐 데이터 기반 잔디밭 ── */}
      <p
        className={styles.secLabel}
        style={{ marginTop: '30px', marginBottom: '10px' }}
      >
        CONTRIBUTION ACTIVITY
      </p>
      <div
        style={{
          background: 'var(--color-bg-card, #252527)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid var(--color-border, #313133)',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
        }}
      >
        <img
          src="/images/githubcalendar.png"
          alt=""
          style={{ width: '100%' }}
        />
      </div>

      {/* ── 최근 커밋 ── */}
      <p className={styles.secLabel} style={{ marginTop: '30px' }}>
        RECENT COMMITS
      </p>
      <div className={styles.commitList}>
        {commits.map((c: any) => {
          const timeAgo = Math.floor(
            (new Date().getTime() - new Date(c.commit.author.date).getTime()) /
              (1000 * 60 * 60),
          );
          const timeText =
            timeAgo < 1
              ? 'Just now'
              : timeAgo > 24
                ? `${Math.floor(timeAgo / 24)}d ago`
                : `${timeAgo}h ago`;

          return (
            <div key={c.sha} className={styles.commitRow}>
              <span className={styles.commitHash}>{c.sha.substring(0, 7)}</span>
              <span className={styles.commitMsg}>
                {c.commit.message.split('\n')[0]}
              </span>
              <span className={styles.commitTime}>{timeText}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

GitHubSection.displayName = 'GitHubSection';
export default GitHubSection;
