interface PageCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function PageCard({ children, style }: PageCardProps) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '0.03em',
        }}
      >
        {title}
      </h3>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: 'rgba(0,229,255,0.1)',
            color: 'var(--cyan)',
            border: '1px solid rgba(0,229,255,0.25)',
            borderRadius: 6,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function SearchBar({ placeholder }: { placeholder?: string }) {
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <svg
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--muted2)',
          pointerEvents: 'none',
        }}
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={11} cy={11} r={8} />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        placeholder={placeholder ?? '검색...'}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 8,
          padding: '8px 12px 8px 34px',
          color: 'var(--text)',
          fontSize: 12,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
