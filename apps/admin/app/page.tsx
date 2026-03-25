'use client';

import { useEffect, useState } from 'react';
import { adminApi } from './lib/api';
import { PageLayout } from './admin/components/Layout';
import { StatCard } from './admin/components/ui/StatCard';
import { PageCard, SectionHeader } from './admin/components/ui/PageCard';
import { Pill } from 'lucide-react';
import { Toggle } from './admin/components/ui/Toggle';

interface DashboardData {
  stats: {
    liveMatches: number;
    streamingMatches: number;
    totalHighlights: number;
    totalUsers: number;
    todayMatches: number;
  };
  liveMatchList: {
    _id: string;
    homeTeam: { name?: string; logo?: string };
    awayTeam: { name?: string; logo?: string };
    goals?: { home: number | null; away: number | null };
    status?: { short?: string; elapsed?: number };
    league?: { name?: string };
    isStreaming: boolean;
  }[];
  recentUsers: {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    isEmailVerified: boolean;
  }[];
}

const formatUserCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (day > 0) return `${day}일 전`;
  if (hour > 0) return `${hour}시간 전`;
  return `${min}분 전`;
};

const TeamCell = ({ name, logo }: { name?: string; logo?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {logo ? (
      <img
        src={logo}
        alt={name}
        width={20}
        height={20}
        style={{ objectFit: 'contain' }}
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    ) : (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          background: 'var(--border2)',
          flexShrink: 0,
        }}
      />
    )}
    <span>{name ?? '—'}</span>
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getDashboard();
        setData(res.data);
      } catch {
        // 인터셉터가 처리
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <PageLayout title="대시보드">
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--muted2)',
            fontSize: 13,
          }}
        >
          불러오는 중...
        </div>
      </PageLayout>
    );
  }

  const stats = data?.stats;

  return (
    <PageLayout title="대시보드">
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}
      >
        <StatCard
          label="라이브 경기"
          value={String(stats?.liveMatches ?? 0)}
          sub="현재 진행 중"
          color="#FF3D57"
          iconPath="M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1z"
        />
        <StatCard
          label="스트리밍"
          value={String(stats?.streamingMatches ?? 0)}
          sub={`오늘 ${stats?.todayMatches ?? 0}경기 예정`}
          color="#00E5FF"
          iconPath="M10 8l6 4-6 4V8z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="하이라이트"
          value={String(stats?.totalHighlights ?? 0)}
          sub="총 업로드"
          color="#FFB800"
          iconPath="M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1z"
        />
        <StatCard
          label="총 유저"
          value={formatUserCount(stats?.totalUsers ?? 0)}
          sub="전체 가입자"
          color="#A78BFA"
          iconPath="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z"
        />
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <PageCard style={{ flex: 2, minWidth: 260 }}>
          <SectionHeader title="라이브 경기" />
          {!data?.liveMatchList?.length ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: 'var(--muted2)',
                fontSize: 12,
              }}
            >
              진행 중인 경기가 없습니다.
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>홈팀</th>
                    <th>스코어</th>
                    <th>어웨이팀</th>
                    <th>리그</th>
                    <th>스트리밍</th>
                  </tr>
                </thead>
                <tbody>
                  {data.liveMatchList.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <TeamCell
                          name={m.homeTeam.name}
                          logo={m.homeTeam.logo}
                        />
                      </td>
                      <td
                        className="mono"
                        style={{ color: 'var(--red)', fontWeight: 700 }}
                      >
                        {m.goals?.home ?? 0} : {m.goals?.away ?? 0}
                        {m.status?.elapsed && (
                          <span
                            style={{
                              fontSize: 9,
                              color: 'var(--muted2)',
                              marginLeft: 4,
                            }}
                          >
                            {m.status.elapsed}'
                          </span>
                        )}
                      </td>
                      <td>
                        <TeamCell
                          name={m.awayTeam.name}
                          logo={m.awayTeam.logo}
                        />
                      </td>
                      <td>
                        <Pill color="#6B7A99">{m.league?.name ?? '—'}</Pill>
                      </td>
                      <td>
                        <Toggle defaultOn={m.isStreaming} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>

        <PageCard style={{ flex: 1, minWidth: 200 }}>
          <SectionHeader title="최근 가입 유저" />
          {data?.recentUsers?.map((u, i) => (
            <div
              key={u._id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                paddingBottom: 12,
                marginBottom: 12,
                borderBottom:
                  i < data.recentUsers.length - 1
                    ? '1px solid var(--border)'
                    : 'none',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  background: u.isEmailVerified
                    ? 'var(--cyan)'
                    : 'var(--muted)',
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text)',
                    marginBottom: 3,
                  }}
                >
                  {u.username}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {timeAgo(u.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </PageCard>
      </div>
    </PageLayout>
  );
}
