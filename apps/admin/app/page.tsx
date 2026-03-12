import { PageLayout } from './components/Layout';
import { StatCard } from './components/ui/StatCard';
import { PageCard, SectionHeader } from './components/ui/PageCard';
import { Toggle } from './components/ui/Toggle';
import { Pill } from './components/ui/Pill';

const SCHEDULE = [
  {
    time: '14:00',
    home: 'Pakhtakor',
    away: 'Navbahor',
    league: 'UPL',
    on: true,
  },
  {
    time: '16:30',
    home: 'Lokomotiv',
    away: 'Bunyodkor',
    league: 'UPL',
    on: true,
  },
  { time: '19:00', home: 'AGMK', away: 'Nasaf', league: 'UPL', on: false },
  {
    time: '21:00',
    home: 'Sogdiana',
    away: 'Metallurg',
    league: 'UPL',
    on: false,
  },
];

const NOTIF_LOG = [
  { msg: 'UPL 라운드 12 시작!', time: '2시간 전', color: 'var(--cyan)' },
  {
    msg: 'Pakhtakor 하이라이트 업로드',
    time: '5시간 전',
    color: 'var(--amber)',
  },
  { msg: '신규 유저 인증 완료 안내', time: '1일 전', color: 'var(--purple)' },
];

export default function DashboardPage() {
  return (
    <PageLayout title="대시보드">
      {/* Stat Cards */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}
      >
        <StatCard
          label="라이브 경기"
          value="3"
          sub="현재 진행 중"
          color="#FF3D57"
          iconPath="M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1z"
        />
        <StatCard
          label="스트리밍"
          value="3"
          sub="12,847 시청자"
          color="#00E5FF"
          iconPath="M10 8l6 4-6 4V8z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="하이라이트"
          value="148"
          sub="오늘 +7 업로드"
          color="#FFB800"
          iconPath="M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1z"
        />
        <StatCard
          label="총 유저"
          value="24.1k"
          sub="이번 주 +312명"
          color="#A78BFA"
          iconPath="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z"
        />
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* 경기 일정 */}
        <PageCard style={{ flex: 2, minWidth: 260 }}>
          <SectionHeader title="오늘의 경기 일정" action="전체 보기" />
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>시간</th>
                  <th>홈팀</th>
                  <th>어웨이팀</th>
                  <th>리그</th>
                  <th>스트리밍</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULE.map((row, i) => (
                  <tr key={i}>
                    <td className="mono" style={{ color: 'var(--amber)' }}>
                      {row.time}
                    </td>
                    <td>{row.home}</td>
                    <td>{row.away}</td>
                    <td>
                      <Pill color="#6B7A99">{row.league}</Pill>
                    </td>
                    <td>
                      <Toggle defaultOn={row.on} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>

        {/* 알림 이력 */}
        <PageCard style={{ flex: 1, minWidth: 200 }}>
          <SectionHeader title="최근 알림 발송" />
          {NOTIF_LOG.map((n, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                paddingBottom: 12,
                marginBottom: 12,
                borderBottom:
                  i < NOTIF_LOG.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  background: n.color,
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
                  {n.msg}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {n.time}
                </div>
              </div>
            </div>
          ))}
        </PageCard>
      </div>
    </PageLayout>
  );
}
