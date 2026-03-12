'use client';

import { useState } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';

const INIT_STREAMS = [
  {
    team: 'Pakhtakor vs Navbahor',
    viewers: '8,241',
    quality: '1080p',
    uptime: '01:24:33',
    url: 'rtmp://live.footballuz.uz/stream1',
    alive: true,
  },
  {
    team: 'Lokomotiv vs Bunyodkor',
    viewers: '3,892',
    quality: '720p',
    uptime: '00:51:17',
    url: 'rtmp://live.footballuz.uz/stream2',
    alive: true,
  },
  {
    team: 'AGMK vs Nasaf',
    viewers: '714',
    quality: '480p',
    uptime: '00:08:02',
    url: 'rtmp://live.footballuz.uz/stream3',
    alive: true,
  },
];

const LOGS = [
  {
    time: '14:02:11',
    event: '스트림 시작',
    match: 'Pakhtakor vs Navbahor',
    status: '성공',
    color: '#00E5FF',
  },
  {
    time: '14:01:58',
    event: 'RTMP 연결',
    match: 'Pakhtakor vs Navbahor',
    status: '성공',
    color: '#00E5FF',
  },
  {
    time: '12:30:05',
    event: '스트림 종료',
    match: 'Nasaf vs AGMK',
    status: '정상종료',
    color: '#6B7A99',
  },
  {
    time: '12:15:22',
    event: '화질 저하 감지',
    match: 'Nasaf vs AGMK',
    status: '경고',
    color: '#FFB800',
  },
];

export default function StreamingPage() {
  const [streams, setStreams] = useState(INIT_STREAMS);

  const toggle = (i: number) =>
    setStreams((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, alive: !s.alive } : s)),
    );

  return (
    <PageLayout title="스트리밍">
      {/* Stream Cards */}
      <div
        style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}
      >
        {streams.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 180,
              background: 'var(--card)',
              border: `1px solid ${s.alive ? 'rgba(255,61,87,0.35)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Pill color={s.alive ? '#FF3D57' : '#6B7A99'}>
                {s.alive ? '● LIVE' : '중단됨'}
              </Pill>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--muted2)',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {s.uptime}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              {s.team}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                marginBottom: 10,
                wordBreak: 'break-all',
              }}
            >
              {s.url}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--muted2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 2,
                  }}
                >
                  시청자
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {s.alive ? s.viewers : '—'}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--muted2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 2,
                  }}
                >
                  화질
                </div>
                <div
                  style={{
                    color: 'var(--cyan)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {s.quality}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggle(i)}
              style={{
                width: '100%',
                borderRadius: 7,
                padding: '8px 0',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                border: '1px solid',
                background: s.alive
                  ? 'rgba(255,61,87,0.12)'
                  : 'rgba(0,229,255,0.08)',
                color: s.alive ? 'var(--red)' : 'var(--cyan)',
                borderColor: s.alive
                  ? 'rgba(255,61,87,0.3)'
                  : 'rgba(0,229,255,0.25)',
              }}
            >
              {s.alive ? '⏹ 스트리밍 중단' : '▶ 재시작'}
            </button>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <PageCard>
        <SectionHeader title="스트리밍 로그" />
        <table>
          <thead>
            <tr>
              <th>시간</th>
              <th>이벤트</th>
              <th>경기</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {LOGS.map((l, i) => (
              <tr key={i}>
                <td
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--muted2)' }}
                >
                  {l.time}
                </td>
                <td>{l.event}</td>
                <td>{l.match}</td>
                <td>
                  <Pill color={l.color}>{l.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageCard>
    </PageLayout>
  );
}
