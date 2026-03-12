import { PageLayout } from '../components/Layout';
import { SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';

const HIGHLIGHTS = [
  { title: 'Pakhtakor 결승골 vs Nasaf', match: 'UPL R11', views: '42.1k' },
  { title: 'Bunyodkor 멀티골 하이라이트', match: 'UPL R11', views: '28.7k' },
  { title: 'AGMK 극적인 동점골', match: 'AFC CL', views: '19.3k' },
  { title: 'Lokomotiv 3-0 대승', match: 'UPL R10', views: '15.2k' },
  { title: 'Navbahor 세이브 모음', match: 'UPL R10', views: '9.8k' },
  { title: '월드컵 예선 하이라이트', match: 'AFC WCQ', views: '87.4k' },
];

export default function HighlightsPage() {
  return (
    <PageLayout title="하이라이트">
      <SearchBar placeholder="하이라이트 검색..." />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
          gap: 12,
        }}
      >
        {HIGHLIGHTS.map((h, i) => (
          <div
            key={i}
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
                background: 'linear-gradient(135deg, #1a2035, #0f1520)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
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
              <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <Pill color="#FFB800">{h.views}</Pill>
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
                {h.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--muted2)',
                  marginBottom: 10,
                }}
              >
                {h.match}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
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
    </PageLayout>
  );
}
