'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';
import { adminApi } from '../lib/api';

interface StreamMatch {
  _id: string;
  homeTeam: { name?: string; logo?: string };
  awayTeam: { name?: string; logo?: string };
  isStreaming: boolean;
  streamKey?: string;
  streamUrl?: string;
  status?: { short?: string; elapsed?: number };
}

export default function StreamingPage() {
  const [streams, setStreams] = useState<StreamMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    try {
      const res = await adminApi.getStreamingMatches();
      setStreams(res.data);
    } catch {
      // 인터셉터가 처리
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const handleToggle = async (match: StreamMatch) => {
    try {
      await adminApi.setStreaming(match._id, {
        isStreaming: !match.isStreaming,
        streamKey: match.streamKey,
      });
      setStreams((prev) =>
        prev.map((s) =>
          s._id === match._id ? { ...s, isStreaming: !s.isStreaming } : s,
        ),
      );
    } catch {
      alert('스트리밍 설정 실패');
    }
  };

  return (
    <PageLayout title="스트리밍">
      {loading ? (
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
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            {streams.length === 0 ? (
              <div
                style={{
                  color: 'var(--muted2)',
                  fontSize: 13,
                  padding: '20px 0',
                }}
              >
                스트리밍 중인 경기가 없습니다.
              </div>
            ) : (
              streams.map((s) => (
                <div
                  key={s._id}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    background: 'var(--card)',
                    border: `1px solid ${s.isStreaming ? 'rgba(255,61,87,0.35)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Pill color={s.isStreaming ? '#FF3D57' : '#6B7A99'}>
                      {s.isStreaming ? '● LIVE' : '중단됨'}
                    </Pill>
                    {s.status?.elapsed && (
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--muted2)',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {s.status.elapsed}'
                      </span>
                    )}
                  </div>

                  {/* 팀 로고 + 이름 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {/* 홈팀 */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      {s.homeTeam.logo ? (
                        <img
                          src={s.homeTeam.logo}
                          alt={s.homeTeam.name}
                          width={32}
                          height={32}
                          style={{ objectFit: 'contain' }}
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            background: 'var(--border2)',
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: 'center',
                          color: 'var(--text)',
                        }}
                      >
                        {s.homeTeam.name ?? '?'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--muted2)',
                        fontWeight: 600,
                      }}
                    >
                      vs
                    </span>

                    {/* 어웨이팀 */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      {s.awayTeam.logo ? (
                        <img
                          src={s.awayTeam.logo}
                          alt={s.awayTeam.name}
                          width={32}
                          height={32}
                          style={{ objectFit: 'contain' }}
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            background: 'var(--border2)',
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: 'center',
                          color: 'var(--text)',
                        }}
                      >
                        {s.awayTeam.name ?? '?'}
                      </span>
                    </div>
                  </div>

                  {s.streamUrl && (
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--muted)',
                        marginBottom: 10,
                        wordBreak: 'break-all',
                      }}
                    >
                      {s.streamUrl}
                    </div>
                  )}
                  {s.streamKey && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: 'var(--muted2)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 2,
                        }}
                      >
                        스트림 키
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--cyan)',
                        }}
                      >
                        {s.streamKey}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleToggle(s)}
                    style={{
                      width: '100%',
                      borderRadius: 7,
                      padding: '8px 0',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      border: '1px solid',
                      background: s.isStreaming
                        ? 'rgba(255,61,87,0.12)'
                        : 'rgba(0,229,255,0.08)',
                      color: s.isStreaming ? 'var(--red)' : 'var(--cyan)',
                      borderColor: s.isStreaming
                        ? 'rgba(255,61,87,0.3)'
                        : 'rgba(0,229,255,0.25)',
                    }}
                  >
                    {s.isStreaming ? '⏹ 스트리밍 중단' : '▶ 재시작'}
                  </button>
                </div>
              ))
            )}
          </div>

          <PageCard>
            <SectionHeader title="스트리밍 로그" />
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: 'var(--muted2)',
                fontSize: 12,
              }}
            >
              로그 기능은 추후 구현 예정입니다.
            </div>
          </PageCard>
        </>
      )}
    </PageLayout>
  );
}
