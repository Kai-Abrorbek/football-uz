import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader, SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';

const TEAMS = [
  {
    name: 'Pakhtakor',
    league: 'UPL',
    c1: '#009900',
    c2: '#FFFFFF',
    players: 26,
  },
  {
    name: 'Lokomotiv',
    league: 'UPL',
    c1: '#CC0000',
    c2: '#000000',
    players: 24,
  },
  {
    name: 'Bunyodkor',
    league: 'UPL',
    c1: '#FF6600',
    c2: '#003399',
    players: 25,
  },
  { name: 'Nasaf', league: 'UPL', c1: '#336600', c2: '#FFFFFF', players: 23 },
  { name: 'AGMK', league: 'UPL', c1: '#FFD700', c2: '#000080', players: 22 },
];

export default function TeamsPage() {
  return (
    <PageLayout title="팀 관리">
      <SearchBar placeholder="팀 검색..." />
      <PageCard>
        <SectionHeader title="팀 목록" action="+ 팀 추가" />
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>팀명</th>
                <th>리그</th>
                <th>주 색상</th>
                <th>보조 색상</th>
                <th>선수 수</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {TEAMS.map((t, i) => (
                <tr key={i}>
                  <td>
                    <strong>{t.name}</strong>
                  </td>
                  <td>
                    <Pill color="#6B7A99">{t.league}</Pill>
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: t.c1,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: 'var(--muted2)',
                        }}
                      >
                        {t.c1}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: t.c2,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: 'var(--muted2)',
                        }}
                      >
                        {t.c2}
                      </span>
                    </div>
                  </td>
                  <td>{t.players}명</td>
                  <td>
                    <button
                      style={{
                        background: 'transparent',
                        color: 'var(--cyan)',
                        border: '1px solid rgba(0,229,255,0.25)',
                        borderRadius: 5,
                        padding: '3px 10px',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </PageLayout>
  );
}
