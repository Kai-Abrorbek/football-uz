'use client';

import { useState } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader, SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';
import { Toggle } from '../components/ui/Toggle';

const MATCHES = [
  {
    date: '03/12',
    time: '14:00',
    home: 'Pakhtakor',
    away: 'Navbahor',
    league: 'UPL',
    status: 'LIVE',
    on: true,
  },
  {
    date: '03/12',
    time: '16:30',
    home: 'Lokomotiv',
    away: 'Bunyodkor',
    league: 'UPL',
    status: 'LIVE',
    on: true,
  },
  {
    date: '03/12',
    time: '19:00',
    home: 'AGMK',
    away: 'Nasaf',
    league: 'UPL',
    status: '예정',
    on: false,
  },
  {
    date: '03/11',
    time: '18:00',
    home: 'Sogdiana',
    away: 'Metallurg',
    league: 'UPL',
    status: '종료',
    on: false,
  },
  {
    date: '03/11',
    time: '20:30',
    home: 'Nasaf',
    away: 'AGMK',
    league: 'AFC',
    status: '종료',
    on: false,
  },
];

const STATUS_COLOR: Record<string, string> = {
  LIVE: '#FF3D57',
  예정: '#FFB800',
  종료: '#6B7A99',
};

const FILTERS = ['전체', '오늘', '이번주', '완료'];

export default function MatchesPage() {
  const [filter, setFilter] = useState(0);

  return (
    <PageLayout title="경기 관리">
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <SearchBar placeholder="팀명 검색..." />
        {FILTERS.map((f, i) => (
          <button
            key={f}
            onClick={() => setFilter(i)}
            style={{
              background: filter === i ? 'var(--cyan)' : 'var(--card)',
              color: filter === i ? 'var(--bg)' : 'var(--muted2)',
              border: `1px solid ${filter === i ? 'var(--cyan)' : 'var(--border2)'}`,
              borderRadius: 6,
              padding: '6px 13px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {f}
          </button>
        ))}
        <input
          type="date"
          defaultValue="2026-03-12"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 6,
            padding: '6px 10px',
            color: 'var(--text)',
            fontSize: 11,
            outline: 'none',
          }}
        />
      </div>

      <PageCard>
        <SectionHeader title="경기 목록" action="+ 경기 추가" />
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>홈팀</th>
                <th>어웨이팀</th>
                <th>리그</th>
                <th>상태</th>
                <th>스트리밍</th>
                <th>편집</th>
              </tr>
            </thead>
            <tbody>
              {MATCHES.map((m, i) => (
                <tr key={i}>
                  <td className="mono" style={{ color: 'var(--muted2)' }}>
                    {m.date}
                  </td>
                  <td
                    className="mono"
                    style={{
                      color:
                        m.status === '종료' ? 'var(--muted2)' : 'var(--amber)',
                    }}
                  >
                    {m.time}
                  </td>
                  <td>
                    <strong>{m.home}</strong>
                  </td>
                  <td>{m.away}</td>
                  <td>
                    <Pill color="#6B7A99">{m.league}</Pill>
                  </td>
                  <td>
                    <Pill color={STATUS_COLOR[m.status]}>{m.status}</Pill>
                  </td>
                  <td>
                    <Toggle defaultOn={m.on} />
                  </td>
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
