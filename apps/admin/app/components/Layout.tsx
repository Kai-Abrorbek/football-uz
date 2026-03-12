// 각 page에서 감싸는 공통 레이아웃 컴포넌트

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PageLayout({ title, children }: LayoutProps) {
  return (
    <>
      {/* Topbar */}
      <header
        style={{
          padding: '0 24px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted2)',
              display: 'flex',
            }}
          >
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: 'var(--red)',
                border: '2px solid var(--surface)',
              }}
            />
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border2)' }} />
          <span
            style={{
              fontSize: 10,
              color: 'var(--muted)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            v1.0.0
          </span>
        </div>
      </header>

      {/* Content */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}
        className="fade-in"
      >
        {children}
      </div>
    </>
  );
}
