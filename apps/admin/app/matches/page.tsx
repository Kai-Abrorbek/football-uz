'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader, SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';
import { Toggle } from '../components/ui/Toggle';
import { adminApi } from '../lib/api';

interface Match {
  _id: string;
  homeTeam: { name?: string; logo?: string };
  awayTeam: { name?: string; logo?: string };
  league?: { name?: string; round?: string };
  status?: { short?: string; elapsed?: number };
  goals?: { home: number | null; away: number | null };
  date: string;
  isStreaming: boolean;
  streamKey?: string;
  streamUrl?: string;
}

const STATUS_LABEL: Record<string, string> = {
  NS: '예정',
  '1H': 'LIVE',
  HT: '하프타임',
  '2H': 'LIVE',
  ET: 'LIVE',
  FT: '종료',
  AET: '종료',
  PEN: '종료',
  PST: '연기',
  CANC: '취소',
  TBD: 'TBD',
};

const STATUS_COLOR: Record<string, string> = {
  LIVE: '#FF3D57',
  하프타임: '#FFB800',
  예정: '#FFB800',
  종료: '#6B7A99',
  연기: '#6B7A99',
  취소: '#6B7A99',
  TBD: '#6B7A99',
};

const FILTERS = ['전체', '어제', '오늘', '이번주', '완료'];

const toDateString = (d: Date) => d.toISOString().split('T')[0];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchMatches = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getMatches(date);
      setMatches(res.data.matches);
      setTotal(res.data.total);
    } catch (err: any) {
      alert('경기 불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedDate(toDateString(new Date()));
  }, []);

  useEffect(() => {
    fetchMatches(undefined);
  }, [fetchMatches, selectedDate]);

  const handleFilterClick = (i: number) => {
    setFilter(i);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (i === 0) {
      setSelectedDate('');
      fetchMatches(undefined);
    } else if (i === 1) {
      const y = toDateString(yesterday);
      setSelectedDate(y);
      fetchMatches(y);
    } else if (i === 2) {
      const d = toDateString(today);
      setSelectedDate(d);
      fetchMatches(d);
    } else if (i === 3) {
      // 이번주 시작일
      const mon = new Date(today);
      mon.setDate(today.getDate() - today.getDay() + 1);
      const d = toDateString(mon);
      setSelectedDate(d);
      fetchMatches(d);
    } else if (i === 4) {
      setSelectedDate('');
      fetchMatches(undefined);
    }
  };

  const handleStreamingToggle = async (match: Match, val: boolean) => {
    try {
      await adminApi.setStreaming(match._id, {
        isStreaming: val,
        streamKey: match.streamKey,
      });
      setMatches((prev) =>
        prev.map((m) => (m._id === match._id ? { ...m, isStreaming: val } : m)),
      );
    } catch {
      alert('스트리밍 설정 실패');
    }
  };

  const getStatusLabel = (match: Match) => {
    const short = match.status?.short ?? 'NS';
    const base = STATUS_LABEL[short] ?? short;
    if (
      (short === '1H' || short === '2H' || short === 'ET') &&
      match.status?.elapsed
    ) {
      return `${match.status.elapsed}'`;
    }
    return base;
  };

  const getStatusColor = (match: Match) => {
    const label = STATUS_LABEL[match.status?.short ?? 'NS'] ?? '예정';
    return STATUS_COLOR[label] ?? '#6B7A99';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const filtered = matches.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.homeTeam.name?.toLowerCase().includes(q) ||
      m.awayTeam.name?.toLowerCase().includes(q) ||
      m.league?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <PageLayout title={`경기 관리 (${total})`}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <SearchBar
          placeholder="팀명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {FILTERS.map((f, i) => (
          <button
            key={f}
            onClick={() => handleFilterClick(i)}
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
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            fetchMatches(e.target.value);
          }}
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
        <SectionHeader title="경기 목록" />
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--muted2)',
              fontSize: 13,
            }}
          >
            불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--muted2)',
              fontSize: 13,
            }}
          >
            경기가 없습니다.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>홈팀</th>
                  <th>스코어</th>
                  <th>어웨이팀</th>
                  <th>리그</th>
                  <th>상태</th>
                  <th>스트리밍</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const statusLabel = getStatusLabel(m);
                  const statusColor = getStatusColor(m);
                  const isLive = ['1H', '2H', 'ET', 'HT'].includes(
                    m.status?.short ?? '',
                  );
                  return (
                    <tr key={m._id}>
                      <td className="mono" style={{ color: 'var(--muted2)' }}>
                        {formatDate(m.date)}
                      </td>
                      <td
                        className="mono"
                        style={{
                          color: isLive ? 'var(--red)' : 'var(--amber)',
                        }}
                      >
                        {formatTime(m.date)}
                      </td>
                      <td>
                        <strong>{m.homeTeam.name ?? '—'}</strong>
                      </td>
                      <td
                        className="mono"
                        style={{ color: 'var(--text)', fontWeight: 700 }}
                      >
                        {m.goals?.home ?? '—'} : {m.goals?.away ?? '—'}
                      </td>
                      <td>{m.awayTeam.name ?? '—'}</td>
                      <td>
                        <Pill color="#6B7A99">{m.league?.name ?? '—'}</Pill>
                      </td>
                      <td>
                        <Pill color={statusColor}>{statusLabel}</Pill>
                      </td>
                      <td>
                        <Toggle
                          defaultOn={m.isStreaming}
                          onChange={(val) => handleStreamingToggle(m, val)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </PageLayout>
  );
}
