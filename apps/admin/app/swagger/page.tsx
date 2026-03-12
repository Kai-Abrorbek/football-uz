import { PageLayout } from '../components/Layout';
import { Pill } from '../components/ui/Pill';

export default function SwaggerPage() {
  return (
    <PageLayout title="Swagger API">
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '13px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Pill color="#FFB800">Swagger UI</Pill>
          <span
            style={{
              fontSize: 11,
              color: 'var(--muted2)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            https://api.footballuz.uz/swagger
          </span>
        </div>
        {/* 실제 운영 시 아래 div를 iframe으로 교체 */}
        {/* <iframe src="https://api.footballuz.uz/swagger" style={{ width: '100%', height: 600, border: 'none' }} /> */}
        <div
          style={{
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <svg
            width={52}
            height={52}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
          <div style={{ color: 'var(--muted2)', fontSize: 13 }}>
            실제 구현 시 iframe으로 NestJS Swagger 임베드
          </div>
          <code
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: 'var(--cyan)',
              background: 'var(--surface)',
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border2)',
            }}
          >
            {'<iframe src="https://api.footballuz.uz/swagger" />'}
          </code>
        </div>
      </div>
    </PageLayout>
  );
}
