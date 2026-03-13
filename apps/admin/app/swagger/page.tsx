import { PageLayout } from '../components/Layout';
import { Pill } from '../components/ui/Pill';

export default function SwaggerPage() {
  const swaggerUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '/api/docs') ??
    'http://localhost:4000/api/docs';

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
            {swaggerUrl}
          </span>
        </div>
        <iframe
          src={swaggerUrl}
          style={{ width: '100%', height: 700, border: 'none' }}
        />
      </div>
    </PageLayout>
  );
}
