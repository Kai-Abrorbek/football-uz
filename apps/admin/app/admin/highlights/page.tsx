'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageLayout } from '../../components/Layout';
import { SearchBar } from '../../components/ui/PageCard';
import { Pill } from '../../components/ui/Pill';
import { adminApi } from '../../lib/api';

interface Highlight {
  _id: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  duration?: string;
  publishedAt?: string;
  matchId?: string;
  match?: {
    homeTeam: { name: string };
    awayTeam: { name: string };
  } | null;
  createdAt: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

const getMatchLabel = (h: Highlight) => {
  const match = h.matchId as any;
  if (!match || typeof match === 'string') return '—';
  return `${match.homeTeam?.name} vs ${match.awayTeam?.name}`;
};

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHighlights = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getHighlights(p);
      const data = res.data;
      if (p === 1) {
        setHighlights(data.items);
      } else {
        setHighlights((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(p);
    } catch {
      alert('하이라이트 불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlights(1);
  }, [fetchHighlights]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminApi.deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h._id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert('삭제 실패');
    }
  };

  const handleYoutube = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const filtered = highlights.filter(
    (h) =>
      h.title?.toLowerCase().includes(search.toLowerCase()) ||
      getMatchLabel(h).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageLayout title={`하이라이트 (${total})`}>
      <SearchBar
        placeholder="하이라이트 검색..."
        value={search ?? ''}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && page === 1 ? (
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
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--muted2)',
            fontSize: 13,
          }}
        >
          하이라이트가 없습니다.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
              gap: 12,
            }}
          >
            {filtered.map((h) => (
              <div
                key={h._id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    height: 105,
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #1a2035, #0f1520)',
                  }}
                >
                  {h.thumbnail ? (
                    <img
                      src={h.thumbnail}
                      alt={h.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          background: 'rgba(255,61,87,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FF3D57"
                          strokeWidth={2}
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {h.duration && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        left: 8,
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                      }}
                    >
                      {h.duration}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 6, right: 8 }}>
                    <Pill color="#FFB800">{formatDate(h.publishedAt)}</Pill>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '11px 13px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {h.title || '제목 없음'}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--muted2)',
                      marginBottom: 10,
                    }}
                  >
                    {getMatchLabel(h)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleYoutube(h.videoId)}
                      style={{
                        flex: 1,
                        borderRadius: 5,
                        padding: '5px 0',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        border: '1px solid rgba(0,229,255,0.25)',
                        background: 'rgba(0,229,255,0.08)',
                        color: 'var(--cyan)',
                      }}
                    >
                      YouTube
                    </button>
                    <button
                      onClick={() => handleDelete(h._id)}
                      style={{
                        flex: 1,
                        borderRadius: 5,
                        padding: '5px 0',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        border: '1px solid rgba(255,61,87,0.25)',
                        background: 'rgba(255,61,87,0.08)',
                        color: 'var(--red)',
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더 보기 */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={() => fetchHighlights(page + 1)}
                disabled={loading}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border2)',
                  color: 'var(--muted2)',
                  borderRadius: 8,
                  padding: '8px 24px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? '불러오는 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
